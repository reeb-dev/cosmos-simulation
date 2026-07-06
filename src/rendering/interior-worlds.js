import * as THREE from 'three';
import { HORIZON_THEORIES } from '../simulation/horizon-theories.js';

function makeGlowSphere(color, radius, opacity = 0.8) {
  const geo = new THREE.SphereGeometry(radius, 32, 32);
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
  });
  return new THREE.Mesh(geo, mat);
}

function createSingularityWorld(rs) {
  const g = new THREE.Group();
  const core = makeGlowSphere(0xff2200, rs * 0.15, 1);
  g.add(core);

  const ringGeo = new THREE.TorusGeometry(rs * 0.3, rs * 0.02, 8, 64);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.6 });
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = (Math.PI / 3) * i;
    ring.userData.spin = 0.5 + i * 0.3;
    g.add(ring);
  }

  const spikes = new THREE.Group();
  for (let i = 0; i < 12; i++) {
    const spike = new THREE.Mesh(
      new THREE.ConeGeometry(rs * 0.04, rs * 0.8, 4),
      new THREE.MeshBasicMaterial({ color: 0xff1100, transparent: true, opacity: 0.5 })
    );
    const a = (i / 12) * Math.PI * 2;
    spike.position.set(Math.cos(a) * rs * 0.4, 0, Math.sin(a) * rs * 0.4);
    spike.rotation.z = -Math.PI / 2;
    spike.rotation.y = a;
    spikes.add(spike);
  }
  g.add(spikes);
  g.userData.animate = (t) => {
    core.scale.setScalar(1 + Math.sin(t * 5) * 0.2);
    g.children.forEach((c, i) => {
      if (c.userData.spin) c.rotation.z += c.userData.spin * 0.02;
    });
    spikes.rotation.y += 0.03;
  };
  return g;
}

function createWhiteHoleWorld(rs) {
  const g = new THREE.Group();
  const core = makeGlowSphere(0xffffff, rs * 0.6, 0.95);
  g.add(core);

  const jetGeo = new THREE.ConeGeometry(rs * 0.3, rs * 4, 16, 1, true);
  const jetMat = new THREE.MeshBasicMaterial({
    color: 0xaaddff,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
  });
  const jetUp = new THREE.Mesh(jetGeo, jetMat);
  jetUp.position.y = rs * 2;
  const jetDown = jetUp.clone();
  jetDown.position.y = -rs * 2;
  jetDown.rotation.z = Math.PI;
  g.add(jetUp, jetDown);

  const burst = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, transparent: true, opacity: 0.8 })
  );
  const pts = [];
  for (let i = 0; i < 200; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = rs * (1 + Math.random() * 3);
    pts.push(Math.cos(a) * r, (Math.random() - 0.5) * rs, Math.sin(a) * r);
  }
  burst.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  g.add(burst);

  g.userData.animate = (t) => {
    core.scale.setScalar(1 + Math.sin(t * 3) * 0.1);
    burst.rotation.y += 0.02;
    const pos = burst.geometry.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
      const dir = Math.sign(pos[i]) || 1;
      pos[i] += dir * 0.05;
      pos[i + 2] += (Math.sign(pos[i + 2]) || 1) * 0.05;
    }
    burst.geometry.attributes.position.needsUpdate = true;
  };
  return g;
}

function createWormholeWorld(rs) {
  const g = new THREE.Group();
  const tunnelGeo = new THREE.CylinderGeometry(rs * 0.5, rs * 0.5, rs * 8, 32, 1, true);
  const tunnelMat = new THREE.MeshBasicMaterial({
    color: 0x2244aa,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
    wireframe: true,
  });
  const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat);
  tunnel.rotation.x = Math.PI / 2;
  g.add(tunnel);

  const throat = new THREE.Mesh(
    new THREE.TorusGeometry(rs * 0.5, rs * 0.08, 16, 64),
    new THREE.MeshBasicMaterial({ color: 0x66bbff, transparent: true, opacity: 0.7 })
  );
  g.add(throat);

  const farStars = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({ color: 0xffffcc, size: 1.0, sizeAttenuation: true })
  );
  const starPos = [];
  for (let i = 0; i < 300; i++) {
    starPos.push(
      (Math.random() - 0.5) * rs * 4,
      rs * 4 + Math.random() * rs * 2,
      (Math.random() - 0.5) * rs * 4
    );
  }
  farStars.geometry.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
  g.add(farStars);

  const label = makeGlowSphere(0x4488ff, rs * 0.2, 0.5);
  label.position.y = rs * 5;
  g.add(label);

  g.userData.animate = (t) => {
    throat.rotation.y += 0.02;
    tunnel.rotation.z += 0.01;
    farStars.rotation.y += 0.005;
  };
  return g;
}

function createBabyUniverseWorld(rs) {
  const g = new THREE.Group();
  const bubble = makeGlowSphere(0xaa66ff, rs * 0.8, 0.3);
  g.add(bubble);

  const miniStars = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({ color: 0xcc99ff, size: 0.4, transparent: true, opacity: 0.9 })
  );
  const pts = [];
  for (let i = 0; i < 150; i++) {
    const r = Math.random() * rs * 0.7;
    const a = Math.random() * Math.PI * 2;
    const b = Math.acos(2 * Math.random() - 1);
    pts.push(r * Math.sin(b) * Math.cos(a), r * Math.sin(b) * Math.sin(a), r * Math.cos(b));
  }
  miniStars.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  g.add(miniStars);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(rs * 0.5, rs * 0.9, 32),
    new THREE.MeshBasicMaterial({ color: 0xff66cc, transparent: true, opacity: 0.4, side: THREE.DoubleSide })
  );
  ring.rotation.x = Math.PI / 2;
  g.add(ring);

  g.userData.animate = (t) => {
    const s = 1 + t * 0.05;
    bubble.scale.setScalar(Math.min(s, 2));
    miniStars.scale.setScalar(Math.min(s, 2));
    ring.scale.setScalar(Math.min(s, 2));
    ring.rotation.z += 0.01;
  };
  return g;
}

function createFirewallWorld(rs) {
  const g = new THREE.Group();
  const wallGeo = new THREE.SphereGeometry(rs * 0.95, 32, 32);
  const wallMat = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    transparent: true,
    side: THREE.BackSide,
    vertexShader: `
      varying vec3 vPos;
      void main() {
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec3 vPos;
      void main() {
        float n = sin(vPos.x * 20.0 + time * 5.0) * sin(vPos.y * 20.0 + time * 4.0) * sin(vPos.z * 20.0 + time * 6.0);
        vec3 col = mix(vec3(1.0, 0.3, 0.0), vec3(1.0, 0.9, 0.2), n * 0.5 + 0.5);
        gl_FragColor = vec4(col, 0.85);
      }
    `,
  });
  const wall = new THREE.Mesh(wallGeo, wallMat);
  g.add(wall);

  const debris = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({ color: 0xffaa00, size: 0.6, transparent: true, opacity: 0.9 })
  );
  const pts = [];
  for (let i = 0; i < 100; i++) {
    const a = Math.random() * Math.PI * 2;
    const b = Math.acos(2 * Math.random() - 1);
    const r = rs * 0.9;
    pts.push(r * Math.sin(b) * Math.cos(a), r * Math.sin(b) * Math.sin(a), r * Math.cos(b));
  }
  debris.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  g.add(debris);
  g.userData.wallMat = wallMat;
  g.userData.animate = (t) => {
    wallMat.uniforms.time.value = t;
    debris.rotation.y += 0.04;
  };
  return g;
}

function createHolographicWorld(rs) {
  const g = new THREE.Group();
  const gridGeo = new THREE.SphereGeometry(rs * 0.9, 32, 32);
  const gridMat = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    wireframe: true,
    transparent: true,
    opacity: 0.7,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec2 vUv;
      void main() {
        float bits = step(0.5, fract(vUv.x * 40.0 + time)) * step(0.5, fract(vUv.y * 40.0 - time * 0.5));
        vec3 col = mix(vec3(0.0, 0.8, 0.6), vec3(0.2, 1.0, 0.8), bits);
        gl_FragColor = vec4(col, 0.8);
      }
    `,
  });
  const grid = new THREE.Mesh(gridGeo, gridMat);
  g.add(grid);

  const data = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({ color: 0x00ffcc, size: 0.3, transparent: true, opacity: 0.6 })
  );
  const pts = [];
  for (let i = 0; i < 500; i++) {
    const a = Math.random() * Math.PI * 2;
    const b = Math.acos(2 * Math.random() - 1);
    const r = rs * 0.92;
    pts.push(r * Math.sin(b) * Math.cos(a), r * Math.sin(b) * Math.sin(a), r * Math.cos(b));
  }
  data.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  g.add(data);
  g.userData.gridMat = gridMat;
  g.userData.animate = (t) => {
    gridMat.uniforms.time.value = t;
    grid.rotation.y += 0.005;
  };
  return g;
}

function createQuantumFoamWorld(rs) {
  const g = new THREE.Group();
  const foam = new THREE.Group();
  for (let i = 0; i < 40; i++) {
    const s = rs * (0.05 + Math.random() * 0.15);
    const bubble = new THREE.Mesh(
      new THREE.IcosahedronGeometry(s, 0),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.3 + Math.random() * 0.3, 0.8, 0.5),
        transparent: true,
        opacity: 0.4,
        wireframe: true,
      })
    );
    bubble.position.set(
      (Math.random() - 0.5) * rs * 1.5,
      (Math.random() - 0.5) * rs * 1.5,
      (Math.random() - 0.5) * rs * 1.5
    );
    bubble.userData.v = new THREE.Vector3(
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02
    );
    foam.add(bubble);
  }
  g.add(foam);

  g.userData.animate = (t) => {
    foam.children.forEach((b) => {
      b.position.add(b.userData.v);
      b.rotation.x += 0.02;
      b.rotation.y += 0.03;
      if (b.position.length() > rs * 0.8) b.position.multiplyScalar(-0.9);
    });
  };
  return g;
}

function createFriedmannEchoWorld(rs) {
  const g = new THREE.Group();
  const shells = new THREE.Group();
  for (let i = 1; i <= 6; i++) {
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(rs * i * 0.5, 24, 24),
      new THREE.MeshBasicMaterial({
        color: 0xff66cc,
        wireframe: true,
        transparent: true,
        opacity: 0.25 / i,
      })
    );
    shell.userData.scale = 1 + i * 0.02;
    shells.add(shell);
  }
  g.add(shells);

  const stars = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({ color: 0xffaadd, size: 0.6, transparent: true, opacity: 0.8 })
  );
  const pts = [];
  for (let i = 0; i < 400; i++) {
    const a = Math.random() * Math.PI * 2;
    const b = Math.acos(2 * Math.random() - 1);
    const r = rs * (0.5 + Math.random() * 3);
    pts.push(r * Math.sin(b) * Math.cos(a), r * Math.sin(b) * Math.sin(a), r * Math.cos(b));
  }
  stars.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  g.add(stars);

  g.userData.animate = (t) => {
    shells.children.forEach((s, i) => {
      const scale = 1 + t * 0.03 * (i + 1);
      s.scale.setScalar(scale);
    });
    stars.scale.setScalar(1 + t * 0.02);
  };
  return g;
}

function createHybridRegimeWorld(rs) {
  const g = new THREE.Group();

  const geoShell = new THREE.Mesh(
    new THREE.SphereGeometry(rs * 0.6, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x4488ff, wireframe: true, transparent: true, opacity: 0.5 })
  );
  g.add(geoShell);

  const newtonShell = new THREE.Mesh(
    new THREE.SphereGeometry(rs * 2.5, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x44ff88, wireframe: true, transparent: true, opacity: 0.35 })
  );
  g.add(newtonShell);

  const cosmoShell = new THREE.Mesh(
    new THREE.SphereGeometry(rs * 5, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xaa66ff, wireframe: true, transparent: true, opacity: 0.2 })
  );
  g.add(cosmoShell);

  const labels = [
    { y: rs * 0.6, color: 0x4488ff },
    { y: rs * 2.5, color: 0x44ff88 },
    { y: rs * 5, color: 0xaa66ff },
  ];
  labels.forEach((l) => {
    const dot = makeGlowSphere(l.color, rs * 0.08, 0.8);
    dot.position.y = l.y;
    g.add(dot);
  });

  g.userData.animate = (t) => {
    geoShell.rotation.y += 0.02;
    newtonShell.rotation.y -= 0.015;
    cosmoShell.rotation.y += 0.01;
    cosmoShell.scale.setScalar(1 + Math.sin(t) * 0.05);
  };
  return g;
}

function createTemporalFractureWorld(rs) {
  const g = new THREE.Group();

  const frozen = new THREE.Group();
  for (let i = 0; i < 20; i++) {
    const p = makeGlowSphere(0x88aaff, rs * 0.06, 0.7);
    const a = (i / 20) * Math.PI * 2;
    p.position.set(Math.cos(a) * rs * 0.8, 0, Math.sin(a) * rs * 0.8);
    frozen.add(p);
  }
  frozen.position.x = -rs * 0.3;
  g.add(frozen);

  const expanding = new THREE.Group();
  const expStars = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({ color: 0xffdd44, size: 0.5 })
  );
  const pts = [];
  for (let i = 0; i < 200; i++) {
    pts.push((Math.random() - 0.3) * rs * 3, (Math.random() - 0.5) * rs, (Math.random() - 0.5) * rs * 2);
  }
  expStars.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  expanding.add(expStars);
  expanding.position.x = rs * 0.3;
  g.add(expanding);

  const fracture = new THREE.Mesh(
    new THREE.PlaneGeometry(rs * 0.1, rs * 3),
    new THREE.MeshBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 0.6 })
  );
  g.add(fracture);

  g.userData.animate = (t) => {
    expanding.scale.setScalar(1 + t * 0.04);
    fracture.material.opacity = 0.4 + Math.sin(t * 4) * 0.2;
  };
  return g;
}

function createInformationLoopWorld(rs) {
  const g = new THREE.Group();
  const loop = new THREE.Group();

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(rs * 0.7, rs * 0.04, 8, 64),
    new THREE.MeshBasicMaterial({ color: 0x99ff66, transparent: true, opacity: 0.7 })
  );
  loop.add(ring);

  const bits = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({ color: 0xccff99, size: 0.4 })
  );
  const pts = [];
  for (let i = 0; i < 300; i++) {
    const a = (i / 300) * Math.PI * 2;
    const r = rs * 0.7 + Math.sin(i * 0.5) * rs * 0.1;
    pts.push(Math.cos(a) * r, Math.sin(i * 0.3) * rs * 0.2, Math.sin(a) * r);
  }
  bits.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  loop.add(bits);

  const core = makeGlowSphere(0x66ff33, rs * 0.15, 0.5);
  loop.add(core);
  g.add(loop);

  g.userData.animate = (t) => {
    loop.rotation.y += 0.03;
    const pos = bits.geometry.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
      const a = Math.atan2(pos[i + 2], pos[i]) + 0.02;
      const r = Math.sqrt(pos[i] * pos[i] + pos[i + 2] * pos[i + 2]);
      pos[i] = Math.cos(a) * r;
      pos[i + 2] = Math.sin(a) * r;
    }
    bits.geometry.attributes.position.needsUpdate = true;
  };
  return g;
}

function createPlanckThresholdWorld(rs) {
  const g = new THREE.Group();
  const foam = new THREE.Group();
  const lattice = new THREE.Group();

  for (let i = 0; i < 60; i++) {
    const s = rs * (0.02 + Math.random() * 0.08);
    const hue = 0.75 + Math.random() * 0.15;
    const bubble = new THREE.Mesh(
      new THREE.OctahedronGeometry(s, 0),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(hue, 0.9, 0.55),
        transparent: true,
        opacity: 0.55,
        wireframe: true,
      })
    );
    const r = rs * (0.2 + Math.random() * 0.75);
    const a = Math.random() * Math.PI * 2;
    const b = Math.acos(2 * Math.random() - 1);
    bubble.position.set(r * Math.sin(b) * Math.cos(a), r * Math.sin(b) * Math.sin(a), r * Math.cos(b));
    bubble.userData.phase = Math.random() * Math.PI * 2;
    foam.add(bubble);
  }
  g.add(foam);

  const gridMat = new THREE.LineBasicMaterial({ color: 0xdd99ff, transparent: true, opacity: 0.35 });
  for (let i = -3; i <= 3; i++) {
    for (let j = -3; j <= 3; j++) {
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(i * rs * 0.15, -rs * 0.5, j * rs * 0.15),
        new THREE.Vector3(i * rs * 0.15, rs * 0.5, j * rs * 0.15),
      ]);
      lattice.add(new THREE.Line(geo, gridMat));
    }
  }
  g.add(lattice);

  const core = makeGlowSphere(0xffffff, rs * 0.05, 0.9);
  g.add(core);

  g.userData.animate = (t) => {
    foam.children.forEach((b) => {
      const pulse = 1 + Math.sin(t * 8 + b.userData.phase) * 0.25;
      b.scale.setScalar(pulse);
      b.rotation.x += 0.04;
      b.rotation.z += 0.03;
      const len = b.position.length();
      if (len > rs * 0.85) b.position.multiplyScalar(0.92);
      else b.position.multiplyScalar(1.002);
    });
    core.scale.setScalar(1 + Math.sin(t * 12) * 0.3);
    lattice.rotation.y += 0.008;
  };
  return g;
}

function createCosmicResonanceWorld(rs) {
  const g = new THREE.Group();
  const waves = new THREE.Group();

  for (let i = 1; i <= 8; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(rs * 0.25 * i, rs * 0.012, 8, 80),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.92 - i * 0.04, 0.85, 0.55),
        transparent: true,
        opacity: 0.45 / i,
      })
    );
    ring.rotation.x = Math.PI / 2 + i * 0.08;
    ring.userData.harmonic = i;
    waves.add(ring);
  }
  g.add(waves);

  const axis = new THREE.Mesh(
    new THREE.CylinderGeometry(rs * 0.02, rs * 0.02, rs * 4, 12),
    new THREE.MeshBasicMaterial({ color: 0xff88bb, transparent: true, opacity: 0.5 })
  );
  axis.rotation.z = Math.PI / 2;
  g.add(axis);

  const nodes = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({ color: 0xffaacd, size: 0.5, transparent: true, opacity: 0.85 })
  );
  const pts = [];
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * Math.PI * 4;
    const r = rs * (0.3 + (i % 8) * 0.12);
    pts.push(Math.cos(a) * r, Math.sin(a * 2) * rs * 0.2, Math.sin(a) * r);
  }
  nodes.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  g.add(nodes);

  g.userData.animate = (t) => {
    waves.children.forEach((ring) => {
      const h = ring.userData.harmonic;
      ring.scale.setScalar(1 + Math.sin(t * h * 0.8) * 0.08);
      ring.rotation.z += 0.01 * h;
    });
    nodes.rotation.y += 0.015;
  };
  return g;
}

function createAccretionInvertedWorld(rs) {
  const g = new THREE.Group();
  const disk = new THREE.Mesh(
    new THREE.RingGeometry(rs * 0.2, rs * 2.2, 64, 8),
    new THREE.MeshBasicMaterial({
      color: 0xff6622,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
    })
  );
  disk.rotation.x = Math.PI / 2;
  g.add(disk);

  const innerJet = new THREE.Mesh(
    new THREE.ConeGeometry(rs * 0.25, rs * 2.5, 16, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xffaa44, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
  );
  innerJet.position.y = -rs * 1.2;
  innerJet.rotation.x = Math.PI;
  g.add(innerJet);

  const outerJet = innerJet.clone();
  outerJet.position.y = rs * 1.2;
  outerJet.rotation.x = 0;
  g.add(outerJet);

  const inflow = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({ color: 0xff4400, size: 0.45, transparent: true, opacity: 0.9 })
  );
  const pts = [];
  for (let i = 0; i < 250; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = rs * (0.5 + Math.random() * 2);
    pts.push(Math.cos(a) * r, (Math.random() - 0.5) * rs * 0.1, Math.sin(a) * r);
  }
  inflow.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  g.add(inflow);

  g.userData.animate = (t) => {
    disk.rotation.z += 0.025;
    const pos = inflow.geometry.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
      const x = pos[i];
      const z = pos[i + 2];
      const r = Math.sqrt(x * x + z * z) || 0.01;
      const shrink = 0.97;
      pos[i] = x * shrink;
      pos[i + 2] = z * shrink;
      if (r < rs * 0.15) {
        const a = Math.random() * Math.PI * 2;
        const nr = rs * (1.5 + Math.random());
        pos[i] = Math.cos(a) * nr;
        pos[i + 2] = Math.sin(a) * nr;
      }
    }
    inflow.geometry.attributes.position.needsUpdate = true;
    innerJet.scale.y = 1 + Math.sin(t * 3) * 0.15;
    outerJet.scale.y = 1 + Math.cos(t * 3) * 0.15;
  };
  return g;
}

function createEternalGeodesicWorld(rs) {
  const g = new THREE.Group();
  const rPhoton = rs * 1.5;

  const photonRing = new THREE.Mesh(
    new THREE.TorusGeometry(rPhoton, rs * 0.03, 12, 128),
    new THREE.MeshBasicMaterial({ color: 0xffee88, transparent: true, opacity: 0.85 })
  );
  photonRing.rotation.x = Math.PI / 2;
  g.add(photonRing);

  const iscoRing = new THREE.Mesh(
    new THREE.TorusGeometry(rs * 3, rs * 0.02, 8, 96),
    new THREE.MeshBasicMaterial({ color: 0x888844, wireframe: true, transparent: true, opacity: 0.4 })
  );
  iscoRing.rotation.x = Math.PI / 2.2;
  g.add(iscoRing);

  const photons = new THREE.Group();
  for (let i = 0; i < 24; i++) {
    const dot = makeGlowSphere(0xffffaa, rs * 0.04, 0.95);
    dot.userData.angle = (i / 24) * Math.PI * 2;
    dot.userData.tilt = (i % 3) * 0.35;
    photons.add(dot);
  }
  g.add(photons);

  const trails = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const curve = new THREE.EllipseCurve(0, 0, rPhoton, rPhoton * (0.85 + i * 0.03), 0, Math.PI * 2);
    const points = curve.getPoints(80).map((p) => new THREE.Vector3(p.x, Math.sin(i) * rs * 0.15, p.y));
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color: 0xeedd55, transparent: true, opacity: 0.25 })
    );
    line.rotation.y = (i / 6) * Math.PI;
    trails.add(line);
  }
  g.add(trails);

  g.userData.animate = (t) => {
    photonRing.rotation.z += 0.04;
    photons.children.forEach((dot) => {
      const a = dot.userData.angle + t * 1.2;
      const r = rPhoton;
      dot.position.set(
        Math.cos(a) * r,
        Math.sin(a * 2 + dot.userData.tilt) * rs * 0.12,
        Math.sin(a) * r
      );
    });
    trails.rotation.y += 0.01;
  };
  return g;
}

function createMaxEntropyWorld(rs) {
  const g = new THREE.Group();
  const shellGeo = new THREE.SphereGeometry(rs * 0.85, 48, 48);
  const shellMat = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    transparent: true,
    side: THREE.BackSide,
    vertexShader: `
      varying vec3 vPos;
      void main() {
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec3 vPos;
      void main() {
        float n = fract(sin(dot(vPos.xy * 30.0 + time, vec2(12.9898, 78.233))) * 43758.5453);
        vec3 col = mix(vec3(0.1, 0.9, 0.7), vec3(0.0, 0.4, 0.35), n);
        gl_FragColor = vec4(col, 0.75);
      }
    `,
  });
  const shell = new THREE.Mesh(shellGeo, shellMat);
  g.add(shell);

  const hawking = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({ color: 0xaaffee, size: 0.35, transparent: true, opacity: 0.7 })
  );
  const pts = [];
  for (let i = 0; i < 180; i++) {
    const a = Math.random() * Math.PI * 2;
    const b = Math.acos(2 * Math.random() - 1);
    const r = rs * (0.9 + Math.random() * 0.4);
    pts.push(r * Math.sin(b) * Math.cos(a), r * Math.sin(b) * Math.sin(a), r * Math.cos(b));
  }
  hawking.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  g.add(hawking);

  const core = makeGlowSphere(0x224433, rs * 0.2, 0.35);
  g.add(core);

  g.userData.shellMat = shellMat;
  g.userData.animate = (t) => {
    shellMat.uniforms.time.value = t * 0.5;
    shell.rotation.y += 0.004;
    const pos = hawking.geometry.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
      const x = pos[i];
      const y = pos[i + 1];
      const z = pos[i + 2];
      const r = Math.sqrt(x * x + y * y + z * z) || 0.01;
      const drift = 0.003;
      pos[i] += (x / r) * drift;
      pos[i + 1] += (y / r) * drift;
      pos[i + 2] += (z / r) * drift;
      if (r > rs * 1.4) {
        pos[i] *= rs * 0.6 / r;
        pos[i + 1] *= rs * 0.6 / r;
        pos[i + 2] *= rs * 0.6 / r;
      }
    }
    hawking.geometry.attributes.position.needsUpdate = true;
  };
  return g;
}

function createOmegaMultiverseWorld(rs) {
  const g = new THREE.Group();
  const branches = new THREE.Group();

  const configs = [
    { color: 0x6688ff, x: -rs * 1.2, label: 'Ωₘ' },
    { color: 0xcc66ff, x: 0, label: 'eq' },
    { color: 0xff66aa, x: rs * 1.2, label: 'ΩΛ' },
  ];

  configs.forEach((cfg) => {
    const branch = new THREE.Group();
    branch.position.x = cfg.x;
    const bubble = makeGlowSphere(cfg.color, rs * 0.45, 0.35);
    branch.add(bubble);

    const mini = new THREE.Points(
      new THREE.BufferGeometry(),
      new THREE.PointsMaterial({ color: cfg.color, size: 0.35, transparent: true, opacity: 0.85 })
    );
    const pts = [];
    for (let i = 0; i < 80; i++) {
      const r = Math.random() * rs * 0.4;
      const a = Math.random() * Math.PI * 2;
      const b = Math.acos(2 * Math.random() - 1);
      pts.push(r * Math.sin(b) * Math.cos(a), r * Math.sin(b) * Math.sin(a), r * Math.cos(b));
    }
    mini.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    branch.add(mini);

    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(rs * 0.03, rs * 0.06, rs * 1.5, 8),
      new THREE.MeshBasicMaterial({ color: cfg.color, transparent: true, opacity: 0.5 })
    );
    stem.position.y = -rs * 0.9;
    branch.add(stem);
    branch.userData.cfg = cfg;
    branches.add(branch);
  });

  const fork = new THREE.Mesh(
    new THREE.ConeGeometry(rs * 0.2, rs * 1.2, 3),
    new THREE.MeshBasicMaterial({ color: 0xddddff, transparent: true, opacity: 0.4 })
  );
  fork.position.y = rs * 0.5;
  fork.rotation.y = Math.PI / 6;
  g.add(fork);
  g.add(branches);

  g.userData.animate = (t) => {
    branches.children.forEach((branch, i) => {
      const s = 1 + Math.sin(t * 0.8 + i) * 0.06;
      branch.scale.setScalar(s);
      branch.rotation.y = Math.sin(t * 0.3 + i) * 0.15;
    });
    fork.rotation.y += 0.008;
  };
  return g;
}

function createHawkingIslandsWorld(rs) {
  const g = new THREE.Group();
  const horizon = new THREE.Mesh(
    new THREE.SphereGeometry(rs * 0.92, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0x224488, wireframe: true, transparent: true, opacity: 0.5 })
  );
  g.add(horizon);

  const islands = new THREE.Group();
  for (let i = 0; i < 8; i++) {
    const island = makeGlowSphere(0x66aaff, rs * (0.08 + Math.random() * 0.06), 0.7);
    const a = (i / 8) * Math.PI * 2;
    const dist = rs * (1.1 + Math.random() * 0.8);
    island.position.set(Math.cos(a) * dist, (Math.random() - 0.5) * rs * 0.5, Math.sin(a) * dist);
    island.userData.orbit = a;
    islands.add(island);
  }
  g.add(islands);

  const radiation = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({ color: 0xaaddff, size: 0.35, transparent: true, opacity: 0.6 })
  );
  const pts = [];
  for (let i = 0; i < 200; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = rs * (0.95 + Math.random() * 0.3);
    pts.push(Math.cos(a) * r, (Math.random() - 0.5) * rs * 0.2, Math.sin(a) * r);
  }
  radiation.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  g.add(radiation);

  g.userData.animate = (t) => {
    islands.children.forEach((island) => {
      island.userData.orbit += 0.008;
      const d = island.position.length();
      island.position.x = Math.cos(island.userData.orbit) * d;
      island.position.z = Math.sin(island.userData.orbit) * d;
      island.scale.setScalar(1 + Math.sin(t * 2 + island.userData.orbit) * 0.15);
    });
    radiation.rotation.y += 0.01;
  };
  return g;
}

function createErEprBridgeWorld(rs) {
  const g = new THREE.Group();
  const bridges = new THREE.Group();
  for (let i = 0; i < 12; i++) {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-rs * 0.8, 0, 0),
      new THREE.Vector3(0, rs * (0.3 + i * 0.05), 0),
      new THREE.Vector3(rs * 0.8, 0, 0)
    );
    const points = curve.getPoints(40);
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color: 0x4488ff, transparent: true, opacity: 0.3 + (i % 3) * 0.1 })
    );
    line.rotation.y = (i / 12) * Math.PI * 2;
    bridges.add(line);
  }
  g.add(bridges);

  const throat = new THREE.Mesh(
    new THREE.TorusKnotGeometry(rs * 0.25, rs * 0.04, 64, 8),
    new THREE.MeshBasicMaterial({ color: 0x66bbff, wireframe: true, transparent: true, opacity: 0.6 })
  );
  g.add(throat);

  const pairs = new THREE.Group();
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const dotA = makeGlowSphere(0x00ffcc, rs * 0.04, 0.9);
    const dotB = makeGlowSphere(0xff66cc, rs * 0.04, 0.9);
    dotA.position.set(Math.cos(a) * rs * 0.7, rs * 0.3, Math.sin(a) * rs * 0.7);
    dotB.position.set(Math.cos(a + Math.PI) * rs * 0.7, -rs * 0.3, Math.sin(a + Math.PI) * rs * 0.7);
    dotA.userData.pair = dotB;
    pairs.add(dotA, dotB);
  }
  g.add(pairs);

  g.userData.animate = (t) => {
    throat.rotation.x += 0.02;
    throat.rotation.y += 0.03;
    bridges.rotation.y += 0.015;
    pairs.children.forEach((dot, i) => {
      dot.scale.setScalar(1 + Math.sin(t * 3 + i) * 0.2);
    });
  };
  return g;
}

function createPlanckStarWorld(rs) {
  const g = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(rs * 0.35, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffaa44, transparent: true, opacity: 0.9 })
  );
  g.add(core);

  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(rs * 0.5, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xff6622, wireframe: true, transparent: true, opacity: 0.6 })
  );
  g.add(shell);

  const bounceRing = new THREE.Mesh(
    new THREE.TorusGeometry(rs * 0.5, rs * 0.03, 8, 64),
    new THREE.MeshBasicMaterial({ color: 0xffdd88, transparent: true, opacity: 0.8 })
  );
  bounceRing.rotation.x = Math.PI / 2;
  g.add(bounceRing);

  const shockwaves = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const wave = new THREE.Mesh(
      new THREE.SphereGeometry(rs * (0.55 + i * 0.15), 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xff8844, wireframe: true, transparent: true, opacity: 0.2 })
    );
    wave.userData.phase = i * 0.5;
    shockwaves.add(wave);
  }
  g.add(shockwaves);

  g.userData.animate = (t) => {
    const pulse = 1 + Math.sin(t * 4) * 0.08;
    core.scale.setScalar(pulse);
    shell.scale.setScalar(1 / pulse);
    bounceRing.rotation.z += 0.03;
    shockwaves.children.forEach((w) => {
      const s = 1 + Math.sin(t * 2 + w.userData.phase) * 0.1;
      w.scale.setScalar(s);
    });
  };
  return g;
}

function createFuzzballWorld(rs) {
  const g = new THREE.Group();
  const fuzz = new THREE.Group();
  for (let i = 0; i < 50; i++) {
    const s = rs * (0.03 + Math.random() * 0.12);
    const strand = new THREE.Mesh(
      new THREE.TorusKnotGeometry(s, s * 0.15, 32, 4, 2, 3),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.35 + Math.random() * 0.2, 0.7, 0.5),
        transparent: true,
        opacity: 0.35,
        wireframe: Math.random() > 0.5,
      })
    );
    const r = rs * (0.2 + Math.random() * 0.65);
    const a = Math.random() * Math.PI * 2;
    const b = Math.acos(2 * Math.random() - 1);
    strand.position.set(r * Math.sin(b) * Math.cos(a), r * Math.sin(b) * Math.sin(a), r * Math.cos(b));
    strand.userData.spin = new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(0.02);
    fuzz.add(strand);
  }
  g.add(fuzz);

  const envelope = new THREE.Mesh(
    new THREE.SphereGeometry(rs * 0.88, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x44ff88, transparent: true, opacity: 0.08, wireframe: true })
  );
  g.add(envelope);

  g.userData.animate = (t) => {
    fuzz.children.forEach((s) => {
      s.rotation.x += s.userData.spin.x;
      s.rotation.y += s.userData.spin.y;
      s.rotation.z += s.userData.spin.z;
      s.position.multiplyScalar(1 + Math.sin(t * 5 + s.id) * 0.001);
    });
    envelope.rotation.y += 0.005;
  };
  return g;
}

function createCptMirrorWorld(rs) {
  const g = new THREE.Group();
  const mirror = new THREE.Mesh(
    new THREE.PlaneGeometry(rs * 2, rs * 3),
    new THREE.MeshBasicMaterial({ color: 0xcc66ff, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
  );
  g.add(mirror);

  const left = new THREE.Group();
  const right = new THREE.Group();
  right.scale.x = -1;

  for (const [grp, hue, x] of [[left, 0.6, -rs * 0.6], [right, 0.0, rs * 0.6]]) {
    grp.position.x = x;
    const stars = new THREE.Points(
      new THREE.BufferGeometry(),
      new THREE.PointsMaterial({ color: new THREE.Color().setHSL(hue, 0.8, 0.6), size: 0.45 })
    );
    const pts = [];
    for (let i = 0; i < 150; i++) {
      pts.push((Math.random() - 0.5) * rs, (Math.random() - 0.5) * rs * 1.5, (Math.random() - 0.5) * rs * 0.5);
    }
    stars.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    grp.add(stars);
    g.add(grp);
  }

  const arrow = new THREE.Mesh(
    new THREE.ConeGeometry(rs * 0.08, rs * 0.3, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })
  );
  arrow.position.y = rs * 0.8;
  arrow.rotation.z = Math.PI;
  g.add(arrow);

  g.userData.animate = (t) => {
    mirror.material.opacity = 0.25 + Math.sin(t * 2) * 0.1;
    g.children.forEach((c) => {
      if (c.type === 'Group') c.rotation.y = Math.sin(t * 0.5) * 0.1;
    });
  };
  return g;
}

function createAdsCftDynamicWorld(rs) {
  const g = new THREE.Group();
  const bulk = new THREE.Mesh(
    new THREE.SphereGeometry(rs * 0.85, 32, 32),
    new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      transparent: true,
      side: THREE.BackSide,
      vertexShader: `
        varying vec3 vPos;
        void main() {
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vPos;
        void main() {
          float depth = length(vPos) / ${rs.toFixed(2)};
          float wave = sin(vPos.y * 15.0 + time * 2.0) * 0.5 + 0.5;
          vec3 col = mix(vec3(0.0, 0.5, 0.6), vec3(0.2, 0.9, 0.7), wave);
          gl_FragColor = vec4(col, 0.6 * (1.0 - depth * 0.3));
        }
      `,
    })
  );
  g.add(bulk);
  g.userData.bulkMat = bulk.material;

  const boundary = new THREE.Mesh(
    new THREE.SphereGeometry(rs * 0.95, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0x00ffaa, wireframe: true, transparent: true, opacity: 0.5 })
  );
  g.add(boundary);

  const cftBits = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({ color: 0x00ddbb, size: 0.3, transparent: true, opacity: 0.8 })
  );
  const pts = [];
  for (let i = 0; i < 400; i++) {
    const a = Math.random() * Math.PI * 2;
    const b = Math.acos(2 * Math.random() - 1);
    const r = rs * 0.94;
    pts.push(r * Math.sin(b) * Math.cos(a), r * Math.sin(b) * Math.sin(a), r * Math.cos(b));
  }
  cftBits.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  g.add(cftBits);

  g.userData.animate = (t) => {
    bulk.material.uniforms.time.value = t;
    boundary.rotation.y += 0.008;
    cftBits.rotation.y -= 0.005;
  };
  return g;
}

function createBabelLibraryWorld(rs) {
  const g = new THREE.Group();
  const shelves = new THREE.Group();
  for (let level = 0; level < 8; level++) {
    for (let col = -4; col <= 4; col++) {
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(rs * 0.06, rs * 0.15, rs * 0.03),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL((level + col) * 0.05 % 1, 0.6, 0.45 + Math.random() * 0.2),
        })
      );
      book.position.set(col * rs * 0.12, (level - 4) * rs * 0.18, (Math.random() - 0.5) * rs * 0.3);
      book.rotation.y = (Math.random() - 0.5) * 0.3;
      shelves.add(book);
    }
  }
  g.add(shelves);

  const infinite = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({ color: 0xffddaa, size: 0.25, transparent: true, opacity: 0.5 })
  );
  const pts = [];
  for (let i = 0; i < 500; i++) {
    pts.push((Math.random() - 0.5) * rs * 3, (Math.random() - 0.5) * rs * 3, (Math.random() - 0.5) * rs * 3);
  }
  infinite.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  g.add(infinite);

  const glow = makeGlowSphere(0xffcc88, rs * 0.2, 0.4);
  g.add(glow);

  g.userData.animate = (t) => {
    shelves.rotation.y += 0.005;
    infinite.rotation.x += 0.002;
    glow.scale.setScalar(1 + Math.sin(t) * 0.1);
  };
  return g;
}

function createFriedmannGateWorld(rs) {
  const g = new THREE.Group();
  const gate = new THREE.Mesh(
    new THREE.TorusGeometry(rs * 0.6, rs * 0.08, 16, 64),
    new THREE.MeshBasicMaterial({ color: 0xff66ff, transparent: true, opacity: 0.8 })
  );
  gate.rotation.x = Math.PI / 2;
  g.add(gate);

  const portal = new THREE.Mesh(
    new THREE.CircleGeometry(rs * 0.55, 48),
    new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      transparent: true,
      side: THREE.DoubleSide,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        void main() {
          float r = length(vUv - 0.5) * 2.0;
          float spiral = sin(atan(vUv.y - 0.5, vUv.x - 0.5) * 8.0 + time * 3.0 - r * 10.0);
          vec3 col = mix(vec3(0.8, 0.2, 1.0), vec3(0.2, 0.8, 1.0), spiral * 0.5 + 0.5);
          gl_FragColor = vec4(col, 0.85 * (1.0 - r));
        }
      `,
    })
  );
  portal.rotation.x = Math.PI / 2;
  g.add(portal);
  g.userData.portalMat = portal.material;

  const twinUniverse = new THREE.Group();
  twinUniverse.position.z = rs * 0.5;
  const twinStars = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({ color: 0xaaddff, size: 0.5, transparent: true, opacity: 0.9 })
  );
  const pts = [];
  for (let i = 0; i < 300; i++) {
    const r = Math.random() * rs * 2;
    const a = Math.random() * Math.PI * 2;
    const b = Math.acos(2 * Math.random() - 1);
    pts.push(r * Math.sin(b) * Math.cos(a), r * Math.sin(b) * Math.sin(a), r * Math.cos(b));
  }
  twinStars.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  twinUniverse.add(twinStars);
  g.add(twinUniverse);

  const bang = makeGlowSphere(0xffffff, rs * 0.1, 0.9);
  bang.position.z = rs * 0.3;
  twinUniverse.add(bang);

  g.userData.animate = (t) => {
    portal.material.uniforms.time.value = t;
    gate.rotation.z += 0.02;
    twinUniverse.scale.setScalar(1 + t * 0.02);
    bang.scale.setScalar(1 + Math.sin(t * 5) * 0.3);
  };
  return g;
}

const BUILDERS = {
  singularity: createSingularityWorld,
  white_hole: createWhiteHoleWorld,
  wormhole: createWormholeWorld,
  baby_universe: createBabyUniverseWorld,
  firewall: createFirewallWorld,
  holographic: createHolographicWorld,
  quantum_foam: createQuantumFoamWorld,
  friedmann_echo: createFriedmannEchoWorld,
  hybrid_regime: createHybridRegimeWorld,
  temporal_fracture: createTemporalFractureWorld,
  information_loop: createInformationLoopWorld,
  planck_threshold: createPlanckThresholdWorld,
  cosmic_resonance: createCosmicResonanceWorld,
  accretion_inverted: createAccretionInvertedWorld,
  eternal_geodesic: createEternalGeodesicWorld,
  max_entropy: createMaxEntropyWorld,
  hawking_islands: createHawkingIslandsWorld,
  er_epr_bridge: createErEprBridgeWorld,
  planck_star: createPlanckStarWorld,
  fuzzball: createFuzzballWorld,
  cpt_mirror: createCptMirrorWorld,
  ads_cft_dynamic: createAdsCftDynamicWorld,
  babel_library: createBabelLibraryWorld,
  friedmann_gate: createFriedmannGateWorld,
  omega_multiverse: createOmegaMultiverseWorld,
};

export function createInteriorWorlds(rs) {
  const group = new THREE.Group();
  const worlds = {};

  const interiorLight = new THREE.PointLight(0xaaccff, 1.8, rs * 40);
  interiorLight.position.set(0, rs * 2, 0);
  group.add(interiorLight);
  group.add(new THREE.AmbientLight(0x223355, 0.6));

  for (const id of Object.keys(HORIZON_THEORIES)) {
    const world = BUILDERS[id](rs);
    world.visible = false;
    group.add(world);
    worlds[id] = world;
  }

  function setTheory(id) {
    for (const [key, world] of Object.entries(worlds)) {
      world.visible = key === id;
    }
  }

  function setOpacity(alpha) {
    group.visible = alpha > 0.01;
    for (const world of Object.values(worlds)) {
      if (!world.visible) continue;
      world.traverse((obj) => {
        if (obj.material) {
          if (obj.userData.baseOpacity === undefined) {
            obj.userData.baseOpacity = obj.material.opacity ?? 1;
          }
          if (obj.material.opacity !== undefined) {
            obj.material.opacity = obj.userData.baseOpacity * alpha;
            obj.material.transparent = true;
          }
        }
      });
    }
  }

  function updateRs(newRs, activeTheory) {
    group.clear();
    for (const id of Object.keys(HORIZON_THEORIES)) {
      const world = BUILDERS[id](newRs);
      world.visible = false;
      group.add(world);
      worlds[id] = world;
    }
    if (activeTheory) setTheory(activeTheory);
  }

  function animate(time) {
    for (const world of Object.values(worlds)) {
      if (world.visible && world.userData.animate) {
        world.userData.animate(time);
      }
    }
  }

  return { group, worlds, setTheory, setOpacity, animate, updateRs };
}

export function createHorizonMembrane(rs) {
  const geo = new THREE.SphereGeometry(rs, 64, 64);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      ripple: { value: 0 },
      rs: { value: rs },
    },
    transparent: true,
    side: THREE.FrontSide,
    depthWrite: false,
    vertexShader: `
      uniform float time;
      uniform float ripple;
      uniform float rs;
      varying vec3 vNormal;
      varying float vDist;
      void main() {
        vNormal = normal;
        float wave = sin(position.y * 30.0 + time * 4.0) * ripple * rs * 0.15;
        vec3 pos = position + normal * wave;
        vDist = length(position) / rs;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying float vDist;
      void main() {
        float fresnel = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 2.0);
        vec3 col = mix(vec3(0.8, 0.2, 0.0), vec3(1.0, 0.6, 0.1), fresnel);
        float alpha = fresnel * 0.6 + 0.1;
        gl_FragColor = vec4(col, alpha);
      }
    `,
  });
  const mesh = new THREE.Mesh(geo, mat);
  return { mesh, mat };
}

export function createProbe() {
  const geo = new THREE.SphereGeometry(0.8, 16, 16);
  const mat = new THREE.MeshBasicMaterial({ color: 0x00ffcc });
  const mesh = new THREE.Mesh(geo, mat);

  const trailGeo = new THREE.BufferGeometry();
  const trailMat = new THREE.LineBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.5 });
  const trail = new THREE.Line(trailGeo, trailMat);
  const trailPoints = [];

  function update(pos, visible) {
    mesh.visible = visible;
    mesh.position.set(pos.x, pos.y, pos.z);
    if (visible) {
      trailPoints.push(pos.x, pos.y, pos.z);
      if (trailPoints.length > 300) trailPoints.splice(0, 3);
      trail.geometry.setAttribute('position', new THREE.Float32BufferAttribute(trailPoints, 3));
      trail.visible = trailPoints.length > 3;
    } else {
      trail.visible = false;
    }
  }

  function reset() {
    trailPoints.length = 0;
    trail.visible = false;
  }

  return { mesh, trail, update, reset };
}
