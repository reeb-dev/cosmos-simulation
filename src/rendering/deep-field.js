import * as THREE from 'three';
import { buildSdssSample, SDSS_SAMPLE_META } from '../data/sdss-sample.js';
import { getRealismProfile } from '../physics/realism-profiles.js';

const SPECTRAL = [
  { temp: 35000, color: [0.55, 0.65, 1.0], weight: 0.002 },
  { temp: 20000, color: [0.7, 0.78, 1.0], weight: 0.008 },
  { temp: 9000, color: [0.88, 0.92, 1.0], weight: 0.04 },
  { temp: 6500, color: [1.0, 0.96, 0.88], weight: 0.12 },
  { temp: 4500, color: [1.0, 0.72, 0.42], weight: 0.22 },
  { temp: 3200, color: [1.0, 0.5, 0.32], weight: 0.628 },
];

const GALAXY_TYPES = ['spiral', 'elliptical', 'edge-on', 'irregular'];

function pickSpectral(rng) {
  const r = rng();
  let acc = 0;
  for (const s of SPECTRAL) {
    acc += s.weight;
    if (r <= acc) return s;
  }
  return SPECTRAL[SPECTRAL.length - 1];
}

function redshiftTint(z, base) {
  const col = base.clone();
  const f = 1 / (1 + Math.max(0, z));
  col.r = Math.min(1, col.r * (0.5 + 0.5 * f));
  col.g *= 0.65 + 0.35 * f;
  col.b *= 0.4 + 0.6 * f;
  return col;
}

/** Textura de picos de difracción estilo Hubble (cruz de 4 puntas) */
function makeDiffractionSpikeTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;

  ctx.clearRect(0, 0, size, size);

  const spike = (angle, len, width, alpha) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    const grad = ctx.createLinearGradient(0, 0, len, 0);
    grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
    grad.addColorStop(0.35, `rgba(255,255,255,${alpha * 0.5})`);
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, -width);
    ctx.lineTo(len, 0);
    ctx.lineTo(0, width);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  for (let i = 0; i < 4; i++) spike((i * Math.PI) / 2, size * 0.48, 1.2, 0.85);
  for (let i = 0; i < 4; i++) spike((i * Math.PI) / 2 + Math.PI / 4, size * 0.22, 0.6, 0.25);

  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.08);
  core.addColorStop(0, 'rgba(255,255,255,1)');
  core.addColorStop(0.4, 'rgba(255,255,255,0.7)');
  core.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function makeGalaxyTexture(type, seed) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const rng = (n) => {
    const x = Math.sin(seed * 127.1 + n * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const cx = size / 2;
  const cy = size / 2;
  ctx.clearRect(0, 0, size, size);

  if (type === 'spiral') {
    const arms = 2 + Math.floor(rng(1) * 2);
    for (let a = 0; a < 900; a++) {
      const t = a / 900;
      const angle = t * Math.PI * 4 * arms + rng(a) * 0.35;
      const r = t * size * 0.46;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r * (0.32 + rng(a + 2) * 0.22);
      const br = 170 + rng(a + 3) * 85;
      ctx.fillStyle = `rgba(${br},${br * 0.82},${br * 0.55},${0.12 + rng(a + 4) * 0.45})`;
      ctx.beginPath();
      ctx.arc(x, y, 0.5 + rng(a + 5) * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.11);
    core.addColorStop(0, 'rgba(255,245,210,0.95)');
    core.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, size, size);
  } else if (type === 'elliptical') {
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.4);
    grad.addColorStop(0, 'rgba(255,225,175,0.9)');
    grad.addColorStop(0.5, 'rgba(200,160,110,0.45)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.38, size * 0.26, rng(9) * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'edge-on') {
    const grad = ctx.createLinearGradient(cx, cy - size * 0.06, cx, cy + size * 0.06);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.25, 'rgba(120,130,180,0.35)');
    grad.addColorStop(0.5, 'rgba(255,240,200,0.75)');
    grad.addColorStop(0.75, 'rgba(120,130,180,0.35)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(cx - size * 0.42, cy - size * 0.05, size * 0.84, size * 0.1);
    for (let i = 0; i < 60; i++) {
      const x = cx + (rng(i) - 0.5) * size * 0.75;
      const y = cy + (rng(i + 30) - 0.5) * size * 0.04;
      ctx.fillStyle = `rgba(255,255,255,${0.08 + rng(i + 60) * 0.25})`;
      ctx.fillRect(x, y, 1.5, 0.5);
    }
  } else {
    for (let i = 0; i < 180; i++) {
      const x = cx + (rng(i) - 0.5) * size * 0.75;
      const y = cy + (rng(i + 20) - 0.5) * size * 0.55;
      ctx.fillStyle = `hsla(${200 + rng(i + 40) * 70},65%,${45 + rng(i + 60) * 30}%,${0.15 + rng(i + 80) * 0.45})`;
      ctx.beginPath();
      ctx.arc(x, y, 0.8 + rng(i + 100) * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function scaleBarLabel(cosmicScale) {
  if (cosmicScale < 0.33) return '1 Mpc';
  if (cosmicScale < 0.66) return '100 Mpc';
  return '1 Gpc';
}

/**
 * Campo profundo estilo Hubble/Webb: miles de estrellas con picos de difracción,
 * cientos de galaxias procedurales, capas de profundidad y vacío negro.
 */
export function createDeepField({
  starCount = 12000,
  galaxyCount = 1000,
  brightStarCount = 180,
  fieldRadius = 900,
  cinematic = false,
  sdssEnabled = true,
  rng = Math.random,
} = {}) {
  const group = new THREE.Group();
  const starsGroup = new THREE.Group();
  const brightGroup = new THREE.Group();
  const galaxyGroup = new THREE.Group();
  const sdssGroup = new THREE.Group();
  const layerGroups = [new THREE.Group(), new THREE.Group(), new THREE.Group()];
  for (const lg of layerGroups) group.add(lg);
  layerGroups[0].add(starsGroup);
  layerGroups[1].add(galaxyGroup);
  layerGroups[2].add(brightGroup);

  const nStars = cinematic ? starCount * 2 : starCount;
  const nGalaxies = cinematic ? galaxyCount * 2 : galaxyCount;
  const nBright = cinematic ? brightStarCount * 2 : brightStarCount;

  const spikeTex = makeDiffractionSpikeTexture();
  const galaxyTextures = {};
  for (const t of GALAXY_TYPES) galaxyTextures[t] = makeGalaxyTexture(t, t.length * 17);

  const positions = new Float32Array(nStars * 3);
  const colors = new Float32Array(nStars * 3);
  const comovingStars = [];
  const galaxies = [];
  const brightStars = [];

  let anchorCam = new THREE.Vector3();
  let cosmicScale = 0.65;
  let realismMode = cinematic ? 'cinematic' : 'realistic';
  let expansionScale = 1;

  const scaleBarEl = document.getElementById('cosmic-scale-bar');
  const scaleLabelEl = document.getElementById('cosmic-scale-label');

  function samplePosition(layer, maxR) {
    const clusterBias = rng() < 0.35;
    let theta, phi, dist;
    if (clusterBias) {
      theta = rng() * Math.PI * 2;
      phi = Math.acos(2 * rng() - 1);
      dist = maxR * (0.05 + rng() * 0.25) * (layer === 2 ? 0.6 : 1);
    } else {
      theta = rng() * Math.PI * 2;
      phi = Math.acos(2 * rng() - 1);
      const layerFactor = layer === 0 ? 0.55 + rng() * 0.45 : layer === 1 ? 0.25 + rng() * 0.65 : 0.1 + rng() * 0.5;
      dist = maxR * layerFactor;
    }
    return {
      x: dist * Math.sin(phi) * Math.cos(theta),
      y: (rng() - 0.5) * maxR * 0.12,
      z: dist * Math.sin(phi) * Math.sin(theta),
      dist,
      layer,
      parallax: layer === 0 ? 0.04 : layer === 1 ? 0.15 : 0.45,
    };
  }

  for (let i = 0; i < nStars; i++) {
    const layer = i % 3 === 0 ? 0 : i % 3 === 1 ? 1 : 2;
    const p = samplePosition(layer, fieldRadius);
    comovingStars.push(p);
    positions[i * 3] = p.x;
    positions[i * 3 + 1] = p.y;
    positions[i * 3 + 2] = p.z;
    const spec = pickSpectral(rng);
    const br = 0.5 + rng() * 0.5;
    colors[i * 3] = spec.color[0] * br;
    colors[i * 3 + 1] = spec.color[1] * br;
    colors[i * 3 + 2] = spec.color[2] * br;
  }

  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const starMat = new THREE.PointsMaterial({
    size: 1.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.92,
    sizeAttenuation: true,
    depthWrite: false,
  });
  starsGroup.add(new THREE.Points(starGeo, starMat));

  for (let i = 0; i < nBright; i++) {
    const p = samplePosition(2, fieldRadius * 0.55);
    const spec = pickSpectral(() => rng() * 0.15);
    const col = new THREE.Color(spec.color[0], spec.color[1], spec.color[2]);
    const size = 6 + rng() * 10;
    const mat = new THREE.SpriteMaterial({
      map: spikeTex,
      color: col,
      transparent: true,
      opacity: 0.75 + rng() * 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(size, size, 1);
    sprite.position.set(p.x, p.y, p.z);
    sprite.userData = { comoving: p, baseColor: col, size, twinkle: rng() * Math.PI * 2 };
    brightGroup.add(sprite);
    brightStars.push(sprite);
  }

  for (let i = 0; i < nGalaxies; i++) {
    const layer = i < nGalaxies * 0.6 ? 0 : i < nGalaxies * 0.85 ? 1 : 2;
    const p = samplePosition(layer, fieldRadius);
    const type = GALAXY_TYPES[Math.floor(rng() * GALAXY_TYPES.length)];
    const zCosmo = (p.dist / fieldRadius) * (2.5 + cosmicScale * 4);
    const baseTemp = type === 'elliptical' ? 4200 + rng() * 1200 : 5200 + rng() * 2200;
    const baseCol = new THREE.Color().setHSL(0.08 + rng() * 0.06, 0.35, 0.55 + rng() * 0.2);
    const tinted = redshiftTint(zCosmo, baseCol);
    const near = p.dist < fieldRadius * 0.4;
    const size = near
      ? (type === 'edge-on' ? 10 : 7) + rng() * 6
      : (type === 'edge-on' ? 4 : 2.5) + rng() * 3;

    const mat = new THREE.SpriteMaterial({
      map: galaxyTextures[type],
      color: tinted,
      transparent: true,
      opacity: near ? 0.8 : 0.45 + layer * 0.1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const mesh = new THREE.Sprite(mat);
    const aspect = type === 'edge-on' ? 3.5 : type === 'elliptical' ? 0.65 : 1;
    mesh.scale.set(size * aspect, size, 1);
    mesh.position.set(p.x, p.y, p.z);
    if (type === 'edge-on') mesh.material.rotation = rng() * Math.PI;
    mesh.userData = {
      comoving: p,
      dist: p.dist,
      zCosmo,
      type,
      baseColor: tinted.clone(),
      size,
      aspect,
      rotSpeed: type === 'spiral' ? (0.01 + rng() * 0.03) * (rng() < 0.5 ? 1 : -1) : 0,
      rotPhase: rng() * Math.PI * 2,
    };
    galaxyGroup.add(mesh);
    galaxies.push(mesh);
  }

  let sdssCount = 0;
  if (sdssEnabled) {
    const sdssGalaxies = buildSdssSample(600, 42);
    for (const g of sdssGalaxies) {
      const type = g.type ?? 'spiral';
      const tex = galaxyTextures[type] ?? galaxyTextures.spiral;
      const gr = g.gr ?? 0.5;
      const baseCol = new THREE.Color().setHSL(0.05 + gr * 0.08, 0.4, 0.5);
      const tinted = redshiftTint(g.zCosmo ?? 0.3, baseCol);
      const size = 3 + (g.zCosmo ?? 0.3) * 2.5;
      const mat = new THREE.SpriteMaterial({
        map: tex,
        color: tinted,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const mesh = new THREE.Sprite(mat);
      const aspect = type === 'edge-on' ? 3 : type === 'elliptical' ? 0.7 : 1;
      mesh.scale.set(size * aspect, size, 1);
      mesh.position.set(g.x, g.y, g.z);
      mesh.userData = {
        comoving: { x: g.x, y: g.y, z: g.z, dist: Math.hypot(g.x, g.y, g.z), layer: 1 },
        dist: Math.hypot(g.x, g.y, g.z),
        zCosmo: g.zCosmo,
        type,
        baseColor: tinted.clone(),
        size,
        aspect,
        rotSpeed: 0,
        rotPhase: 0,
        sdssId: g.sdssId,
        fromSdss: true,
      };
      sdssGroup.add(mesh);
      galaxies.push(mesh);
      sdssCount++;
    }
    sdssGroup.visible = sdssEnabled;
  }

  function setSdssEnabled(enabled) {
    sdssGroup.visible = !!enabled;
  }

  const parallaxFactors = [0.04, 0.15, 0.45];

  function updateScaleBar() {
    if (!scaleLabelEl) return;
    scaleLabelEl.textContent = scaleBarLabel(cosmicScale);
    if (scaleBarEl) scaleBarEl.classList.toggle('visible', true);
  }

  function setCosmicScale(v) {
    cosmicScale = Math.max(0, Math.min(1, v));
    const visualScale = 0.35 + cosmicScale * 2.2;
    group.scale.setScalar(visualScale);
    updateScaleBar();
  }

  function setRealism(mode) {
    realismMode = mode || 'realistic';
    const profile = getRealismProfile(realismMode);
    starMat.size = profile.starSize;
    starMat.opacity = profile.starOpacity;
  }

  function update(scaleFactor, dt, cosmology, camera, mode = realismMode) {
    realismMode = mode || realismMode;
    const profile = getRealismProfile(realismMode);
    expansionScale = scaleFactor;
    const pos = starGeo.attributes.position.array;
    const t = performance.now() * 0.001;

    if (camera) {
      const dx = camera.position.x - anchorCam.x;
      const dy = camera.position.y - anchorCam.y;
      const dz = camera.position.z - anchorCam.z;
      for (let li = 0; li < 3; li++) {
        const pf = parallaxFactors[li];
        layerGroups[li].position.set(-dx * pf, -dy * pf, -dz * pf);
      }
      anchorCam.copy(camera.position);
    }

    for (let i = 0; i < nStars; i++) {
      const c = comovingStars[i];
      const s = expansionScale * (0.4 + cosmicScale * 0.6);
      pos[i * 3] = c.x * s;
      pos[i * 3 + 1] = c.y * s;
      pos[i * 3 + 2] = c.z * s;
    }
    starGeo.attributes.position.needsUpdate = true;

    for (const sprite of brightStars) {
      const u = sprite.userData;
      const s = expansionScale * (0.4 + cosmicScale * 0.6);
      sprite.position.set(u.comoving.x * s, u.comoving.y * s, u.comoving.z * s);
      const tw = 0.7 + 0.3 * Math.sin(t * 1.8 + u.twinkle);
      sprite.material.opacity = (profile.id === 'cinematic' ? 0.9 : 0.72) * tw;
    }

    const H0 = cosmology?.H0 ?? 70;
    for (const mesh of galaxies) {
      const u = mesh.userData;
      const s = expansionScale * (0.4 + cosmicScale * 0.6);
      const cx = u.comoving.x * s;
      const cy = u.comoving.y * s;
      const cz = u.comoving.z * s;
      mesh.position.set(cx, cy, cz);

      const zNow = u.zCosmo * (1 / Math.max(scaleFactor, 0.01) - 1) * 0.25 + u.zCosmo * (0.5 + cosmicScale * 0.8);
      mesh.material.color.copy(redshiftTint(zNow, u.baseColor));
      const lodSize = u.size * (0.5 + (1 - cosmicScale) * 0.5) * profile.brightStarBoost;
      mesh.scale.set(lodSize * u.aspect, lodSize, 1);

      if (u.type === 'spiral' && u.dist < fieldRadius * 0.5) {
        u.rotPhase += u.rotSpeed * dt;
        mesh.material.rotation = u.rotPhase;
      }
    }

    starMat.size = profile.starSize * (1 + cosmicScale * 0.12);
  }

  function showScaleBar(visible) {
    if (scaleBarEl) scaleBarEl.classList.toggle('visible', visible);
  }

  function reset(camera = null) {
    anchorCam.set(0, 0, 0);
    if (camera) anchorCam.copy(camera.position);
    for (let li = 0; li < 3; li++) layerGroups[li].position.set(0, 0, 0);
  }

  setCosmicScale(cosmicScale);

  return {
    group,
    update,
    reset,
    setRealism,
    setCosmicScale,
    showScaleBar,
    getCosmicScale: () => cosmicScale,
    sdssEnabled,
    sdssCount,
    sdssMeta: SDSS_SAMPLE_META,
    sdssGroup,
    setSdssEnabled,
  };
}
