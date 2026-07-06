import * as THREE from 'three';
import { createBlackHole } from './blackHole.js';
import { BINARY_PHASE } from '../simulation/binary-black-holes.js';

function createMergerFlash() {
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), mat);
  return {
    mesh,
    update(intensity, rs) {
      mesh.scale.setScalar(rs * (3 + intensity * 18));
      mat.opacity = intensity * 0.85;
      mat.color.setHSL(0.08 + intensity * 0.05, 0.9, 0.55 + intensity * 0.35);
    },
  };
}

function createHawkingBurst(count = 120) {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const life = new Float32Array(count);
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: 0xffee88,
    size: 2.5,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, mat);

  function burst(rs, strength) {
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = (8 + Math.random() * 40) * strength;
      velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      velocities[i * 3 + 2] = Math.cos(phi) * speed;
      positions[i * 3] = (Math.random() - 0.5) * rs;
      positions[i * 3 + 1] = (Math.random() - 0.5) * rs;
      positions[i * 3 + 2] = (Math.random() - 0.5) * rs;
      life[i] = 0.4 + Math.random() * 0.8;
    }
    mat.opacity = 0.5 + strength * 0.5;
    geo.attributes.position.needsUpdate = true;
  }

  function update(dt, rs, burstStrength) {
    const pos = geo.attributes.position.array;
    let alive = 0;
    for (let i = 0; i < count; i++) {
      if (life[i] <= 0) continue;
      life[i] -= dt;
      alive++;
      pos[i * 3] += velocities[i * 3] * dt;
      pos[i * 3 + 1] += velocities[i * 3 + 1] * dt;
      pos[i * 3 + 2] += velocities[i * 3 + 2] * dt;
    }
    mat.opacity = alive > 0 ? Math.min(1, burstStrength * 0.9) : 0;
    if (alive > 0) geo.attributes.position.needsUpdate = true;
  }

  return { points, burst, update };
}

/**
 * Escena visual del choque binario: dos BHs, fusión, ringdown y muerte Hawking.
 * Las ondas GW expansivas viven en gravitational-waves.js.
 */
export function createBinaryBlackHolesScene(initialRs = 3) {
  const group = new THREE.Group();
  group.visible = false;

  const bh1 = createBlackHole(initialRs * 0.8, 0.5);
  const bh2 = createBlackHole(initialRs * 0.6, 0.4);
  const merged = createBlackHole(initialRs * 1.2, 0.5);

  bh1.group.visible = true;
  bh2.group.visible = true;
  merged.group.visible = false;

  const flash = createMergerFlash();
  const hawking = createHawkingBurst();

  const bridgeGeo = new THREE.RingGeometry(0.92, 1, 64);
  const bridgeMat = new THREE.MeshBasicMaterial({
    color: 0xffaa55,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
  bridge.rotation.x = Math.PI / 2;

  const trailMax = 64;
  const trailGeo = new THREE.BufferGeometry();
  const trailPos = new Float32Array(trailMax * 3 * 2);
  trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
  const trailMat = new THREE.LineBasicMaterial({
    color: 0x66aaff,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const trail1 = new THREE.Line(trailGeo, trailMat);
  const trail2 = new THREE.Line(trailGeo.clone(), trailMat.clone());
  const trailIdx = { bh1: 0, bh2: 0 };
  const trailHistory = { bh1: [], bh2: [] };

  group.add(bh1.group, bh2.group, merged.group, bridge, trail1, trail2, flash.mesh, hawking.points);

  let lastEvapBurst = 0;

  function applyState(state, animTime) {
    if (state.showBinary) {
      bh1.group.visible = true;
      bh2.group.visible = true;
      merged.group.visible = false;
      bh1.group.position.set(state.bh1Pos.x, state.bh1Pos.y, state.bh1Pos.z);
      bh2.group.position.set(state.bh2Pos.x, state.bh2Pos.y, state.bh2Pos.z);
      bh1.update(state.rs1, state.spin1);
      bh2.update(state.rs2, state.spin2);
      bh1.diskMat.uniforms.time.value = animTime;
      bh2.diskMat.uniforms.time.value = animTime + 1.3;
      if (bh1.diskMat.uniforms.spin) bh1.diskMat.uniforms.spin.value = state.spin1;
      if (bh2.diskMat.uniforms.spin) bh2.diskMat.uniforms.spin.value = state.spin2;

      const dx = state.bh2Pos.x - state.bh1Pos.x;
      const dz = state.bh2Pos.z - state.bh1Pos.z;
      const dist = Math.hypot(dx, dz) || 1;
      bridge.position.set(
        (state.bh1Pos.x + state.bh2Pos.x) / 2,
        0,
        (state.bh1Pos.z + state.bh2Pos.z) / 2,
      );
      bridge.scale.set(dist * 0.5, dist * 0.5, 1);
      bridge.rotation.y = Math.atan2(dz, dx);
      const bridgeOp = state.phase === BINARY_PHASE.INSPIRAL
        ? Math.min(0.55, 40 / dist)
        : state.phase === BINARY_PHASE.MERGER
          ? 0.7 * (1 - state.coalescence)
          : 0;
      bridgeMat.opacity = bridgeOp;

      for (const key of ['bh1', 'bh2']) {
        const hist = trailHistory[key];
        const pos = key === 'bh1' ? state.bh1Pos : state.bh2Pos;
        hist.push({ x: pos.x, z: pos.z });
        if (hist.length > trailMax) hist.shift();
        const arr = (key === 'bh1' ? trail1 : trail2).geometry.attributes.position.array;
        for (let i = 0; i < hist.length; i++) {
          arr[i * 3] = hist[i].x;
          arr[i * 3 + 1] = 0;
          arr[i * 3 + 2] = hist[i].z;
        }
        (key === 'bh1' ? trail1 : trail2).geometry.setDrawRange(0, hist.length);
        (key === 'bh1' ? trail1 : trail2).geometry.attributes.position.needsUpdate = true;
        (key === 'bh1' ? trail1 : trail2).visible = hist.length > 2 && state.phase !== BINARY_PHASE.DEAD;
      }
    } else {
      bh1.group.visible = false;
      bh2.group.visible = false;
    }

    if (state.showMerged) {
      merged.group.visible = true;
      merged.group.position.set(0, 0, 0);
      merged.update(state.rsMerged, state.mergedSpin);
      merged.diskMat.uniforms.time.value = animTime;
      if (merged.diskMat.uniforms.spin) merged.diskMat.uniforms.spin.value = state.mergedSpin;
    } else {
      merged.group.visible = false;
    }

    if (state.phase === BINARY_PHASE.DEAD) {
      merged.group.visible = false;
    }
  }

  function update(dt, sim, animTime) {
    const state = typeof sim.getState === 'function' ? sim.getState() : sim;
    if (state.phase === BINARY_PHASE.IDLE) {
      group.visible = false;
      return;
    }

    group.visible = true;
    applyState(state, animTime);
    flash.update(state.mergerFlash, state.rsMerged || state.rs1 + state.rs2);

    if (state.phase === BINARY_PHASE.EVAPORATION) {
      if (state.evapProgress - lastEvapBurst > 0.08) {
        lastEvapBurst = state.evapProgress;
        hawking.burst(state.rsMerged, state.evapBurst);
      }
      hawking.update(dt, state.rsMerged, state.evapBurst);
    } else {
      hawking.points.material.opacity = 0;
      lastEvapBurst = 0;
    }
  }

  function reset() {
    group.visible = false;
    bh1.group.visible = true;
    bh2.group.visible = true;
    merged.group.visible = false;
    flash.mesh.material.opacity = 0;
    hawking.points.material.opacity = 0;
    bridgeMat.opacity = 0;
    trail1.visible = false;
    trail2.visible = false;
    trailHistory.bh1 = [];
    trailHistory.bh2 = [];
    lastEvapBurst = 0;
  }

  return { group, update, reset, applyState };
}

/** Alias para compatibilidad */
export const createBinaryBlackHoleScene = createBinaryBlackHolesScene;
