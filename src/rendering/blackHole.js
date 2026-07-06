import * as THREE from 'three';

export function createBlackHole(rsVis, spin = 0) {
  const group = new THREE.Group();
  group.userData.spin = spin;

  const horizonGeo = new THREE.SphereGeometry(rsVis, 64, 64);
  const horizonMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const horizon = new THREE.Mesh(horizonGeo, horizonMat);
  group.add(horizon);

  const photonSphereGeo = new THREE.SphereGeometry(rsVis * 1.5, 32, 32);
  const photonSphereMat = new THREE.MeshBasicMaterial({
    color: 0xff6600,
    wireframe: true,
    transparent: true,
    opacity: 0.15,
  });
  const photonSphere = new THREE.Mesh(photonSphereGeo, photonSphereMat);
  group.add(photonSphere);

  const diskInner = rsVis * 3;
  const diskOuter = rsVis * 12;
  const diskGeo = new THREE.RingGeometry(diskInner, diskOuter, 128, 8);
  const diskMat = new THREE.ShaderMaterial({
    uniforms: {
      innerRadius: { value: diskInner },
      outerRadius: { value: diskOuter },
      time: { value: 0 },
      spin: { value: spin },
      exteriorTint: { value: new THREE.Vector3(1, 1, 1) },
    },
    vertexShader: `
      varying vec2 vUv;
      varying float vRadius;
      void main() {
        vUv = uv;
        vRadius = length(position.xy);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float innerRadius;
      uniform float outerRadius;
      uniform float time;
      uniform float spin;
      uniform vec3 exteriorTint;
      varying vec2 vUv;
      varying float vRadius;

      void main() {
        float r = vRadius;
        float t = pow(innerRadius / max(r, innerRadius), 0.75);
        float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
        float spiral = sin(angle * 6.0 - time * 2.0 + r * 0.5 + spin * 4.0) * 0.5 + 0.5;
        float doppler = 1.0 + spin * 0.3 * sin(angle);

        vec3 hot = vec3(1.0, 0.9, 0.7);
        vec3 warm = vec3(1.0, 0.4, 0.1);
        vec3 cool = vec3(0.8, 0.1, 0.05);

        float blend = (r - innerRadius) / (outerRadius - innerRadius);
        vec3 color = mix(hot, warm, blend);
        color = mix(color, cool, blend * blend);

        float alpha = smoothstep(outerRadius, innerRadius, r) * (0.6 + 0.4 * spiral) * t * doppler;
        color *= exteriorTint;
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const disk = new THREE.Mesh(diskGeo, diskMat);
  disk.rotation.x = -Math.PI / 2;
  group.add(disk);

  return { group, horizon, disk, diskMat, photonSphere, update: (rs, s = 0) => updateBlackHole(group, rs, s) };
}

function updateBlackHole(group, rs, spin = 0) {
  const horizon = group.children[0];
  const photonSphere = group.children[1];
  const disk = group.children[2];

  horizon.geometry.dispose();
  horizon.geometry = new THREE.SphereGeometry(rs, 64, 64);

  photonSphere.geometry.dispose();
  photonSphere.geometry = new THREE.SphereGeometry(rs * 1.5, 32, 32);

  const diskInner = rs * 3;
  const diskOuter = rs * 12;
  disk.geometry.dispose();
  disk.geometry = new THREE.RingGeometry(diskInner, diskOuter, 128, 8);
  disk.material.uniforms.innerRadius.value = diskInner;
  disk.material.uniforms.outerRadius.value = diskOuter;
  if (disk.material.uniforms.spin) disk.material.uniforms.spin.value = spin;
}
