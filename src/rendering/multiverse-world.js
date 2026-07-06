import * as THREE from 'three';

function omegaTint(omegaM, omegaL) {
  const ratio = omegaL > 0 ? omegaM / omegaL : 2;
  const t = Math.min(1, Math.max(0, (ratio - 0.3) / 1.4));
  return new THREE.Color().setHSL(0.72 - t * 0.45, 0.75, 0.45 + t * 0.15);
}

function makeBubbleTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,0.9)');
  g.addColorStop(0.3, 'rgba(180,200,255,0.4)');
  g.addColorStop(0.7, 'rgba(80,60,140,0.15)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 1.5;
    ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.random() * 0.5})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Escena completa del multiverso: burbujas Friedmann, portal y ramas.
 */
export function createMultiverseWorld(cosmology = {}) {
  const group = new THREE.Group();
  group.visible = false;

  const bubbleTex = makeBubbleTexture();
  const bubbles = [];
  const paths = new THREE.Group();
  const portalGroup = new THREE.Group();

  const om = cosmology.OmegaM ?? 0.31;
  const ol = cosmology.OmegaLambda ?? 0.69;

  // Portal central
  const portalRing = new THREE.Mesh(
    new THREE.TorusGeometry(8, 0.6, 16, 64),
    new THREE.MeshBasicMaterial({ color: 0xcc99ff, transparent: true, opacity: 0.7 })
  );
  const portalCore = new THREE.Mesh(
    new THREE.SphereGeometry(5, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x8866ff, transparent: true, opacity: 0.25 })
  );
  const portalGlow = new THREE.Mesh(
    new THREE.SphereGeometry(12, 24, 24),
    new THREE.MeshBasicMaterial({ color: 0xaa77ff, transparent: true, opacity: 0.08, side: THREE.BackSide })
  );
  portalGroup.add(portalRing, portalCore, portalGlow);
  group.add(portalGroup);

  // Bifurcación de caminos (many-worlds)
  const branchColors = [
    omegaTint(0.9, 0.1),
    omegaTint(0.5, 0.5),
    omegaTint(0.1, 0.9),
  ];
  for (let b = 0; b < 5; b++) {
    const angle = (b / 5) * Math.PI * 2;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(Math.cos(angle) * 15, 4 + b, Math.sin(angle) * 15),
      new THREE.Vector3(Math.cos(angle) * 40, 8, Math.sin(angle) * 40),
      new THREE.Vector3(Math.cos(angle) * 70, 12 + b * 2, Math.sin(angle) * 70),
    ]);
    const tubeGeo = new THREE.TubeGeometry(curve, 40, 0.15 + b * 0.03, 6, false);
    const col = branchColors[b % 3];
    const tube = new THREE.Mesh(
      tubeGeo,
      new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.35 })
    );
    paths.add(tube);
  }
  group.add(paths);

  // 70 burbujas-universo
  const bubbleCount = 70;
  for (let i = 0; i < bubbleCount; i++) {
    const omegaM = 0.05 + Math.random() * 0.9;
    const omegaL = 0.05 + Math.random() * 0.9;
    const col = omegaTint(omegaM, omegaL);
    const r = 1.5 + Math.random() * 4;
    const mat = new THREE.MeshBasicMaterial({
      color: col,
      transparent: true,
      opacity: 0.35 + Math.random() * 0.25,
      map: bubbleTex,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 16), mat);
    const dist = 25 + Math.random() * 75;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    mesh.position.set(
      dist * Math.sin(phi) * Math.cos(theta),
      (Math.random() - 0.5) * 50,
      dist * Math.sin(phi) * Math.sin(theta)
    );
    mesh.userData = {
      baseR: r,
      omegaM,
      omegaL,
      a: 0.3 + Math.random() * 0.7,
      aRate: 0.02 + Math.random() * 0.04,
      drift: new THREE.Vector3(
        (Math.random() - 0.5) * 0.08,
        (Math.random() - 0.5) * 0.04,
        (Math.random() - 0.5) * 0.08
      ),
      phase: Math.random() * Math.PI * 2,
      nucleate: Math.random() < 0.02,
    };
    bubbles.push(mesh);
    group.add(mesh);
  }

  const voidStars = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({ color: 0x4466aa, size: 0.4, transparent: true, opacity: 0.5 })
  );
  const starPts = [];
  for (let i = 0; i < 800; i++) {
    starPts.push(
      (Math.random() - 0.5) * 300,
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 300
    );
  }
  voidStars.geometry.setAttribute('position', new THREE.Float32BufferAttribute(starPts, 3));
  group.add(voidStars);

  group.add(new THREE.AmbientLight(0x221144, 0.8));
  const portalLight = new THREE.PointLight(0xaa77ff, 2, 80);
  portalGroup.add(portalLight);

  let nucleateTimer = 0;

  function updateCosmology(cosmo) {
    const newOm = cosmo?.OmegaM ?? om;
    const newOl = cosmo?.OmegaLambda ?? ol;
    for (const b of bubbles) {
      const blend = 0.02;
      b.userData.omegaM += (newOm - b.userData.omegaM) * blend;
      b.userData.omegaL += (newOl - b.userData.omegaL) * blend;
      const c = omegaTint(b.userData.omegaM, b.userData.omegaL);
      b.material.color.copy(c);
    }
    branchColors[0].copy(omegaTint(newOm * 1.5, newOl * 0.5));
    branchColors[1].copy(omegaTint(newOm, newOl));
    branchColors[2].copy(omegaTint(newOm * 0.5, newOl * 1.5));
  }

  function animate(t, dt = 0.016) {
    portalRing.rotation.x = t * 0.3;
    portalRing.rotation.y = t * 0.5;
    portalCore.scale.setScalar(1 + Math.sin(t * 2) * 0.1);
    portalGlow.scale.setScalar(1 + Math.sin(t * 1.5) * 0.15);

    for (let i = 0; i < bubbles.length; i++) {
      const b = bubbles[i];
      const u = b.userData;
      u.a = Math.min(2.5, u.a + u.aRate * dt);
      const scale = u.baseR * (0.5 + u.a * 0.5);
      b.scale.setScalar(scale * (1 + Math.sin(t + u.phase) * 0.04));
      b.position.addScaledVector(u.drift, dt);

      for (let j = i + 1; j < bubbles.length; j++) {
        const other = bubbles[j];
        const d = b.position.distanceTo(other.position);
        const minD = (u.baseR + other.userData.baseR) * (u.a + other.userData.a) * 0.4;
        if (d < minD && d > 0.01) {
          const push = (minD - d) * 0.5;
          const dir = b.position.clone().sub(other.position).normalize();
          b.position.addScaledVector(dir, push * dt * 2);
          other.position.addScaledVector(dir, -push * dt * 2);
        }
      }
    }

    nucleateTimer += dt;
    if (nucleateTimer > 4) {
      nucleateTimer = 0;
      const donor = bubbles[Math.floor(Math.random() * bubbles.length)];
      const col = omegaTint(donor.userData.omegaM, donor.userData.omegaL);
      const r = 0.8 + Math.random() * 1.5;
      const mat = new THREE.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: 0.5,
        map: bubbleTex,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 12), mat);
      mesh.position.copy(donor.position).add(
        new THREE.Vector3((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 8)
      );
      mesh.userData = {
        baseR: r,
        omegaM: donor.userData.omegaM * (0.9 + Math.random() * 0.2),
        omegaL: donor.userData.omegaL * (0.9 + Math.random() * 0.2),
        a: 0.1,
        aRate: 0.05 + Math.random() * 0.03,
        drift: new THREE.Vector3((Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.1),
        phase: Math.random() * Math.PI * 2,
      };
      bubbles.push(mesh);
      group.add(mesh);
      if (bubbles.length > 100) {
        const old = bubbles.shift();
        group.remove(old);
        old.geometry?.dispose();
        old.material?.dispose();
      }
    }

    voidStars.rotation.y += dt * 0.02;
    paths.rotation.y = Math.sin(t * 0.1) * 0.08;
  }

  return { group, animate, updateCosmology, bubbles };
}
