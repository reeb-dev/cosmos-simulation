import * as THREE from 'three';

/** Temperatura efectiva → RGB (aprox. Wien) */
export function tempToRgb(kelvin) {
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

export function makeGalaxyTexture(type, seed = 0) {
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

/**
 * Grupo de sprites que representa una galaxia (núcleo + halo estelar).
 */
export function createGalaxySpriteGroup({ type = 'spiral', seed = 1, scale = 1, colorTemp = 5500 } = {}) {
  const group = new THREE.Group();
  const baseColor = tempToRgb(colorTemp);
  const tex = makeGalaxyTexture(type, seed);

  const coreMat = new THREE.SpriteMaterial({
    map: tex,
    color: baseColor,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const core = new THREE.Sprite(coreMat);
  core.scale.set(scale * 28, scale * 18, 1);
  group.add(core);

  const haloCount = type === 'spiral' ? 80 : 50;
  const haloGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(haloCount * 3);
  const sizes = new Float32Array(haloCount);
  const rng = (n) => {
    const x = Math.sin(seed * 91.7 + n * 217.3) * 43758.5453;
    return x - Math.floor(x);
  };
  for (let i = 0; i < haloCount; i++) {
    const ang = rng(i) * Math.PI * 2;
    const r = (0.15 + rng(i + 10) * 0.85) * scale * 22;
    positions[i * 3] = Math.cos(ang) * r;
    positions[i * 3 + 1] = (rng(i + 20) - 0.5) * scale * 4;
    positions[i * 3 + 2] = Math.sin(ang) * r * (type === 'elliptical' ? 0.65 : 0.45);
    sizes[i] = 0.8 + rng(i + 30) * 2.2;
  }
  haloGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const haloMat = new THREE.PointsMaterial({
    color: baseColor,
    size: 1.8,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const halo = new THREE.Points(haloGeo, haloMat);
  group.add(halo);

  group.userData = { core, halo, haloPositions: positions, haloCount, type, seed, baseScale: scale };

  return {
    group,
    setTidalDeform(strength, angle = 0) {
      const s = Math.max(0, strength);
      core.scale.x = scale * 28 * (1 + s * 0.6);
      core.scale.y = scale * 18 * (1 - s * 0.25);
      core.rotation.z = angle;
      const pos = haloGeo.attributes.position.array;
      for (let i = 0; i < haloCount; i++) {
        const ox = pos[i * 3];
        const oz = pos[i * 3 + 2];
        const radial = Math.sqrt(ox * ox + oz * oz) || 1;
        const stretch = 1 + s * (radial / (scale * 22)) * 1.8;
        pos[i * 3] = ox * stretch;
        pos[i * 3 + 2] = oz * (1 - s * 0.15);
      }
      haloGeo.attributes.position.needsUpdate = true;
      haloMat.opacity = 0.55 * (1 - s * 0.2);
    },
    setOpacity(v) {
      coreMat.opacity = v;
      haloMat.opacity = v * 0.55;
    },
    setColorTemp(k) {
      const c = tempToRgb(k);
      coreMat.color.copy(c);
      haloMat.color.copy(c);
    },
  };
}
