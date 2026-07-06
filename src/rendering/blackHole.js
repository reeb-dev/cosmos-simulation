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

  // T_eff ∝ r^(-3/4) en disco delgado; tNorm=0 borde interno (más caliente)
  vec3 blackbodyColor(float tNorm) {
    float tempK = 3800.0 + pow(max(1.0 - tNorm, 0.02), 0.72) * 32000.0;
    float u = clamp((tempK - 3500.0) / 30000.0, 0.0, 1.0);
    vec3 col;
    col.r = min(1.0, 0.28 + u * 0.72);
    col.g = min(1.0, 0.06 + u * 0.78 + (1.0 - u) * 0.06);
    col.b = min(1.0, u * 0.96 + (1.0 - u) * 0.02);
    return col;
  }

  void main() {
    float tNorm = clamp((vRadius - innerRadius) / max(outerRadius - innerRadius, 0.001), 0.0, 1.0);
    float seam = min(smoothstep(0.0, 0.04, vUv.y), smoothstep(1.0, 0.96, vUv.y));
    float rot = vUv.y * 6.28318 + time * (0.32 + spin * 0.48);

    float turb = noise(vec2(rot * 2.2, time * 0.22)) * 0.12;
    float turbulence = (0.88 + turb) * seam;

    float doppler = 1.0 + spin * 0.78 * sin(rot - 0.25);
    doppler = clamp(doppler, 0.58, 1.55);
    float beam = smoothstep(0.62, 1.38, doppler);
    vec3 redshift = vec3(1.08, 0.82, 0.68);
    vec3 blueshift = vec3(0.82, 0.9, 1.12);

    vec3 color = blackbodyColor(tNorm);
    color *= mix(redshift, blueshift, beam) * exteriorTint;
    color *= 0.92 + 0.08 * turbulence;

    float innerHot = smoothstep(0.0, 0.15, 1.0 - tNorm);
    color += vec3(0.92, 0.95, 1.0) * innerHot * 0.12;

    float tubeCenter = 1.0 - abs(vTubeU - 0.5) * 2.0;
    float tubeProfile = pow(max(tubeCenter, 0.0), mix(1.1, 0.38, volumetric));
    float radialFade = smoothstep(innerRadius * 0.97, innerRadius * 1.1, vRadius)
                     * smoothstep(outerRadius * 1.05, outerRadius * 0.88, vRadius);

    float alpha;
    if (volumetric > 0.5) {
      alpha = tubeProfile * radialFade * turbulence * diskIntensity * haloStrength;
    } else {
      float rim = smoothstep(outerRadius, innerRadius * 1.01, vRadius);
      float fade = smoothstep(outerRadius * 0.98, innerRadius, vRadius);
      alpha = pow(rim * fade, mix(2.0, 4.0, thinness)) * turbulence * diskIntensity * haloStrength;
    }

    color = min(color, vec3(1.6));
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

function diskRadii(rs, innerMul = 2.55, outerMul = 8.5, tubeRatio = 0.55) {
  const inner = rs * innerMul;
  const outer = rs * outerMul;
  const major = (inner + outer) * 0.5;
  const tube = (outer - inner) * tubeRatio;
  return { inner, outer, major, tube };
}

const HALO_LAYERS = [
  { innerMul: 3.8, outerMul: 5.6, intensity: 0.52, strength: 0.44, tilt: 0.14, z: 0.0 },
  { innerMul: 4.4, outerMul: 6.4, intensity: 0.68, strength: 0.28, tilt: 0.1, z: 0.03 },
  { innerMul: 3.8, outerMul: 5.6, intensity: 0.48, strength: 0.4, tilt: -0.14, z: 0.0 },
  { innerMul: 4.4, outerMul: 6.4, intensity: 0.62, strength: 0.24, tilt: -0.1, z: -0.03 },
];

export function createBlackHole(rsVis, spin = 0, diskCfg = {}) {
  const innerMul = diskCfg.innerMul ?? 2.55;
  const outerMul = diskCfg.outerMul ?? 8.5;
  const tubeRatio = diskCfg.tubeRatio ?? 0.55;
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
    innerRadius: { value: rsVis * innerMul },
    outerRadius: { value: rsVis * outerMul },
    time: { value: 0 },
    spin: { value: spin },
    exteriorTint: { value: new THREE.Vector3(1, 1, 1) },
    diskIntensity: { value: 1.1 },
    haloStrength: { value: 1.0 },
    thinness: { value: 0.75 },
    volumetric: { value: 0.0 },
  };

  const { inner, outer, major, tube } = diskRadii(rsVis, innerMul, outerMul, tubeRatio);
  const diskMat = makeDiskMaterial({ ...baseUniforms });
  const disk = new THREE.Mesh(new THREE.RingGeometry(inner, outer, 320, 1), diskMat);
  disk.rotation.x = -Math.PI / 2;
  group.add(disk);

  const photonRingMat = new THREE.MeshBasicMaterial({
    color: 0xe8f2ff,
    transparent: true,
    opacity: 0.72,
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
    new THREE.TorusGeometry(rsVis * 1.51, rsVis * 0.018, 6, 128),
    new THREE.MeshBasicMaterial({
      color: 0xd0e4ff,
      transparent: true,
      opacity: 0.12,
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
    userData: { innerMul, outerMul, tubeRatio, useTorus: false },
    update: (rs, s = 0, cfg = {}) => updateBlackHole(group, rs, s, diskMat, photonRing, innerGlow, lensedHalos, {
      innerMul: cfg.innerMul ?? innerMul,
      outerMul: cfg.outerMul ?? outerMul,
      tubeRatio: cfg.tubeRatio ?? tubeRatio,
      volumetric: cfg.volumetric ?? 0,
    }),
  };
}

function updateBlackHole(group, rs, spin, diskMat, photonRing, innerGlow, lensedHalos, diskCfg = {}) {
  const innerMul = diskCfg.innerMul ?? 2.55;
  const outerMul = diskCfg.outerMul ?? 8.5;
  const tubeRatio = diskCfg.tubeRatio ?? 0.55;
  const volumetric = diskCfg.volumetric ?? 0;
  const useTorus = volumetric > 0.5;

  const horizon = group.children[0];
  const photonSphere = group.children[1];
  const disk = group.children[2];

  horizon.geometry.dispose();
  horizon.geometry = new THREE.SphereGeometry(rs, 64, 64);

  photonSphere.geometry.dispose();
  photonSphere.geometry = new THREE.SphereGeometry(rs * 1.5, 32, 32);

  const { inner, outer, major, tube } = diskRadii(rs, innerMul, outerMul, tubeRatio);

  const wasTorus = disk.userData.useTorus === true;
  if (wasTorus !== useTorus) {
    disk.geometry.dispose();
    disk.geometry = useTorus
      ? new THREE.TorusGeometry(major, tube, 64, 320)
      : new THREE.RingGeometry(inner, outer, 320, 1);
    disk.userData.useTorus = useTorus;
  } else {
    disk.geometry.dispose();
    disk.geometry = useTorus
      ? new THREE.TorusGeometry(major, tube, 64, 320)
      : new THREE.RingGeometry(inner, outer, 320, 1);
  }

  diskMat.uniforms.innerRadius.value = inner;
  diskMat.uniforms.outerRadius.value = outer;
  diskMat.uniforms.spin.value = spin;
  diskMat.uniforms.volumetric.value = volumetric;

  photonRing.geometry.dispose();
  photonRing.geometry = new THREE.TorusGeometry(rs * 1.5, rs * 0.012, 8, 256);

  innerGlow.geometry.dispose();
  innerGlow.geometry = new THREE.TorusGeometry(rs * 1.51, rs * 0.018, 6, 128);

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
