import * as THREE from 'three';

/**
 * Escena cosmológica de teoría de cuerdas: cuerdas gigantes, branas y vacío.
 */
export function createStringScene() {
  const group = new THREE.Group();
  group.visible = false;

  const voidStars = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({ color: 0x8899bb, size: 0.4, transparent: true, opacity: 0.5 })
  );
  const voidPts = [];
  for (let i = 0; i < 800; i++) {
    voidPts.push((Math.random() - 0.5) * 400, (Math.random() - 0.5) * 400, (Math.random() - 0.5) * 400);
  }
  voidStars.geometry.setAttribute('position', new THREE.Float32BufferAttribute(voidPts, 3));
  group.add(voidStars);

  const giantStrings = [];
  for (let i = 0; i < 5; i++) {
    const len = 120 + i * 30;
    const freq = 0.8 + i * 0.3;
    const amp = 8 + i * 3;
    const segs = 64;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array((segs + 1) * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const hue = 0.72 + i * 0.05;
    const line = new THREE.Line(
      geo,
      new THREE.LineBasicMaterial({
        color: new THREE.Color().setHSL(hue, 0.7, 0.6),
        transparent: true,
        opacity: 0.85,
      })
    );
    line.rotation.y = (i / 5) * Math.PI * 0.8;
    line.position.y = (i - 2) * 25;
    line.userData = { len, freq, amp, segs, phase: i * 1.2 };
    giantStrings.push(line);
    group.add(line);
  }

  const branes = new THREE.Group();
  for (let i = 0; i < 2; i++) {
    const brane = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshBasicMaterial({
        color: i === 0 ? 0xaa66ff : 0x66aaff,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
      })
    );
    brane.position.set(i === 0 ? -30 : 30, 0, 0);
    brane.rotation.y = i === 0 ? 0.3 : -0.3;
    brane.userData.baseX = brane.position.x;
    branes.add(brane);
  }
  group.add(branes);

  const bangFlash = new THREE.Mesh(
    new THREE.SphereGeometry(3, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })
  );
  group.add(bangFlash);

  group.add(new THREE.AmbientLight(0x221133, 0.5));
  const light = new THREE.PointLight(0xbb88ff, 2, 200);
  light.position.set(0, 40, 0);
  group.add(light);

  let collisionPhase = 0;

  function updateStringGeometry(line, t) {
    const u = line.userData;
    const pos = line.geometry.attributes.position.array;
    for (let j = 0; j <= u.segs; j++) {
      const s = j / u.segs;
      const x = (s - 0.5) * u.len;
      const y = Math.sin(s * Math.PI * u.freq + t * 1.5 + u.phase) * u.amp;
      const z = Math.sin(s * Math.PI * 4 + t * 0.8) * u.amp * 0.4;
      pos[j * 3] = x;
      pos[j * 3 + 1] = y;
      pos[j * 3 + 2] = z;
    }
    line.geometry.attributes.position.needsUpdate = true;
  }

  function animate(t, dt = 0.016) {
    voidStars.rotation.y += dt * 0.02;
    giantStrings.forEach((line) => updateStringGeometry(line, t));

    collisionPhase += dt * 0.15;
    const collide = (Math.sin(collisionPhase) + 1) * 0.5;
    branes.children.forEach((b, i) => {
      const sign = i === 0 ? -1 : 1;
      b.position.x = b.userData.baseX + sign * collide * 25;
      b.material.opacity = 0.1 + collide * 0.2;
    });
    bangFlash.position.set(0, 0, 0);
    bangFlash.material.opacity = collide > 0.95 ? (collide - 0.95) * 20 : 0;
    bangFlash.scale.setScalar(1 + collide * 8);
  }

  function getCameraFrame(t) {
    const pathT = (t * 0.08) % 1;
    const len = 150;
    const x = (pathT - 0.5) * len;
    const y = Math.sin(pathT * Math.PI * 3 + t * 0.5) * 12 + 8;
    const z = Math.sin(pathT * Math.PI * 6) * 10;
    const lookAhead = pathT + 0.05;
    const tx = (lookAhead - 0.5) * len;
    const ty = Math.sin(lookAhead * Math.PI * 3 + t * 0.5) * 12;
    const tz = Math.sin(lookAhead * Math.PI * 6) * 10;
    return { x, y, z, tx, ty, tz, dist: 1 };
  }

  function getReadouts() {
    return {
      rows: [
        { label: 'Cuerdas activas', value: '5', unit: '' },
        { label: 'Branas', value: '2', unit: 'D-branes' },
        { label: 'Dim. extra', value: '6', unit: '(simb.)' },
        { label: 'g_s', value: '0.1', unit: '(simb.)' },
        { label: 'Colisión brana', value: collisionPhase.toFixed(2), unit: 'fase' },
      ],
    };
  }

  return { group, animate, getCameraFrame, getReadouts };
}
