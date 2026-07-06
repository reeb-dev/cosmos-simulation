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
  varying vec2 vUv;
  varying float vRadius;
  varying float vAngle;

  vec3 gargantuaColor(float tNorm) {
    float hot = pow(max(1.0 - tNorm, 0.02), 0.35);
    vec3 inner = vec3(1.0, 0.97, 0.92);
    vec3 mid   = vec3(1.0, 0.62, 0.18);
    vec3 outer = vec3(0.75, 0.22, 0.06);
    return mix(mix(outer, mid, smoothstep(0.0, 0.45, hot)), inner, smoothstep(0.45, 1.0, hot));
  }

  void main() {
    float r = vRadius;
    float tNorm = (r - innerRadius) / max(outerRadius - innerRadius, 0.001);
    float iscoGlow = pow(innerRadius / max(r, innerRadius * 0.95), 1.1);

    float rot = vAngle + time * (0.35 + spin * 0.5);
    float turbulence = sin(rot * 8.0 + r * 0.55 - time * 1.2) * 0.5 + 0.5;
    turbulence = mix(0.82, 1.0, turbulence);

    float doppler = 1.0 + spin * 0.55 * sin(vAngle) + 0.25 * sin(vAngle + 0.4);
    doppler = clamp(doppler, 0.35, 1.85);

    vec3 color = gargantuaColor(tNorm) * doppler * exteriorTint;
    float rim = smoothstep(outerRadius, innerRadius * 1.02, r);
    float fade = smoothstep(outerRadius, innerRadius, r);
    float alpha = rim * fade * iscoGlow * turbulence * diskIntensity * haloStrength;
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
    innerRadius: { value: rsVis * 2.8 },
    outerRadius: { value: rsVis * 10 },
    time: { value: 0 },
    spin: { value: spin },
    exteriorTint: { value: new THREE.Vector3(1, 1, 1) },
    diskIntensity: { value: 1.1 },
    haloStrength: { value: 1.0 },
  };

  const diskMat = makeDiskMaterial({ ...baseUniforms });
  const diskInner = rsVis * 2.8;
  const diskOuter = rsVis * 10;
  const diskGeo = new THREE.RingGeometry(diskInner, diskOuter, 256, 1);
  const disk = new THREE.Mesh(diskGeo, diskMat);
  disk.rotation.x = -Math.PI / 2;
  group.add(disk);

  const photonRingMat = new THREE.MeshBasicMaterial({
    color: 0xffeedd,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const photonRing = new THREE.Mesh(
    new THREE.TorusGeometry(rsVis * 1.5, rsVis * 0.035, 12, 128),
    photonRingMat
  );
  photonRing.rotation.x = -Math.PI / 2;
  group.add(photonRing);

  const lensedHalos = new THREE.Group();
  for (let i = 0; i < 2; i++) {
    const haloMat = makeDiskMaterial({
      innerRadius: { value: rsVis * (4.0 + i * 0.6) },
      outerRadius: { value: rsVis * (6.2 + i * 0.5) },
      time: baseUniforms.time,
      spin: baseUniforms.spin,
      exteriorTint: baseUniforms.exteriorTint,
      diskIntensity: { value: 0.85 },
      haloStrength: { value: 0.38 - i * 0.08 },
    });
    const halo = new THREE.Mesh(
      new THREE.RingGeometry(rsVis * (4.0 + i * 0.6), rsVis * (6.2 + i * 0.5), 128, 1),
      haloMat
    );
    halo.rotation.x = Math.PI / 2 + (i === 0 ? 0.08 : -0.08);
    halo.rotation.z = i * Math.PI * 0.02;
    halo.userData.haloMat = haloMat;
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

  const diskInner = rs * 2.8;
  const diskOuter = rs * 10;
  disk.geometry.dispose();
  disk.geometry = new THREE.RingGeometry(diskInner, diskOuter, 256, 1);
  disk.material.uniforms.innerRadius.value = diskInner;
  disk.material.uniforms.outerRadius.value = diskOuter;
  disk.material.uniforms.spin.value = spin;

  photonRing.geometry.dispose();
  photonRing.geometry = new THREE.TorusGeometry(rs * 1.5, rs * 0.035, 12, 128);

  lensedHalos.children.forEach((halo, i) => {
    const inner = rs * (4.0 + i * 0.6);
    const outer = rs * (6.2 + i * 0.5);
    halo.geometry.dispose();
    halo.geometry = new THREE.RingGeometry(inner, outer, 128, 1);
    halo.userData.haloMat.uniforms.innerRadius.value = inner;
    halo.userData.haloMat.uniforms.outerRadius.value = outer;
    halo.userData.haloMat.uniforms.spin.value = spin;
  });
}
