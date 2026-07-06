import * as THREE from 'three';

const H0_VIS = 0.018; // escala visual v = H₀·d para flujo de Hubble
const GALAXY_TYPES = ['spiral', 'elliptical', 'irregular'];

/** Temperatura efectiva → RGB (aprox. Wien) */
function tempToRgb(kelvin) {
  const t = kelvin / 100;
  let r, g, b;
  if (t <= 66) {
    r = 255;
    g = Math.min(255, 99.47 * Math.log(t) - 161.12);
  } else {
    r = Math.min(255, 329.7 * (t - 60) ** -0.133);
    g = Math.min(255, 288.1 * (t - 60) ** -0.0755);
  }
  if (t >= 66) b = 255;
  else if (t <= 19) b = 0;
  else b = Math.min(255, 138.52 * Math.log(t - 10) - 305.04);
  return new THREE.Color(r / 255, g / 255, b / 255);
}

/** Corrimiento cosmológico z → tinte (galaxias lejanas más rojas) */
function redshiftTint(z, baseColor) {
  const col = baseColor.clone();
  const factor = 1 / (1 + Math.max(0, z));
  col.r = Math.min(1, col.r * (0.55 + 0.45 * factor));
  col.g *= 0.7 + 0.3 * factor;
  col.b *= 0.45 + 0.55 * factor;
  return col;
}

function makeGalaxyTexture(type, seed = 0) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const rng = (n) => {
    const x = Math.sin(seed * 127.1 + n * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };

  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, size, size);
  const cx = size / 2;
  const cy = size / 2;

  if (type === 'spiral') {
    const arms = 2 + Math.floor(rng(1) * 2);
    for (let a = 0; a < 800; a++) {
      const t = a / 800;
      const angle = t * Math.PI * 4 * arms + rng(a) * 0.4;
      const r = t * size * 0.45;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r * (0.35 + rng(a + 2) * 0.25);
      const br = 180 + rng(a + 3) * 75;
      ctx.fillStyle = `rgba(${br},${br * 0.85},${br * 0.6},${0.15 + rng(a + 4) * 0.5})`;
      ctx.beginPath();
      ctx.arc(x, y, 0.6 + rng(a + 5) * 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.12);
    core.addColorStop(0, 'rgba(255,240,200,0.95)');
    core.addColorStop(0.5, 'rgba(255,200,120,0.5)');
    core.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, size, size);
  } else if (type === 'elliptical') {
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.42);
    grad.addColorStop(0, 'rgba(255,230,180,0.9)');
    grad.addColorStop(0.35, 'rgba(220,180,130,0.55)');
    grad.addColorStop(0.7, 'rgba(160,120,90,0.2)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.4, size * 0.28, rng(9) * Math.PI, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 120; i++) {
      const ang = rng(i) * Math.PI * 2;
      const r = rng(i + 50) * size * 0.35;
      ctx.fillStyle = `rgba(255,255,255,${0.1 + rng(i + 100) * 0.3})`;
      ctx.fillRect(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r * 0.7, 1, 1);
    }
  } else {
    for (let i = 0; i < 200; i++) {
      const x = cx + (rng(i) - 0.5) * size * 0.7;
      const y = cy + (rng(i + 20) - 0.5) * size * 0.5;
      const hue = 200 + rng(i + 40) * 80;
      ctx.fillStyle = `hsla(${hue},70%,${50 + rng(i + 60) * 30}%,${0.2 + rng(i + 80) * 0.5})`;
      ctx.beginPath();
      ctx.arc(x, y, 1 + rng(i + 100) * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function makeMilkyWayBandTexture() {
  const w = 512;
  const h = 128;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, h / 2, w, h / 2);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(0.2, 'rgba(80,90,140,0.08)');
  grad.addColorStop(0.45, 'rgba(180,170,200,0.18)');
  grad.addColorStop(0.5, 'rgba(220,210,230,0.25)');
  grad.addColorStop(0.55, 'rgba(180,170,200,0.18)');
  grad.addColorStop(0.8, 'rgba(80,90,140,0.08)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * w;
    const y = h / 2 + (Math.random() - 0.5) * h * 0.35;
    ctx.fillStyle = `rgba(255,255,255,${0.02 + Math.random() * 0.08})`;
    ctx.fillRect(x, y, 1 + Math.random(), 1);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

/**
 * Campo de galaxias realista: sprites procedurales, redshift, flujo de Hubble,
 * cúmulos y banda galáctica tipo Vía Láctea.
 */
export function createGalaxyField({
  galaxyCount = 180,
  clusterCount = 6,
  fieldRadius = 350,
  cinematic = false,
  rng = Math.random,
} = {}) {
  const group = new THREE.Group();
  const galaxies = [];
  const textures = {};
  for (const t of GALAXY_TYPES) textures[t] = makeGalaxyTexture(t, t.length);

  const count = cinematic ? galaxyCount * 2 : galaxyCount;

  // Banda galáctica (polvo + estrellas de fondo)
  const bandGeo = new THREE.SphereGeometry(fieldRadius * 0.98, 32, 16, 0, Math.PI * 2, Math.PI * 0.38, Math.PI * 0.24);
  const bandMat = new THREE.MeshBasicMaterial({
    map: makeMilkyWayBandTexture(),
    transparent: true,
    opacity: 0.22,
    side: THREE.BackSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const milkyWayBand = new THREE.Mesh(bandGeo, bandMat);
  milkyWayBand.rotation.x = Math.PI * 0.55;
  milkyWayBand.rotation.z = 0.4;
  group.add(milkyWayBand);

  // Cúmulos de galaxias
  const clusters = [];
  for (let c = 0; c < clusterCount; c++) {
    const theta = rng() * Math.PI * 2;
    const phi = Math.acos(2 * rng() - 1);
    const dist = fieldRadius * (0.35 + rng() * 0.55);
    clusters.push({
      x: dist * Math.sin(phi) * Math.cos(theta),
      y: (rng() - 0.5) * fieldRadius * 0.25,
      z: dist * Math.sin(phi) * Math.sin(theta),
      spread: 8 + rng() * 18,
      richness: 4 + Math.floor(rng() * 8),
    });
  }

  let placed = 0;
  for (const cluster of clusters) {
    for (let g = 0; g < cluster.richness && placed < count; g++, placed++) {
      const type = GALAXY_TYPES[Math.floor(rng() * GALAXY_TYPES.length)];
      const offset = cluster.spread * (rng() - 0.5);
      const ox = cluster.x + offset * (rng() - 0.5);
      const oy = cluster.y + offset * 0.3 * (rng() - 0.5);
      const oz = cluster.z + offset * (rng() - 0.5);
      galaxies.push(makeGalaxy(ox, oy, oz, type, placed, fieldRadius, textures, rng));
    }
  }
  while (placed < count) {
    const theta = rng() * Math.PI * 2;
    const phi = Math.acos(2 * rng() - 1);
    const dist = fieldRadius * (0.2 + rng() * 0.8);
    const type = GALAXY_TYPES[Math.floor(rng() * GALAXY_TYPES.length)];
    galaxies.push(makeGalaxy(
      dist * Math.sin(phi) * Math.cos(theta),
      (rng() - 0.5) * fieldRadius * 0.3,
      dist * Math.sin(phi) * Math.sin(theta),
      type,
      placed,
      fieldRadius,
      textures,
      rng
    ));
    placed++;
  }

  const galaxyGroup = new THREE.Group();
  for (const g of galaxies) galaxyGroup.add(g.mesh);
  group.add(galaxyGroup);

  // Puntos lejanos (LOD extremo)
  const distantCount = cinematic ? 1200 : 600;
  const distantPos = new Float32Array(distantCount * 3);
  const distantCol = new Float32Array(distantCount * 3);
  for (let i = 0; i < distantCount; i++) {
    const theta = rng() * Math.PI * 2;
    const phi = Math.acos(2 * rng() - 1);
    const dist = fieldRadius * (0.85 + rng() * 0.15);
    distantPos[i * 3] = dist * Math.sin(phi) * Math.cos(theta);
    distantPos[i * 3 + 1] = (rng() - 0.5) * fieldRadius * 0.2;
    distantPos[i * 3 + 2] = dist * Math.sin(phi) * Math.sin(theta);
    const z = dist / fieldRadius * 2.5;
    const c = redshiftTint(z, new THREE.Color(0.9, 0.85, 0.95));
    distantCol[i * 3] = c.r;
    distantCol[i * 3 + 1] = c.g;
    distantCol[i * 3 + 2] = c.b;
  }
  const distantGeo = new THREE.BufferGeometry();
  distantGeo.setAttribute('position', new THREE.BufferAttribute(distantPos, 3));
  distantGeo.setAttribute('color', new THREE.BufferAttribute(distantCol, 3));
  const distantPoints = new THREE.Points(
    distantGeo,
    new THREE.PointsMaterial({ size: 0.8, vertexColors: true, transparent: true, opacity: 0.5, sizeAttenuation: true })
  );
  group.add(distantPoints);

  let realismMode = cinematic ? 'cinematic' : 'standard';
  let time = 0;

  function makeGalaxy(x, y, z, type, seed, maxR, texMap, random = Math.random) {
    const dist = Math.sqrt(x * x + y * y + z * z);
    const zCosmo = (dist / maxR) * 2.8;
    const baseTemp = type === 'elliptical' ? 4500 + random() * 1500 : 5500 + random() * 2500;
    const baseColor = tempToRgb(baseTemp);
    const tinted = redshiftTint(zCosmo, baseColor);

    const lodNear = dist < maxR * 0.45;
    const size = lodNear
      ? (type === 'elliptical' ? 5 : 7) + random() * 4
      : (type === 'elliptical' ? 2 : 3) + random() * 2;

    const mat = new THREE.SpriteMaterial({
      map: texMap[type] ?? texMap.spiral,
      color: tinted,
      transparent: true,
      opacity: lodNear ? 0.85 : 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const mesh = new THREE.Sprite(mat);
    mesh.scale.set(size, size * (type === 'elliptical' ? 0.7 : 1), 1);
    mesh.position.set(x, y, z);

    const rotSpeed = type === 'spiral' ? (0.02 + random() * 0.04) * (random() < 0.5 ? 1 : -1) : 0;
    mesh.userData = {
      comoving: { x, y, z },
      dist,
      zCosmo,
      rotSpeed,
      rotPhase: random() * Math.PI * 2,
      type,
      baseColor: tinted,
      size,
    };
    return { mesh };
  }

  function update(scaleFactor, dt = 0.016, cosmology = null, mode = realismMode) {
    time += dt;
    const H0 = cosmology?.H0 ?? 70;
    const hubbleVis = H0_VIS * (H0 / 70);

    for (const { mesh } of galaxies) {
      const u = mesh.userData;
      const cx = u.comoving.x * scaleFactor;
      const cy = u.comoving.y * scaleFactor;
      const cz = u.comoving.z * scaleFactor;

      // Flujo de Hubble: v = H₀·d radial
      const radial = Math.sqrt(cx * cx + cy * cy + cz * cz) || 1;
      const hubbleDrift = hubbleVis * u.dist * scaleFactor * dt;
      const nx = cx / radial;
      const ny = cy / radial;
      const nz = cz / radial;
      mesh.position.set(
        cx + nx * hubbleDrift,
        cy + ny * hubbleDrift,
        cz + nz * hubbleDrift
      );

      // Redshift actualizado con expansión
      const zNow = u.zCosmo * (1 / scaleFactor - 1) * 0.3 + u.zCosmo;
      const col = redshiftTint(zNow, u.baseColor);
      mesh.material.color.copy(col);

      // Rotación diferencial en espirales cercanas
      if (u.type === 'spiral' && u.dist < fieldRadius * 0.5) {
        u.rotPhase += u.rotSpeed * dt * (1 + u.dist * 0.002);
        mesh.material.rotation = u.rotPhase;
      }
    }

    milkyWayBand.material.opacity = mode === 'cinematic' ? 0.32 : 0.22;
    distantPoints.material.opacity = mode === 'cinematic' ? 0.65 : 0.45;
    distantPoints.material.size = mode === 'cinematic' ? 1.1 : 0.8;
  }

  function setRealism(mode) {
    realismMode = mode === 'cinematic' ? 'cinematic' : 'standard';
    galaxyGroup.visible = true;
  }

  function reset() {
    time = 0;
    for (const { mesh } of galaxies) {
      const u = mesh.userData;
      mesh.position.set(u.comoving.x, u.comoving.y, u.comoving.z);
      mesh.material.color.copy(u.baseColor);
    }
  }

  return { group, update, reset, setRealism, galaxies };
}
