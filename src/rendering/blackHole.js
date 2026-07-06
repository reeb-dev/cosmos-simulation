import * as THREE from 'three';

const DISK_VERT = `
  varying vec2 vUv;
  varying float vMajorT;
  varying float vTubeT;
  void main() {
    vUv = uv;
    vMajorT = uv.x;
    vTubeT = uv.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const DISK_FRAG = `
  uniform float innerRadius;
  uniform float outerRadius;
  uniform float time;
  uniform float spin;
  uniform vec3 exteriorTint;
  uniform float diskIntensity;
  uniform float haloStrength;
  uniform float thinness;
  uniform float volumetric;
  varying vec2 vUv;
  varying float vMajorT;
  varying float vTubeT;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  vec3 gargantuaColor(float tNorm) {
    float hot = pow(max(1.0 - tNorm, 0.012), 0.22);
    vec3 inner = vec3(1.0, 0.99, 0.96);
    vec3 mid   = vec3(1.0, 0.52, 0.1);
    vec3 outer = vec3(0.75, 0.14, 0.03);
    return mix(mix(outer, mid, smoothstep(0.0, 0.45, hot)), inner, smoothstep(0.32, 1.0, hot));
  }

  void main() {
    float tNorm = vMajorT;
    float rot = vMajorT * 6.28318 + time * (0.38 + spin * 0.55);

    float turb1 = noise(vec2(rot * 1.4, time * 0.35));
    float turb2 = noise(vec2(rot * 3.2 + 2.1, time * 0.18));
    float turb3 = noise(vec2(rot * 6.5, time * 0.42));
    float turbulence = 0.55 + turb1 * 0.25 + turb2 * 0.12 + turb3 * 0.08;

    float dustLane = smoothstep(0.38, 0.48, noise(vec2(rot * 2.1, 0.7)))
                   * smoothstep(0.62, 0.52, noise(vec2(rot * 1.3 + 4.0, 1.2)));
    float filament = pow(turb3, 2.5) * 0.85;

    float doppler = 1.0 + spin * 0.95 * sin(rot - 0.2) + 0.15 * sin(rot * 2.0);
    doppler = clamp(doppler, 0.28, 2.1);
    vec3 warmBoost = vec3(1.28, 0.95, 0.72);
    vec3 coolBoost = vec3(0.55, 0.72, 1.08);
    float beam = smoothstep(0.32, 0.95, doppler);

    vec3 color = gargantuaColor(tNorm);
    color *= mix(coolBoost, warmBoost, beam) * exteriorTint;
    color *= 1.0 - dustLane * 0.55;
    color += vec3(1.0, 0.98, 0.92) * filament * 0.45;

    float innerHot = smoothstep(0.0, 0.22, 1.0 - tNorm);
    color += vec3(1.0, 1.0, 0.98) * innerHot * 0.55;

    float tubeCenter = 1.0 - abs(vTubeT - 0.5) * 2.0;
    float tubeProfile = pow(max(tubeCenter, 0.0), mix(1.1, 0.42, volumetric));
    float edgeFade = smoothstep(0.0, 0.08, tNorm) * smoothstep(1.0, 0.88, tNorm);

    float alpha;
    if (volumetric > 0.5) {
      alpha = tubeProfile * edgeFade * turbulence * diskIntensity * haloStrength;
      alpha *= 0.85 + 0.15 * innerHot;
    } else {
      float rim = smoothstep(outerRadius, innerRadius * 1.01, innerRadius + tNorm * (outerRadius - innerRadius));
      float fade = smoothstep(outerRadius * 0.98, innerRadius, innerRadius + tNorm * (outerRadius - innerRadius));
      alpha = pow(rim * fade, mix(2.0, 4.5, thinness)) * turbulence * diskIntensity * haloStrength;
    }

    if (alpha < 0.004) discard;
    gl_FragColor = vec4(color * alpha, alpha);
  }
`;

function makeDiskMaterial(uniforms) {
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: DISK_VERT,
    fragmentShader: DISK_FRAG,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

function diskRadii(rs) {
  return { inner: rs * 2.55, outer: rs * 8.5 };
}

function createVolumetricDisk(rs, uniforms) {
  const { inner, outer } = diskRadii(rs);
  const major = (inner + outer) * 0.5;
  const tube = (outer - inner) * 0.42;
  const geo = new THREE.TorusGeometry(major, tube, 48, 256);
  const mesh = new THREE.Mesh(geo, makeDiskMaterial(uniforms));
  mesh.rotation.x = -Math.PI / 2;
  return { mesh, major, tube, inner, outer };
}

export function createBlackHole(rsVis, spin = 0) {
  const group = new THREE.Group();
  group.userData.spin = spin;

  const horizon = new THREE.Mesh(
    new THREE.SphereGeometry(rsVis, 64, 64),
    new THREE.MeshBasicMaterial({ color: 0x000000, depthWrite: true }),
  );
  group.add(horizon);

  const baseUniforms = {
    innerRadius: { value: rsVis * 2.55 },
    outerRadius: { value: rsVis * 8.5 },
    time: { value: 0 },
    spin: { value: spin },
    exteriorTint: { value: new THREE.Vector3(1, 1, 1) },
    diskIntensity: { value: 1.25 },
    haloStrength: { value: 1.0 },
    thinness: { value: 0.75 },
    volumetric: { value: 1.0 },
  };

  const { mesh: disk, major, tube } = createVolumetricDisk(rsVis, baseUniforms);
  const diskMat = disk.material;
  group.add(disk);

  const photonRingMat = new THREE.MeshBasicMaterial({
    color: 0xfffaf0,
    transparent: true,
    opacity: 0.98,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const photonRing = new THREE.Mesh(
    new THREE.TorusGeometry(rsVis * 1.5, rsVis * 0.028, 12, 256),
    photonRingMat,
  );
  photonRing.rotation.x = -Math.PI / 2;
  group.add(photonRing);

  const innerGlow = new THREE.Mesh(
    new THREE.TorusGeometry(rsVis * 1.52, rsVis * 0.055, 8, 128),
    new THREE.MeshBasicMaterial({
      color: 0xffeedd,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  innerGlow.rotation.x = -Math.PI / 2;
  group.add(innerGlow);

  return {
    group,
    horizon,
    disk,
    diskMat,
    photonRing,
    photonRingMat,
    innerGlow,
    lensedHalos: null,
    update: (rs, s = 0) => updateBlackHole(group, rs, s, diskMat, photonRing, innerGlow),
  };
}

function updateBlackHole(group, rs, spin, diskMat, photonRing, innerGlow) {
  const horizon = group.children[0];
  const disk = group.children[1];

  horizon.geometry.dispose();
  horizon.geometry = new THREE.SphereGeometry(rs, 64, 64);

  const { inner, outer } = diskRadii(rs);
  const major = (inner + outer) * 0.5;
  const tube = (outer - inner) * 0.42;

  disk.geometry.dispose();
  disk.geometry = new THREE.TorusGeometry(major, tube, 48, 256);
  diskMat.uniforms.innerRadius.value = inner;
  diskMat.uniforms.outerRadius.value = outer;
  diskMat.uniforms.spin.value = spin;

  photonRing.geometry.dispose();
  photonRing.geometry = new THREE.TorusGeometry(rs * 1.5, rs * 0.028, 12, 256);

  innerGlow.geometry.dispose();
  innerGlow.geometry = new THREE.TorusGeometry(rs * 1.52, rs * 0.055, 8, 128);
}
