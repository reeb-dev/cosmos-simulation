import GUI from 'lil-gui';

export function createControls(universe, engine, callbacks = {}) {
  const gui = new GUI({ title: 'Parámetros Físicos' });

  const bhFolder = gui.addFolder('Agujero Negro');
  const bhParams = { massSolar: universe.blackHoleMassSolar };
  bhFolder
    .add(bhParams, 'massSolar', 1, 100, 1)
    .name('Masa (M☉)')
    .onChange((v) => {
      universe.setBlackHoleMass(v);
      callbacks.onBlackHoleChange?.(v);
    });

  const cosmoFolder = gui.addFolder('Cosmología (ΛCDM)');
  const cosmoParams = {
    H0: universe.cosmology.H0,
    OmegaM: universe.cosmology.OmegaM,
    OmegaLambda: universe.cosmology.OmegaLambda,
  };
  cosmoFolder
    .add(cosmoParams, 'H0', 50, 90, 1)
    .name('H₀ (km/s/Mpc)')
    .onChange((v) => {
      universe.setCosmology({ ...cosmoParams, H0: v });
    });
  cosmoFolder
    .add(cosmoParams, 'OmegaM', 0, 1, 0.01)
    .name('Ωₘ')
    .onChange((v) => {
      universe.setCosmology({ ...cosmoParams, OmegaM: v });
    });
  cosmoFolder
    .add(cosmoParams, 'OmegaLambda', 0, 1, 0.01)
    .name('ΩΛ')
    .onChange((v) => {
      universe.setCosmology({ ...cosmoParams, OmegaLambda: v });
    });

  const simFolder = gui.addFolder('Simulación');
  const simParams = {
    timeScale: universe.timeScale,
    paused: universe.paused,
    showExpansion: universe.showExpansion,
    showGeodesics: universe.showGeodesics,
    showLensing: universe.showLensing,
  };
  simFolder
    .add(simParams, 'timeScale', 1e2, 1e7)
    .name('Velocidad tiempo')
    .onChange((v) => {
      universe.timeScale = v;
    });
  simFolder
    .add(simParams, 'paused')
    .name('Pausar')
    .onChange((v) => {
      universe.paused = v;
    });
  simFolder
    .add(simParams, 'showExpansion')
    .name('Expansión')
    .onChange((v) => {
      universe.showExpansion = v;
    });
  simFolder
    .add(simParams, 'showGeodesics')
    .name('Geodésicas')
    .onChange((v) => {
      universe.showGeodesics = v;
    });
  simFolder
    .add(simParams, 'showLensing')
    .name('Lensing')
    .onChange((v) => {
      universe.showLensing = v;
      callbacks.onLensingToggle?.(v);
    });

  simFolder.add(
    {
      reset: () => {
        universe.cosmology.reset();
        universe._initParticles();
        callbacks.onReset?.();
      },
    },
    'reset'
  ).name('Reiniciar');

  bhFolder.open();
  cosmoFolder.open();
  simFolder.open();

  return gui;
}
