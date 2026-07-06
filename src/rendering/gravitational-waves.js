import * as THREE from 'three';
import { getRealismProfile } from '../physics/realism-profiles.js';

const MAX_RINGS = 48;
const MAX_RADIUS = 280;

/**
 * Ondas gravitacionales expansivas: anillos concéntricos desde el baricentro,
 * distorsión del campo estelar/rejilla y pulso de memoria en la fusión.
 */
export function createGravitationalWaves() {
  const group = new THREE.Group();
  const rings = [];
  const ringGeo = new THREE.RingGeometry(0.98, 1, 96, 1);

  for (let i = 0; i < MAX_RINGS; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: 0xaaddff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(ringGeo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.visible = false;
    mesh.userData = {
      active: false,
      radius: 0,
      speed: 55,
      amplitude: 0,
      isGold: false,
      age: 0,
    };
    group.add(mesh);
    rings.push(mesh);
  }

  const memoryMat = new THREE.MeshBasicMaterial({
    color: 0xffcc44,
    transparent: true,
    opacity: 0,
    side: THREE.BackSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const memoryPulse = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 48), memoryMat);
  memoryPulse.userData.active = false;
  memoryPulse.userData.radius = 0;
  group.add(memoryPulse);

  let emitTimer = 0;
  let ringdownBursts = 0;
  let lastPhase = '';
  let realismMode = 'realistic';

  function setRealism(mode) {
    realismMode = mode || 'realistic';
  }

  function spawnRing(x, y, z, { amplitude = 0.4, speed = 55, gold = false } = {}) {
    const ring = rings.find((r) => !r.userData.active);
    if (!ring) return;

    ring.position.set(x, y, z);
    const ud = ring.userData;
    ud.active = true;
    ud.radius = 2;
    ud.speed = speed;
    ud.amplitude = amplitude;
    ud.isGold = gold;
    ud.age = 0;
    ring.visible = true;
    ring.scale.setScalar(ud.radius);
    ring.material.color.setHex(gold ? 0xffdd66 : 0x88ccff);
    ring.material.opacity = Math.min(0.9, amplitude * 0.95);
  }

  function spawnMemoryPulse(x, y, z) {
    memoryPulse.position.set(x, y, z);
    memoryPulse.userData.active = true;
    memoryPulse.userData.radius = 3;
    memoryMat.opacity = 0.75;
  }

  function resolveState(simOrState) {
    return typeof simOrState?.getState === 'function' ? simOrState.getState() : simOrState;
  }

  function update(dt, simOrState) {
    const state = resolveState(simOrState);
    if (!state || state.phase === 'idle') return;

    const profile = getRealismProfile(realismMode);
    const waveSpeedMul = profile.gwWaveSpeed / 55;
    const ampScale = profile.gwAmplitudeScale;
    const phase = state.gwPhase ?? state.phase;
    const lastStrain = state.lastStrain ?? state.gwStrain ?? 0;
    const lastFrequency = state.lastFrequency ?? state.gwFrequency ?? 20;
    const mergerFlash = state.mergerFlash ?? 0;
    const mem = state.memoryPulse ?? 0;
    const ringdownAmplitude = state.ringdownAmplitude ?? state.ringdownAmp ?? 0;
    const bc = state.barycenter ?? { x: 0, y: 0, z: 0 };
    const bx = bc.x ?? 0;
    const by = bc.y ?? 0;
    const bz = bc.z ?? 0;

    if (phase !== lastPhase) {
      if (phase === 'merger') {
        spawnMemoryPulse(bx, by, bz);
        for (let i = 0; i < 6; i++) {
          spawnRing(bx, by, bz, { amplitude: 0.95 * ampScale, speed: (65 + i * 10) * waveSpeedMul, gold: true });
        }
      }
      if (phase === 'ringdown') ringdownBursts = 3;
      lastPhase = phase;
    }

    emitTimer += dt;
    const emitPeriod = phase === 'inspiral'
      ? Math.max(0.1, 0.9 / Math.max(lastFrequency * 0.02, 0.5))
      : phase === 'ringdown'
        ? 0.5
        : phase === 'death'
          ? 1.0
          : 0.07;

    if (emitTimer >= emitPeriod) {
      emitTimer = 0;
      if (phase === 'inspiral') {
        const amp = (0.3 + lastStrain * 0.55) * ampScale;
        const spd = (50 + lastFrequency * 0.08) * waveSpeedMul;
        spawnRing(bx, by, bz, { amplitude: amp, speed: spd });
        if (lastStrain > 0.12) spawnRing(bx, by, bz, { amplitude: amp * 0.55, speed: spd * 0.88 });
      } else if (phase === 'merger' && mergerFlash > 0.15) {
        spawnRing(bx, by, bz, { amplitude: ampScale, speed: 85 * waveSpeedMul, gold: true });
      } else if (phase === 'ringdown' && ringdownBursts > 0) {
        ringdownBursts--;
        spawnRing(bx, by, bz, { amplitude: ringdownAmplitude * 0.75 * ampScale, speed: 52 * waveSpeedMul });
        spawnRing(bx, by, bz, { amplitude: ringdownAmplitude * 0.45 * ampScale, speed: 44 * waveSpeedMul });
      } else if (phase === 'death') {
        spawnRing(bx, by, bz, { amplitude: 0.1 * ampScale, speed: 38 * waveSpeedMul });
      }
    }

    for (const ring of rings) {
      if (!ring.userData.active) continue;
      const ud = ring.userData;
      ud.age += dt;
      ud.radius += ud.speed * dt;
      ring.scale.setScalar(ud.radius);
      const fade = ud.amplitude * (1 - ud.radius / MAX_RADIUS) * Math.exp(-ud.age * 0.35);
      ring.material.opacity = Math.max(0, fade * 0.9);
      if (ud.radius > MAX_RADIUS || ring.material.opacity < 0.008) {
        ud.active = false;
        ring.visible = false;
        ring.material.opacity = 0;
      }
    }

    if (memoryPulse.userData.active) {
      memoryPulse.userData.radius += 95 * dt * (profile.gwWaveSpeed / 55);
      const r = memoryPulse.userData.radius;
      memoryPulse.scale.setScalar(r);
      memoryMat.opacity = mem * 0.55 * Math.max(0, 1 - r / 220);
      if (memoryMat.opacity < 0.008) {
        memoryPulse.userData.active = false;
        memoryMat.opacity = 0;
      }
    }
  }

  function waveDisplacementAt(x, y, z) {
    let disp = 0;
    for (const ring of rings) {
      if (!ring.userData.active) continue;
      const dx = x - ring.position.x;
      const dy = y - ring.position.y;
      const dz = z - ring.position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const front = ring.userData.radius;
      const width = 5 + ring.userData.amplitude * 8;
      const delta = Math.abs(dist - front);
      if (delta < width) {
        const w = (1 - delta / width) * ring.material.opacity;
        disp = Math.max(disp, w * ring.userData.amplitude * 3);
      }
    }
    if (memoryPulse.userData.active && memoryMat.opacity > 0.01) {
      const dx = x - memoryPulse.position.x;
      const dy = y - memoryPulse.position.y;
      const dz = z - memoryPulse.position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const front = memoryPulse.userData.radius;
      const width = 14;
      const delta = Math.abs(dist - front);
      if (delta < width) {
        disp = Math.max(disp, (1 - delta / width) * memoryMat.opacity * 2);
      }
    }
    return disp;
  }

  function reset() {
    for (const ring of rings) {
      ring.userData.active = false;
      ring.visible = false;
      ring.material.opacity = 0;
    }
    memoryPulse.userData.active = false;
    memoryMat.opacity = 0;
    emitTimer = 0;
    ringdownBursts = 0;
    lastPhase = '';
  }

  return { group, update, waveDisplacementAt, reset, setRealism };
}
