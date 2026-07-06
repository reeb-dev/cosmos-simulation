import { DEFAULT_BLACK_HOLE, DEFAULT_COSMOLOGY } from '../physics/constants.js';
import { DEFAULT_THEORY } from './horizon-theories.js';

/** Estado por defecto de toda la simulación */
export const DEFAULT_STATE = {
  blackHoleMassSolar: DEFAULT_BLACK_HOLE.massSolar,
  spin: 0,
  cosmology: { ...DEFAULT_COSMOLOGY },
  timeScale: 1e4,
  paused: false,
  showExpansion: true,
  showGeodesics: true,
  showLensing: true,
  lifeEnabled: true,
  realismMode: 'realistic',
  theoryId: DEFAULT_THEORY,
  cosmoPreset: 'planck2018',
};

export class ResetManager {
  constructor(ctx) {
    this.ctx = ctx;
  }

  /** Reinicio parcial: solo cosmología y partículas */
  resetSimulation() {
    const { universe, horizonSim, probe, engine } = this.ctx;
    universe.cosmology.reset();
    universe._initParticles();
    engine.clock = 0;
    this.ctx.dataLogger?.reset?.();
    horizonSim.reset();
    probe?.reset();
    this.ctx.onVisualUpdate?.();
    this.ctx.guiSync?.();
    return 'simulación';
  }

  /** Reinicio de sonda e inmersión por cámara */
  resetProbe() {
    const { horizonSim, probe, cameraLife, camera, controls } = this.ctx;
    horizonSim.reset();
    horizonSim.updateCamera(camera.position, { x: 0, y: 0, z: 0 });
    probe?.reset();
    cameraLife?.resetIdle?.();
    cameraLife?.resetCamera?.(camera, controls);
    return 'sonda';
  }

  /** Reinicio total al estado inicial */
  fullReset({ clearCustomFormulas = false } = {}) {
    const {
      universe,
      horizonSim,
      lifeEngine,
      theoryLab,
      probe,
      starfield,
      engine,
      cameraLife,
      camera,
      controls,
    } = this.ctx;

    const d = DEFAULT_STATE;

    universe.blackHoleMassSolar = d.blackHoleMassSolar;
    universe.spin = d.spin;
    universe.timeScale = d.timeScale;
    universe.paused = d.paused;
    universe.showExpansion = d.showExpansion;
    universe.showGeodesics = d.showGeodesics;
    universe.showLensing = d.showLensing;
    universe.realismMode = d.realismMode ?? 'realistic';
    universe.setCosmology({ ...d.cosmology });
    universe.cosmology.reset();
    universe._initParticles();

    horizonSim.setTheory(d.theoryId);
    horizonSim.reset();
    horizonSim.updateCamera(camera.position, { x: 0, y: 0, z: 0 });

    lifeEngine?.reset?.(d.lifeEnabled);
    lifeEngine?.log?.('breathe', 'Universo reiniciado');
    theoryLab?.applyCosmologyPreset?.(d.cosmoPreset);
    theoryLab.activePreset = d.cosmoPreset;

    if (clearCustomFormulas) {
      this.ctx.clearCustomFormulas?.();
    }

    engine.clock = 0;
    this.ctx.dataLogger?.reset?.();
    probe?.reset();
    starfield?.reset?.();
    this.ctx.galaxyField?.reset?.();
    this.ctx.cmbBackground?.update?.(0);
    cameraLife?.resetIdle?.();
    cameraLife?.resetCamera?.(camera, controls);
    this.ctx.modeManager?.setMode?.('black_hole');

    this.ctx.onVisualUpdate?.();
    this.ctx.onTheoryChange?.(d.theoryId);
    this.ctx.guiSyncDefaults?.();

    return 'total';
  }
}
