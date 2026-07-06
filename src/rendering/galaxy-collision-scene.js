import * as THREE from 'three';
import { createGalaxySpriteGroup } from './galaxy-sprites.js';
import { GALAXY_PHASE } from '../simulation/galaxy-collision.js';

function createTidalTail(count = 120, color = 0xffaa66) {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color,
    size: 2.2,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, mat);

  function update(strength, origin, direction, spread = 1) {
    mat.opacity = strength * 0.7;
    const pos = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const along = t * 90 * strength;
      const side = (Math.sin(i * 2.7) * 0.5 + (Math.random() - 0.5) * 0.3) * spread * 25 * strength;
      pos[i * 3] = origin.x + direction.x * along + side;
      pos[i * 3 + 1] = origin.y + (Math.random() - 0.5) * 4 * strength;
      pos[i * 3 + 2] = origin.z + direction.z * along * 0.6;
    }
    geo.attributes.position.needsUpdate = true;
  }

  return { points, update };
}

function createStarburst(count = 80) {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xffeedd,
    size: 3,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const points = new THREE.Points(geo, mat);

  function update(strength, center) {
    mat.opacity = strength * 0.85;
    const pos = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2;
      const r = (8 + (i % 7) * 4) * strength;
      pos[i * 3] = center.x + Math.cos(ang) * r;
      pos[i * 3 + 1] = center.y + (Math.random() - 0.5) * 6 * strength;
      pos[i * 3 + 2] = center.z + Math.sin(ang) * r * 0.5;
    }
    geo.attributes.position.needsUpdate = true;
  }

  return { points, update };
}

/**
 * Escena visual del choque de galaxias: dos espirales, colas tidales, brote estelar y remanente.
 */
export function createGalaxyCollisionScene() {
  const group = new THREE.Group();
  group.visible = false;

  const g1 = createGalaxySpriteGroup({ type: 'spiral', seed: 11, scale: 1.1, colorTemp: 5200 });
  const g2 = createGalaxySpriteGroup({ type: 'spiral', seed: 23, scale: 0.95, colorTemp: 4800 });
  const remnant = createGalaxySpriteGroup({ type: 'elliptical', seed: 47, scale: 1.4, colorTemp: 4200 });
  remnant.group.visible = false;

  const tail1 = createTidalTail(140, 0xffcc88);
  const tail2 = createTidalTail(140, 0xaaccff);
  const burst = createStarburst(90);

  group.add(g1.group, g2.group, remnant.group, tail1.points, tail2.points, burst.points);

  function applyState(state) {
    if (state.showPair) {
      g1.group.visible = state.mergerProgress < 0.85;
      g2.group.visible = state.mergerProgress < 0.85;
      g1.group.position.set(state.g1Pos.x, state.g1Pos.y, state.g1Pos.z);
      g2.group.position.set(state.g2Pos.x, state.g2Pos.y, state.g2Pos.z);
      g1.group.rotation.y = state.g1Rot;
      g2.group.rotation.y = state.g2Rot;
      g1.setTidalDeform(state.tidalStrength, state.g1Rot);
      g2.setTidalDeform(state.tidalStrength * 0.9, state.g2Rot);
      g1.setOpacity(1 - state.mergerProgress * 0.7);
      g2.setOpacity(1 - state.mergerProgress * 0.7);
    } else {
      g1.group.visible = false;
      g2.group.visible = false;
    }

    if (state.showRemnant) {
      remnant.group.visible = true;
      remnant.group.position.set(state.remnantPos.x, state.remnantPos.y, state.remnantPos.z);
      remnant.group.scale.setScalar(state.remnantScale);
      remnant.setOpacity(0.5 + state.mergerProgress * 0.5);
    } else {
      remnant.group.visible = false;
    }

    if (state.tailStrength > 0.05 && state.showPair) {
      tail1.update(state.tailStrength, state.g1Pos, { x: -0.7, y: 0, z: 0.3 }, 1 + state.tidalStrength);
      tail2.update(state.tailStrength, state.g2Pos, { x: 0.7, y: 0, z: -0.3 }, 1 + state.tidalStrength);
      tail1.points.visible = true;
      tail2.points.visible = true;
    } else {
      tail1.points.visible = false;
      tail2.points.visible = false;
    }

    if (state.starburst > 0.1) {
      const cx = state.showRemnant
        ? state.remnantPos
        : { x: (state.g1Pos.x + state.g2Pos.x) / 2, y: 0, z: (state.g1Pos.z + state.g2Pos.z) / 2 };
      burst.update(state.starburst, cx);
      burst.points.visible = true;
    } else {
      burst.points.visible = false;
    }
  }

  function update(dt, sim) {
    const state = typeof sim.getState === 'function' ? sim.getState() : sim;
    if (state.phase === GALAXY_PHASE.IDLE) {
      group.visible = false;
      return;
    }
    group.visible = true;
    applyState(state);
  }

  function reset() {
    g1.group.visible = true;
    g2.group.visible = true;
    remnant.group.visible = false;
    tail1.points.visible = false;
    tail2.points.visible = false;
    burst.points.visible = false;
  }

  return { group, update, reset, applyState, g1, g2, remnant };
}
