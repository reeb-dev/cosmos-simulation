import * as THREE from 'three';

const STATUS_COLORS = {
  orbiting: 0x4488ff,
  captured: 0xff2244,
  escaped: 0x44ff88,
};

export function createParticleSystem(maxParticles = 20) {
  const group = new THREE.Group();
  const particles = [];
  const trailLines = [];

  for (let i = 0; i < maxParticles; i++) {
    const geo = new THREE.SphereGeometry(0.6, 16, 16);
    const mat = new THREE.MeshBasicMaterial({ color: 0x4488ff });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.visible = false;
    group.add(mesh);

    const lineGeo = new THREE.BufferGeometry();
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x4488ff,
      transparent: true,
      opacity: 0.5,
    });
    const line = new THREE.Line(lineGeo, lineMat);
    line.visible = false;
    group.add(line);

    particles.push(mesh);
    trailLines.push(line);
  }

  function update(states) {
    for (let i = 0; i < particles.length; i++) {
      if (i < states.length) {
        const s = states[i];
        const color = STATUS_COLORS[s.status] ?? 0x4488ff;

        particles[i].visible = true;
        particles[i].position.set(s.x, s.y, s.z);
        particles[i].material.color.setHex(color);

        trailLines[i].visible = s.trail.length > 1;
        const positions = new Float32Array(s.trail.length * 3);
        for (let j = 0; j < s.trail.length; j++) {
          positions[j * 3] = s.trail[j].x;
          positions[j * 3 + 1] = s.trail[j].y;
          positions[j * 3 + 2] = s.trail[j].z;
        }
        trailLines[i].geometry.setAttribute(
          'position',
          new THREE.BufferAttribute(positions, 3)
        );
        trailLines[i].material.color.setHex(color);
      } else {
        particles[i].visible = false;
        trailLines[i].visible = false;
      }
    }
  }

  return { group, update };
}
