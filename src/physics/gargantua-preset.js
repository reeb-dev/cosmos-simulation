/** Parámetros visuales calibrados al look de Gargantua (Interstellar). */
export const GARGANTUA_VISUAL = {
  massSolar: 55,
  spin: 0.6,
  realismMode: 'gargantua',
  theoryId: 'singularity',
  camera: { x: 0.2, y: 0.65, z: 155, tx: 0, ty: 0, tz: 0 },
  diskInnerMul: 2.0,
  diskOuterMul: 4.6,
  diskTubeRatio: 0.48,
  showLensing: true,
  showGeodesics: false,
  showExpansion: false,
  lifeEnabled: false,
};

/** Escala angular aproximada: r_s / distancia cámara (debe ser < 0.14 para encuadre cinematográfico). */
export function gargantuaAngularRs(rsVis, cameraZ) {
  return rsVis / Math.max(cameraZ, 1);
}

/**
 * Aplica parámetros Gargantua sin cambiar de modo (lo invoca setMode('gargantua')).
 */
export function applyGargantuaSettings(ctx) {
  const {
    universe,
    camera,
    controls,
    cameraLife,
    horizonSim,
    lifeEngine,
    onRsChange,
    onTheoryChange,
  } = ctx;

  const g = GARGANTUA_VISUAL;

  universe.setBlackHoleMass(g.massSolar);
  universe.spin = g.spin;
  universe.realismMode = g.realismMode;
  universe.showLensing = g.showLensing;
  universe.showGeodesics = g.showGeodesics;
  universe.showExpansion = g.showExpansion;

  if (lifeEngine) lifeEngine.enabled = g.lifeEnabled;

  camera.position.set(g.camera.x, g.camera.y, g.camera.z);
  controls.target.set(g.camera.tx, g.camera.ty, g.camera.tz);
  controls.update();
  cameraLife?.resetIdle?.();
  cameraLife?.setEnabled?.(false);

  horizonSim?.setTheory(g.theoryId);
  onTheoryChange?.(g.theoryId);
  onRsChange?.();

  ctx.binarySim?.configure?.({ realismMode: g.realismMode });
  ctx.starfield?.setRealism?.(g.realismMode);
  ctx.galaxyField?.setRealism?.(g.realismMode);
  ctx.deepField?.setRealism?.(g.realismMode);
  ctx.gwWaves?.setRealism?.(g.realismMode);

  ctx.guiSync?.();
}

/** Atajo: cambia al modo dedicado Gargantua. */
export function applyGargantuaPreset(ctx) {
  ctx.modeManager?.setMode('gargantua');
}
