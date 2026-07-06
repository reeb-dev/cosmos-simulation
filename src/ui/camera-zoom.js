import * as THREE from 'three';

/** Presets de cámara escalados por rₛ visual */
export const ZOOM_PRESETS = {
  wide: (rs) => ({ x: 0, y: 40, z: 120, tx: 0, ty: 0, tz: 0 }),
  horizon: (rs) => ({ x: 0, y: rs * 1.33, z: rs * 15.33 + 0.1, tx: 0, ty: 0, tz: 0 }),
  disk: (rs) => ({ x: 0, y: rs * 2, z: rs * 22 + 2, tx: 0, ty: 0, tz: 0 }),
  immersion: (rs) => ({ x: 0, y: rs * 0.5, z: rs * 5.5 + 1, tx: 0, ty: 0, tz: 0 }),
};

export function applyZoomPreset(camera, controls, presetId, rsVis = 10) {
  const fn = ZOOM_PRESETS[presetId];
  if (!fn) return false;
  const p = fn(Math.max(rsVis, 0.1));
  camera.position.set(p.x, p.y, p.z);
  controls.target.set(p.tx, p.ty, p.tz);
  controls.update();
  return true;
}

/** Multiplica la distancia cámara–target (factor < 1 acerca). */
export function adjustZoom(camera, controls, factor) {
  const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
  const dist = offset.length();
  if (dist < 1e-6) return;
  const newDist = Math.max(controls.minDistance, Math.min(controls.maxDistance, dist * factor));
  offset.normalize().multiplyScalar(newDist);
  camera.position.copy(controls.target).add(offset);
  controls.update();
}
