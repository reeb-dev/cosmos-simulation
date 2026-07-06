import * as THREE from 'three';

/** Clasificación espectral OBAFGKM con función inicial de masa (más enanas M) */
const SPECTRAL_CLASSES = [
  { type: 'O', mass: 60, temp: 40000, weight: 0.00003, color: [0.6, 0.7, 1.0] },
  { type: 'B', mass: 10, temp: 20000, weight: 0.0013, color: [0.7, 0.8, 1.0] },
  { type: 'A', mass: 2.5, temp: 9000, weight: 0.006, color: [0.85, 0.9, 1.0] },
  { type: 'F', mass: 1.5, temp: 7000, weight: 0.03, color: [1.0, 0.95, 0.9] },
  { type: 'G', mass: 1.0, temp: 5800, weight: 0.076, color: [1.0, 0.95, 0.8] },
  { type: 'K', mass: 0.7, temp: 4500, weight: 0.12, color: [1.0, 0.75, 0.45] },
  { type: 'M', mass: 0.3, temp: 3200, weight: 0.76, color: [1.0, 0.55, 0.35] },
];

function pickSpectralClass() {
  const r = Math.random();
  let acc = 0;
  for (const c of SPECTRAL_CLASSES) {
    acc += c.weight;
    if (r <= acc) return c;
  }
  return SPECTRAL_CLASSES[SPECTRAL_CLASSES.length - 1];
}

function makeNebulaPatch(radius, seed) {
  const group = new THREE.Group();
  const rng = (n) => {
    const x = Math.sin(seed * 97.3 + n * 43.1) * 19134.21;
    return x - Math.floor(x);
  };
  const colors = [
    new THREE.Color(0.9, 0.2, 0.35), // Hα emisión
    new THREE.Color(0.25, 0.55, 1.0), // OIII
    new THREE.Color(0.85, 0.45, 0.2), // polvo
  ];
  const col = colors[Math.floor(rng(0) * colors.length)];
  const pts = new Float32Array(80 * 3);
  const cols = new Float32Array(80 * 3);
  const cx = (rng(1) - 0.5) * radius * 1.6;
  const cy = (rng(2) - 0.5) * radius * 0.5;
  const cz = (rng(3) - 0.5) * radius * 1.6;
  for (let i = 0; i < 80; i++) {
    const spread = 4 + rng(i + 10) * 12;
    pts[i * 3] = cx + (rng(i + 20) - 0.5) * spread;
    pts[i * 3 + 1] = cy + (rng(i + 30) - 0.5) * spread * 0.4;
    pts[i * 3 + 2] = cz + (rng(i + 40) - 0.5) * spread;
    const fade = 0.15 + rng(i + 50) * 0.35;
    cols[i * 3] = col.r * fade;
    cols[i * 3 + 1] = col.g * fade;
    cols[i * 3 + 2] = col.b * fade;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  const mesh = new THREE.Points(
    geo,
    new THREE.PointsMaterial({ size: 3.5, vertexColors: true, transparent: true, opacity: 0.35, sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending })
  );
  group.add(mesh);
  group.userData = { cx, cy, cz, pulse: rng(60) * Math.PI * 2 };
  return group;
}

export function createLivingStarfield(count = 5000, radius = 200, options = {}) {
  const cinematic = options.cinematic ?? false;
  const starCount = cinematic ? Math.floor(count * 1.6) : count;

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  const baseColors = new Float32Array(starCount * 3);
  const twinklePhase = new Float32Array(starCount);
  const twinkleSpeed = new Float32Array(starCount);
  const starSizes = new Float32Array(starCount);
  const spectralTypes = new Array(starCount);
  const comovingPositions = [];
  const alive = new Uint8Array(starCount);

  const nebulaGroup = new THREE.Group();
  const nebulaCount = cinematic ? 14 : 8;
  for (let n = 0; n < nebulaCount; n++) {
    nebulaGroup.add(makeNebulaPatch(radius, n + 1));
  }

  for (let i = 0; i < starCount; i++) {
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

    const spec = pickSpectralClass();
    spectralTypes[i] = spec;
    const br = 0.65 + Math.random() * 0.35;
    baseColors[i * 3] = spec.color[0] * br;
    baseColors[i * 3 + 1] = spec.color[1] * br;
    baseColors[i * 3 + 2] = spec.color[2] * br;
    colors[i * 3] = baseColors[i * 3];
    colors[i * 3 + 1] = baseColors[i * 3 + 1];
    colors[i * 3 + 2] = baseColors[i * 3 + 2];
    starSizes[i] = spec.type === 'O' || spec.type === 'B' ? 1.8 : spec.type === 'M' ? 0.7 : 1.0;
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
  const root = new THREE.Group();
  root.add(points, nebulaGroup);

  let time = 0;
  let realismMode = cinematic ? 'cinematic' : 'standard';

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
    const spec = pickSpectralClass();
    spectralTypes[i] = spec;
    const br = 0.65 + Math.random() * 0.35;
    baseColors[i * 3] = spec.color[0] * br;
    baseColors[i * 3 + 1] = spec.color[1] * br;
    baseColors[i * 3 + 2] = spec.color[2] * br;
    starSizes[i] = spec.type === 'O' || spec.type === 'B' ? 1.8 : spec.type === 'M' ? 0.7 : 1.0;
    twinklePhase[i] = Math.random() * Math.PI * 2;
    twinkleSpeed[i] = 0.5 + Math.random() * 2.5;
  }

  function update(scaleFactor, dt = 0.016, vitality = 0.5, waveDisplacementAt = null, mode = realismMode) {
    time += dt;
    realismMode = mode === 'cinematic' ? 'cinematic' : (mode || realismMode);
    const pos = geometry.attributes.position.array;
    const col = geometry.attributes.color.array;

    for (let i = 0; i < starCount; i++) {
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
    const sizeBoost = realismMode === 'cinematic' ? 1.25 : 1;
    material.size = (1.0 + vitality * 0.6) * sizeBoost;
    material.opacity = realismMode === 'cinematic' ? 0.95 : 0.9;

    for (const neb of nebulaGroup.children) {
      const u = neb.userData;
      neb.scale.setScalar(scaleFactor * (1 + Math.sin(time * 0.4 + u.pulse) * 0.03));
      neb.position.set(u.cx * scaleFactor, u.cy * scaleFactor, u.cz * scaleFactor);
      const pts = neb.children[0];
      if (pts?.material) pts.material.opacity = 0.25 + vitality * 0.15 + (realismMode === 'cinematic' ? 0.1 : 0);
    }
  }

  function birthStar() {
    const i = Math.floor(Math.random() * starCount);
    initStar(i);
    baseColors[i * 3] = 1;
    baseColors[i * 3 + 1] = 0.9;
    baseColors[i * 3 + 2] = 0.7;
    spectralTypes[i] = SPECTRAL_CLASSES[3];
  }

  function deathStar() {
    const i = Math.floor(Math.random() * starCount);
    alive[i] = 0;
    const pos = geometry.attributes.position.array;
    pos[i * 3] = pos[i * 3 + 1] = pos[i * 3 + 2] = 9999;
  }

  function reset() {
    time = 0;
    for (let i = 0; i < starCount; i++) initStar(i);
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
  }

  function setRealism(mode) {
    realismMode = mode === 'cinematic' ? 'cinematic' : 'standard';
  }

  return { points, group: root, update, birthStar, deathStar, reset, setRealism, comovingPositions };
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

/** Fondo CMB: resplandor tenue del universo primordial (z ~ 1100) */
export function createCMBBackground(radius = 500) {
  const geo = new THREE.SphereGeometry(radius, 32, 32);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffeedd,
    transparent: true,
    opacity: 0.04,
    side: THREE.BackSide,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  const group = new THREE.Group();
  group.add(mesh);

  function update(z = 0) {
    const relic = Math.max(0, 1 - z / 1200);
    mat.opacity = 0.02 + relic * 0.05;
    const t = 2.725 * (1 + z);
    const warm = Math.min(1, 2.725 / t);
    mat.color.setRGB(1, 0.92 * warm + 0.08, 0.82 * warm + 0.1);
  }

  return { group, update };
}
