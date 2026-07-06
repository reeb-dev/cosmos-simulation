import * as THREE from 'three';

const DISK_VERT = `
  varying vec2 vUv;
  varying float vRadius;
  varying float vAngle;
  void main() {
    vUv = uv;
    vRadius = length(position.xy);
    vAngle = atan(position.y, position.x);
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
  varying vec2 vUv;
  varying float vRadius;
  varying float vAngle;

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
    float hot = pow(max(1.0 - tNorm, 0.015), 0.28);
    vec3 inner = vec3(1.0, 0.98, 0.94);
    vec3 mid   = vec3(1.0, 0.58, 0.14);
    vec3 outer = vec3(0.82, 0.18, 0.04);
    return mix(mix(outer, mid, smoothstep(0.0, 0.42, hot)), inner, smoothstep(0.38, 1.0, hot));
  }

  void main() {
    float r = vRadius;
    float tNorm = (r - innerRadius) / max(outerRadius - innerRadius, 0.001);
    float iscoGlow = pow(innerRadius / max(r, innerRadius * 0.92), 1.35);

    float rot = vAngle + time * (0.42 + spin * 0.62);
    float turb1 = noise(vec2(rot * 2.8, r * 0.35 - time * 0.55));
    float turb2 = noise(vec2(rot * 5.6 + 1.7, r * 0.62 + time * 0.28));
    float turbulence = mix(0.76, 1.0, turb1 * 0.55 + turb2 * 0.45);

    float doppler = 1.0 + spin * 0.92 * sin(vAngle - 0.25) + 0.18 * sin(vAngle * 2.0 + 0.6);
    doppler = clamp(doppler, 0.32, 2.05);
    vec3 warmBoost = vec3(1.22, 0.9, 0.68);
    vec3 coolBoost = vec3(0.62, 0.78, 1.05);
    float beam = smoothstep(0.35, 0.98, doppler);

    vec3 color = gargantuaColor(tNorm);
    color *= mix(coolBoost, warmBoost, beam) * exteriorTint;

    float innerRim = smoothstep(innerRadius * 1.12, innerRadius * 0.98, r);
    color += vec3(1.0, 0.99, 0.95) * innerRim * pow(iscoGlow, 0.55) * 0.85;

    float rim = smoothstep(outerRadius, innerRadius * 1.01, r);
    float fade = smoothstep(outerRadius * 0.98, innerRadius, r);
    float thinEdge = pow(rim * fade, mix(2.2, 4.8, thinness));
    float alpha = thinEdge * iscoGlow * turbulence * diskIntensity * haloStrength;
    if (alpha < 0.003) discard;
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

const HALO_LAYERS = [
  { innerMul: 3.8, outerMul: 5.6, intensity: 0.52, strength: 0.44, tilt: 0.14, z: 0.0 },
  { innerMul: 4.4, outerMul: 6.4, intensity: 0.68, strength: 0.28, tilt: 0.1, z: 0.03 },
  { innerMul: 3.8, outerMul: 5.6, intensity: 0.48, strength: 0.4, tilt: -0.14, z: 0.0 },
  { innerMul: 4.4, outerMul: 6.4, intensity: 0.62, strength: 0.24, tilt: -0.1, z: -0.03 },
];

export function createBlackHole(rsVis, spin = 0) {
  const group = new THREE.Group();
  group.userData.spin = spin;

  const horizonGeo = new THREE.SphereGeometry(rsVis, 64, 64);
  const horizonMat = new THREE.MeshBasicMaterial({ color: 0x000000, depthWrite: true });
  const horizon = new THREE.Mesh(horizonGeo, horizonMat);
  group.add(horizon);

  const photonSphereGeo = new THREE.SphereGeometry(rsVis * 1.5, 32, 32);
  const photonSphereMat = new THREE.MeshBasicMaterial({
    color: 0xff6600,
    wireframe: false,
    transparent: true,
    opacity: 0,
  });
  const photonSphere = new THREE.Mesh(photonSphereGeo, photonSphereMat);
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
    thinness: { value: 0.92 },
  };

  const diskMat = makeDiskMaterial({ ...baseUniforms });
  const diskInner = rsVis * 2.55;
  const diskOuter = rsVis * 8.5;
  const diskGeo = new THREE.RingGeometry(diskInner, diskOuter, 320, 1);
  const disk = new THREE.Mesh(diskGeo, diskMat);
  disk.rotation.x = -Math.PI / 2;
  group.add(disk);

  const photonRingMat = new THREE.MeshBasicMaterial({
    color: 0xfff8ee,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const photonRing = new THREE.Mesh(
    new THREE.TorusGeometry(rsVis * 1.5, rsVis * 0.016, 8, 192),
    photonRingMat
  );
  photonRing.rotation.x = -Math.PI / 2;
  group.add(photonRing);

  const lensedHalos = new THREE.Group();
  for (let i = 0; i < HALO_LAYERS.length; i++) {
    const layer = HALO_LAYERS[i];
    const inner = rsVis * layer.innerMul;
    const outer = rsVis * layer.outerMul;
    const haloMat = makeDiskMaterial({
      innerRadius: { value: inner },
      outerRadius: { value: outer },
      time: baseUniforms.time,
      spin: baseUniforms.spin,
      exteriorTint: baseUniforms.exteriorTint,
      diskIntensity: { value: layer.intensity },
      haloStrength: { value: layer.strength },
      thinness: { value: 0.95 },
    });
    const halo = new THREE.Mesh(new THREE.RingGeometry(inner, outer, 160, 1), haloMat);
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
    lensedHalos,
    photonSphere,
    update: (rs, s = 0) => updateBlackHole(group, rs, s),
  };
}

function updateBlackHole(group, rs, spin = 0) {
  const horizon = group.children[0];
  const photonSphere = group.children[1];
  const disk = group.children[2];
  const photonRing = group.children[3];
  const lensedHalos = group.children[4];

  horizon.geometry.dispose();
  horizon.geometry = new THREE.SphereGeometry(rs, 64, 64);

  photonSphere.geometry.dispose();
  photonSphere.geometry = new THREE.SphereGeometry(rs * 1.5, 32, 32);

  const diskInner = rs * 2.55;
  const diskOuter = rs * 8.5;
  disk.geometry.dispose();
  disk.geometry = new THREE.RingGeometry(diskInner, diskOuter, 320, 1);
  disk.material.uniforms.innerRadius.value = diskInner;
  disk.material.uniforms.outerRadius.value = diskOuter;
  disk.material.uniforms.spin.value = spin;

  photonRing.geometry.dispose();
  photonRing.geometry = new THREE.TorusGeometry(rs * 1.5, rs * 0.016, 8, 192);

  lensedHalos.children.forEach((halo, i) => {
    const layer = HALO_LAYERS[i];
    const inner = rs * layer.innerMul;
    const outer = rs * layer.outerMul;
    halo.geometry.dispose();
    halo.geometry = new THREE.RingGeometry(inner, outer, 160, 1);
    halo.userData.haloMat.uniforms.innerRadius.value = inner;
    halo.userData.haloMat.uniforms.outerRadius.value = outer;
    halo.userData.haloMat.uniforms.spin.value = spin;
    halo.userData.baseHaloStrength = layer.strength;
  });
}
