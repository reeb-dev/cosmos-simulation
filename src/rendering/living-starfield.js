import * as THREE from 'three';

export function createLivingStarfield(count = 5000, radius = 200) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const baseColors = new Float32Array(count * 3);
  const twinklePhase = new Float32Array(count);
  const twinkleSpeed = new Float32Array(count);
  const comovingPositions = [];
  const alive = new Uint8Array(count);

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radius * (0.3 + 0.7 * Math.random());

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    comovingPositions.push({ x, y, z });
    alive[i] = 1;
    twinklePhase[i] = Math.random() * Math.PI * 2;
    twinkleSpeed[i] = 0.5 + Math.random() * 2.5;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const temp = 0.5 + Math.random() * 0.5;
    baseColors[i * 3] = 0.6 + 0.4 * temp;
    baseColors[i * 3 + 1] = 0.7 + 0.3 * temp;
    baseColors[i * 3 + 2] = 1.0;
    colors[i * 3] = baseColors[i * 3];
    colors[i * 3 + 1] = baseColors[i * 3 + 1];
    colors[i * 3 + 2] = baseColors[i * 3 + 2];
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 1.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geometry, material);
  let time = 0;

  function initStar(i) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radius * (0.3 + 0.7 * Math.random());
    comovingPositions[i] = {
      x: r * Math.sin(phi) * Math.cos(theta),
      y: r * Math.sin(phi) * Math.sin(theta),
      z: r * Math.cos(phi),
    };
    alive[i] = 1;
    const temp = 0.5 + Math.random() * 0.5;
    baseColors[i * 3] = 0.6 + 0.4 * temp;
    baseColors[i * 3 + 1] = 0.7 + 0.3 * temp;
    baseColors[i * 3 + 2] = 1.0;
  }

  function update(scaleFactor, dt = 0.016, vitality = 0.5, waveDisplacementAt = null) {
    time += dt;
    const pos = geometry.attributes.position.array;
    const col = geometry.attributes.color.array;

    for (let i = 0; i < count; i++) {
      if (!alive[i]) continue;
      let x = comovingPositions[i].x * scaleFactor;
      let y = comovingPositions[i].y * scaleFactor;
      let z = comovingPositions[i].z * scaleFactor;

      if (waveDisplacementAt) {
        const disp = waveDisplacementAt(x, y, z);
        if (disp > 0.001) {
          const len = Math.sqrt(x * x + y * y + z * z) || 1;
          x += (x / len) * disp * 3.5;
          y += (y / len) * disp * 3.5;
          z += (z / len) * disp * 3.5;
        }
      }

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      const tw = 0.6 + 0.4 * Math.sin(time * twinkleSpeed[i] + twinklePhase[i]);
      const v = 0.5 + vitality * 0.5;
      col[i * 3] = baseColors[i * 3] * tw * v;
      col[i * 3 + 1] = baseColors[i * 3 + 1] * tw * v;
      col[i * 3 + 2] = baseColors[i * 3 + 2] * tw;
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
    material.size = 1.0 + vitality * 0.6;
  }

  function birthStar() {
    const i = Math.floor(Math.random() * count);
    initStar(i);
    baseColors[i * 3] = 1;
    baseColors[i * 3 + 1] = 0.9;
    baseColors[i * 3 + 2] = 0.7;
  }

  function deathStar() {
    const i = Math.floor(Math.random() * count);
    alive[i] = 0;
    const pos = geometry.attributes.position.array;
    pos[i * 3] = pos[i * 3 + 1] = pos[i * 3 + 2] = 9999;
  }

  function reset() {
    time = 0;
    for (let i = 0; i < count; i++) initStar(i);
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
  }

  return { points, update, birthStar, deathStar, reset, comovingPositions };
}

export function createCosmicGrid(size = 200, divisions = 20) {
  const grid = new THREE.GridHelper(size, divisions, 0x113355, 0x0a1a2a);
  grid.position.y = -30;

  function update(scaleFactor, pulse = 0, waveDisplacementAt = null) {
    const s = scaleFactor * (1 + pulse * 0.02);
    grid.scale.set(s, 1, s);
    const mats = Array.isArray(grid.material) ? grid.material : [grid.material];
    for (const m of mats) {
      m.transparent = true;
      m.opacity = 0.35 + pulse * 0.25;
    }
    if (waveDisplacementAt) {
      const wobble = waveDisplacementAt(0, grid.position.y, 0);
      grid.position.y = -30 + wobble * 2.5;
    } else {
      grid.position.y = -30;
    }
  }

  return { grid, update };
}
