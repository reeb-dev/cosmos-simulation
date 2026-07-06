/** Parámetros visuales calibrados al look de Gargantua (Interstellar). */
export const GARGANTUA_VISUAL = {
  massSolar: 100,
  spin: 0.99,
  realismMode: 'gargantua',
  theoryId: 'singularity',
  camera: { x: 0.5, y: 2.4, z: 98, tx: 0, ty: 0, tz: 0 },
  showLensing: true,
  showGeodesics: false,
  showExpansion: false,
  lifeEnabled: false,
};

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
