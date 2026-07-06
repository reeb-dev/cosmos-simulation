import * as THREE from 'three';

const DISK_VERT = `
  varying vec2 vUv;
  varying float vRadius;
  varying float vTubeU;
  void main() {
    vUv = uv;
    vRadius = length(position.xz);
    vTubeU = uv.x;
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
  varying float vRadius;
  varying float vTubeU;

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
    float hot = pow(max(1.0 - tNorm, 0.02), 0.28);
    vec3 inner = vec3(1.0, 0.96, 0.88);
    vec3 mid   = vec3(1.0, 0.48, 0.08);
    vec3 outer = vec3(0.68, 0.12, 0.02);
    return mix(mix(outer, mid, smoothstep(0.0, 0.5, hot)), inner, smoothstep(0.4, 1.0, hot));
  }

  void main() {
    float tNorm = clamp((vRadius - innerRadius) / max(outerRadius - innerRadius, 0.001), 0.0, 1.0);
    float seam = min(smoothstep(0.0, 0.04, vUv.y), smoothstep(1.0, 0.96, vUv.y));
    float rot = vUv.y * 6.28318 + time * (0.38 + spin * 0.55);

    float turb1 = noise(vec2(rot * 1.4, time * 0.35));
    float turb2 = noise(vec2(rot * 3.2 + 2.1, time * 0.18));
    float turb3 = noise(vec2(rot * 6.5, time * 0.42));
    float turbulence = (0.62 + turb1 * 0.22 + turb2 * 0.1 + turb3 * 0.06) * seam;

    float dustLane = smoothstep(0.36, 0.46, noise(vec2(rot * 2.1, 0.7)))
                   * smoothstep(0.64, 0.54, noise(vec2(rot * 1.3 + 4.0, 1.2)));
    float filament = pow(turb3, 2.2) * 0.55;

    float doppler = 1.0 + spin * 0.85 * sin(rot - 0.2) + 0.12 * sin(rot * 2.0);
    doppler = clamp(doppler, 0.35, 1.85);
    vec3 warmBoost = vec3(1.15, 0.88, 0.68);
    vec3 coolBoost = vec3(0.58, 0.72, 1.0);
    float beam = smoothstep(0.35, 0.92, doppler);

    vec3 color = gargantuaColor(tNorm);
    color *= mix(coolBoost, warmBoost, beam) * exteriorTint;
    color *= 1.0 - dustLane * 0.62;
    color += vec3(1.0, 0.92, 0.78) * filament * 0.28;

    float innerHot = smoothstep(0.0, 0.18, 1.0 - tNorm);
    color += vec3(1.0, 0.95, 0.85) * innerHot * 0.22;

    float tubeCenter = 1.0 - abs(vTubeU - 0.5) * 2.0;
    float tubeProfile = pow(max(tubeCenter, 0.0), mix(1.1, 0.32, volumetric));
    float radialFade = smoothstep(innerRadius * 0.97, innerRadius * 1.1, vRadius)
                     * smoothstep(outerRadius * 1.05, outerRadius * 0.88, vRadius);

    float alpha;
    if (volumetric > 0.5) {
      alpha = tubeProfile * radialFade * turbulence * diskIntensity * haloStrength;
      alpha *= 0.78 + 0.22 * innerHot;
    } else {
      float rim = smoothstep(outerRadius, innerRadius * 1.01, vRadius);
      float fade = smoothstep(outerRadius * 0.98, innerRadius, vRadius);
      alpha = pow(rim * fade, mix(2.0, 4.5, thinness)) * turbulence * diskIntensity * haloStrength;
    }

    color = min(color, vec3(2.2));
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(color, alpha);
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

const HALO_LAYERS = [
  { innerMul: 3.8, outerMul: 5.6, intensity: 0.52, strength: 0.44, tilt: 0.14, z: 0.0 },
  { innerMul: 4.4, outerMul: 6.4, intensity: 0.68, strength: 0.28, tilt: 0.1, z: 0.03 },
  { innerMul: 3.8, outerMul: 5.6, intensity: 0.48, strength: 0.4, tilt: -0.14, z: 0.0 },
  { innerMul: 4.4, outerMul: 6.4, intensity: 0.62, strength: 0.24, tilt: -0.1, z: -0.03 },
];

export function createBlackHole(rsVis, spin = 0) {
  const group = new THREE.Group();
  group.userData.spin = spin;

  const horizon = new THREE.Mesh(
    new THREE.SphereGeometry(rsVis, 64, 64),
    new THREE.MeshBasicMaterial({ color: 0x000000, depthWrite: true }),
  );
  group.add(horizon);

  const photonSphere = new THREE.Mesh(
    new THREE.SphereGeometry(rsVis * 1.5, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0xff6600,
      wireframe: false,
      transparent: true,
      opacity: 0,
    }),
  );
  photonSphere.visible = false;
  group.add(photonSphere);

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

  const { inner, outer } = diskRadii(rsVis);
  const major = (inner + outer) * 0.5;
  const tube = (outer - inner) * 0.55;
  const diskMat = makeDiskMaterial({ ...baseUniforms });
  const disk = new THREE.Mesh(new THREE.TorusGeometry(major, tube, 64, 320), diskMat);
  disk.rotation.x = -Math.PI / 2;
  group.add(disk);

  const photonRingMat = new THREE.MeshBasicMaterial({
    color: 0xfff4e0,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const photonRing = new THREE.Mesh(
    new THREE.TorusGeometry(rsVis * 1.5, rsVis * 0.012, 8, 256),
    photonRingMat,
  );
  photonRing.rotation.x = -Math.PI / 2;
  group.add(photonRing);

  const innerGlow = new THREE.Mesh(
    new THREE.TorusGeometry(rsVis * 1.51, rsVis * 0.022, 6, 128),
    new THREE.MeshBasicMaterial({
      color: 0xffe8c8,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  innerGlow.rotation.x = -Math.PI / 2;
  group.add(innerGlow);

  const lensedHalos = new THREE.Group();
  for (let i = 0; i < HALO_LAYERS.length; i++) {
    const layer = HALO_LAYERS[i];
    const hInner = rsVis * layer.innerMul;
    const hOuter = rsVis * layer.outerMul;
    const haloMat = makeDiskMaterial({
      innerRadius: { value: hInner },
      outerRadius: { value: hOuter },
      time: baseUniforms.time,
      spin: baseUniforms.spin,
      exteriorTint: baseUniforms.exteriorTint,
      diskIntensity: { value: layer.intensity },
      haloStrength: { value: layer.strength },
      thinness: { value: 0.95 },
      volumetric: { value: 0.0 },
    });
    const halo = new THREE.Mesh(new THREE.RingGeometry(hInner, hOuter, 160, 1), haloMat);
    halo.rotation.x = Math.PI / 2 + layer.tilt;
    halo.rotation.z = layer.z;
    halo.userData.haloMat = haloMat;
    halo.userData.baseHaloStrength = layer.strength;
    lensedHalos.add(halo);
  }
  group.add(lensedHalos);

  return {
    group,
    horizon,
    disk,
    diskMat,
    photonRing,
    photonRingMat,
    innerGlow,
    lensedHalos,
    photonSphere,
    update: (rs, s = 0) => updateBlackHole(group, rs, s, diskMat, photonRing, innerGlow, lensedHalos),
  };
}

function updateBlackHole(group, rs, spin, diskMat, photonRing, innerGlow, lensedHalos) {
  const horizon = group.children[0];
  const photonSphere = group.children[1];
  const disk = group.children[2];

  horizon.geometry.dispose();
  horizon.geometry = new THREE.SphereGeometry(rs, 64, 64);

  photonSphere.geometry.dispose();
  photonSphere.geometry = new THREE.SphereGeometry(rs * 1.5, 32, 32);

  const { inner, outer } = diskRadii(rs);
  const major = (inner + outer) * 0.5;
  const tube = (outer - inner) * 0.55;

  disk.geometry.dispose();
  disk.geometry = new THREE.TorusGeometry(major, tube, 64, 320);
  diskMat.uniforms.innerRadius.value = inner;
  diskMat.uniforms.outerRadius.value = outer;
  diskMat.uniforms.spin.value = spin;

  photonRing.geometry.dispose();
  photonRing.geometry = new THREE.TorusGeometry(rs * 1.5, rs * 0.012, 8, 256);

  innerGlow.geometry.dispose();
  innerGlow.geometry = new THREE.TorusGeometry(rs * 1.51, rs * 0.022, 6, 128);

  lensedHalos.children.forEach((halo, i) => {
    const layer = HALO_LAYERS[i];
    const hInner = rs * layer.innerMul;
    const hOuter = rs * layer.outerMul;
    halo.geometry.dispose();
    halo.geometry = new THREE.RingGeometry(hInner, hOuter, 160, 1);
    halo.userData.haloMat.uniforms.innerRadius.value = hInner;
    halo.userData.haloMat.uniforms.outerRadius.value = hOuter;
    halo.userData.haloMat.uniforms.spin.value = spin;
    halo.userData.baseHaloStrength = layer.strength;
  });
}
