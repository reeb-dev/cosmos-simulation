import * as THREE from 'three';

const VEV_SYMBOLIC = 246; // GeV (valor pedagógico)
const HIGGS_MASS_SYMBOLIC = 125; // GeV

/**
 * Visualización abstracta del bosón de Higgs y su campo escalar.
 */
export function createHiggsScene() {
  const group = new THREE.Group();
  group.visible = false;

  // Bosón central dorado
  const coreGeo = new THREE.IcosahedronGeometry(3, 2);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xffcc44,
    transparent: true,
    opacity: 0.95,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  const glowShell = new THREE.Mesh(
    new THREE.SphereGeometry(5, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0xffaa22,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    })
  );
  group.add(glowShell);

  const outerGlow = new THREE.Mesh(
    new THREE.SphereGeometry(8, 24, 24),
    new THREE.MeshBasicMaterial({
      color: 0xff8800,
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide,
    })
  );
  group.add(outerGlow);

  // Campo escalar φ(x) — malla ondulante
  const fieldRes = 32;
  const fieldGeo = new THREE.PlaneGeometry(40, 40, fieldRes, fieldRes);
  fieldGeo.rotateX(-Math.PI / 2);
  const fieldMat = new THREE.MeshBasicMaterial({
    color: 0xffdd66,
    wireframe: true,
    transparent: true,
    opacity: 0.35,
  });
  const fieldMesh = new THREE.Mesh(fieldGeo, fieldMat);
  fieldMesh.position.y = -2;
  group.add(fieldMesh);

  const fieldMesh2 = fieldMesh.clone();
  fieldMesh2.position.y = 2;
  fieldMesh2.material = fieldMat.clone();
  fieldMesh2.material.opacity = 0.2;
  group.add(fieldMesh2);

  // Anillo LHC estilizado
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(18, 0.3, 8, 64),
    new THREE.MeshBasicMaterial({ color: 0x4488ff, transparent: true, opacity: 0.4 })
  );
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  // Fermiones que ganan masa al acoplarse
  const fermions = [];
  const fermionColors = [0x66ff88, 0xff6688, 0x6688ff, 0xffcc44];
  for (let i = 0; i < 24; i++) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 8, 8),
      new THREE.MeshBasicMaterial({ color: fermionColors[i % 4], transparent: true, opacity: 0.9 })
    );
    const angle = (i / 24) * Math.PI * 2;
    const r = 14 + (i % 3) * 2;
    mesh.position.set(Math.cos(angle) * r, (Math.random() - 0.5) * 6, Math.sin(angle) * r);
    mesh.userData = {
      angle,
      r,
      mass: 0,
      targetMass: 0.3 + Math.random() * 0.7,
      coupled: false,
      y: mesh.position.y,
    };
    fermions.push(mesh);
    group.add(mesh);
  }

  // Partículas del haz
  const beamPts = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({ color: 0x88ccff, size: 0.3, transparent: true, opacity: 0.7 })
  );
  const beamArr = [];
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    beamArr.push(Math.cos(a) * 18, 0, Math.sin(a) * 18);
  }
  beamPts.geometry.setAttribute('position', new THREE.Float32BufferAttribute(beamArr, 3));
  group.add(beamPts);

  group.add(new THREE.AmbientLight(0x332211, 0.6));
  const spot = new THREE.PointLight(0xffcc44, 3, 50);
  spot.position.set(0, 10, 0);
  group.add(spot);

  let readouts = {
    vev: VEV_SYMBOLIC,
    higgsMass: HIGGS_MASS_SYMBOLIC,
    coupledCount: 0,
    massGeneration: 0,
  };

  function animate(t, dt = 0.016) {
    core.rotation.x = t * 0.4;
    core.rotation.y = t * 0.6;
    core.scale.setScalar(1 + Math.sin(t * 3) * 0.08);
    glowShell.scale.setScalar(1 + Math.sin(t * 2) * 0.12);
    outerGlow.scale.setScalar(1 + Math.sin(t * 1.2) * 0.1);

    const pos = fieldGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = Math.sin(x * 0.3 + t * 1.5) * Math.cos(z * 0.3 + t) * 1.5;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
    fieldGeo.computeVertexNormals();

    ring.rotation.z += dt * 0.15;
    beamPts.rotation.y += dt * 0.5;

    let coupled = 0;
    let totalMass = 0;
    for (const f of fermions) {
      const u = f.userData;
      const dist = f.position.distanceTo(core.position);
      if (dist < 7 && !u.coupled) u.coupled = true;
      if (u.coupled) {
        u.mass = Math.min(u.targetMass, u.mass + dt * 0.3);
        coupled++;
        totalMass += u.mass;
        f.scale.setScalar(0.5 + u.mass * 1.2);
        f.position.lerp(
          new THREE.Vector3(
            Math.cos(u.angle + t * 0.2) * (u.r - u.mass * 3),
            u.y + Math.sin(t * 2 + u.angle) * 0.3,
            Math.sin(u.angle + t * 0.2) * (u.r - u.mass * 3)
          ),
          dt * 2
        );
      } else {
        f.position.x = Math.cos(u.angle + t * 0.5) * u.r;
        f.position.z = Math.sin(u.angle + t * 0.5) * u.r;
      }
    }

    readouts = {
      vev: VEV_SYMBOLIC * (1 + Math.sin(t * 0.5) * 0.02),
      higgsMass: HIGGS_MASS_SYMBOLIC,
      coupledCount: coupled,
      massGeneration: totalMass / fermions.length,
    };
  }

  function getReadouts() {
    return {
      rows: [
        { label: '⟨φ⟩ (VEV)', value: readouts.vev.toFixed(1), unit: 'GeV' },
        { label: 'm_H', value: readouts.higgsMass.toFixed(0), unit: 'GeV' },
        { label: 'Fermiones acoplados', value: `${readouts.coupledCount}/24`, unit: '' },
        { label: 'Generación de masa', value: (readouts.massGeneration * 100).toFixed(0), unit: '%' },
        { label: 'λ (autointeracción)', value: '0.13', unit: '(simb.)' },
      ],
    };
  }

  return { group, animate, getReadouts };
}
