import GUI from 'lil-gui';
import { DEFAULT_STATE } from '../simulation/reset-manager.js';
import { HORIZON_THEORIES, THEORY_IDS } from '../simulation/horizon-theories.js';
import { SIMULATION_MODES, MODE_IDS, FEATURED_THEORIES, PHYSICS_BREAK_THEORIES } from '../simulation/simulation-modes.js';
import { EXPERIMENTS } from '../lab/theory-lab.js';
import { FORMULA_PRESETS, createCustomFormula, saveCustomFormulas, clearCustomFormulasStorage } from '../lab/custom-formula.js';
import { showResetToast } from './lab-panel.js';

function theoryPrefix(theory) {
  if (theory.physicsBreak) return '★★ ';
  if (theory.fiction) return '★★ ';
  if (theory.original || theory.speculative) return '★ ';
  return '';
}

const theoryOptions = {};
for (const id of THEORY_IDS) {
  const t = HORIZON_THEORIES[id];
  theoryOptions[`${theoryPrefix(t)}${t.name}`] = id;
}

function theoryNameById(id) {
  const t = HORIZON_THEORIES[id];
  return `${theoryPrefix(t)}${t.name}`;
}

const modeOptions = {};
for (const id of MODE_IDS) {
  modeOptions[SIMULATION_MODES[id].name] = id;
}

/** Carpetas visibles y granularidad de controles por modo de escena */
export const MODE_CONTROL_MAP = {
  black_hole: {
    folders: ['bh', 'cosmo', 'horizon', 'sim', 'lab', 'reset'],
    featured: true,
    bh: 'full',
    cosmo: 'full',
    horizon: 'full',
    sim: 'full',
  },
  multiverse: {
    folders: ['cosmo', 'sim', 'reset'],
    featured: false,
    cosmo: 'omega',
    sim: 'basic',
  },
  higgs: {
    folders: ['sim', 'lab', 'reset'],
    featured: false,
    sim: 'basic',
  },
  cosmology: {
    folders: ['cosmo', 'sim', 'lab', 'reset'],
    featured: false,
    cosmo: 'full',
    sim: 'full',
  },
  theory_picker: {
    folders: ['bh', 'horizon', 'sim', 'reset'],
    featured: true,
    bh: 'mass',
    horizon: 'full',
    sim: 'full',
  },
  binary_merger: {
    folders: ['binary', 'sim', 'reset'],
    featured: false,
    sim: 'basic',
  },
  string_theory: {
    folders: ['horizon', 'sim', 'lab', 'reset'],
    featured: false,
    horizon: 'theory',
    sim: 'basic',
  },
};

const FOLDER_DEFAULT_TITLES = {
  bh: 'Agujero negro',
  cosmo: 'Cosmología',
  horizon: 'Horizonte',
  sim: 'Simulación',
  lab: 'Laboratorio',
  binary: 'Choque binario',
  reset: 'Reset',
};

const FOLDER_MODE_TITLES = {
  multiverse: { cosmo: 'Parámetros del multiverso' },
  string_theory: { horizon: 'Teoría de cuerdas' },
};

/**
 * GUI unificada con sincronización bidireccional.
 */
export function createMasterGui(ctx) {
  const gui = new GUI({ title: 'Controles', width: 280 });
  gui.domElement.style.marginTop = '8px';

  const state = {
    massSolar: ctx.universe.blackHoleMassSolar,
    spin: ctx.universe.spin,
    H0: ctx.universe.cosmology.H0,
    OmegaM: ctx.universe.cosmology.OmegaM,
    OmegaLambda: ctx.universe.cosmology.OmegaLambda,
    cosmoPreset: ctx.theoryLab.activePreset,
    timeScaleLog: Math.log10(ctx.universe.timeScale),
    paused: ctx.universe.paused,
    showExpansion: ctx.universe.showExpansion,
    showGeodesics: ctx.universe.showGeodesics,
    showLensing: ctx.universe.showLensing,
    lifeEnabled: ctx.lifeEngine.enabled,
    realismMode: ctx.universe.realismMode ?? 'standard',
    theory: theoryNameById(ctx.horizonSim.theoryId),
    autoCamera: true,
    simMode: SIMULATION_MODES[ctx.modeManager?.currentMode ?? 'black_hole'].name,
  };

  const controllers = {};
  const folders = {};

  const modeFolder = gui.addFolder('Modo de simulación');
  folders.mode = modeFolder;
  controllers.simMode = modeFolder.add(state, 'simMode', Object.keys(modeOptions)).name('Escena').onChange((name) => {
    const id = modeOptions[name];
    ctx.modeManager?.setMode(id);
  });

  const modeHint = { hint: '' };
  controllers.modeHint = modeFolder.add(modeHint, 'hint').name(' ').disable();
  controllers.modeHint.domElement.classList.add('mode-control-hint');

  modeFolder.open();

  const featured = {};
  for (const t of FEATURED_THEORIES) featured[t.label] = t.id;
  const pickTheory = (id) => {
    ctx.horizonSim.setTheory(id);
    ctx.onTheoryChange(id);
    ctx.modeManager?.zoomToHorizon?.();
    syncFromUniverse();
  };
  const featuredFolder = modeFolder.addFolder('Teorías destacadas');
  folders.featured = featuredFolder;
  for (const t of FEATURED_THEORIES) {
    featuredFolder.add({ pick: () => pickTheory(t.id) }, 'pick').name(t.label);
  }

  const bh = gui.addFolder('Agujero negro');
  folders.bh = bh;
  controllers.mass = bh.add(state, 'massSolar', 1, 100, 1).name('Masa (M☉)').onChange((v) => {
    ctx.universe.setBlackHoleMass(v);
    ctx.onRsChange();
  });
  controllers.spin = bh.add(state, 'spin', 0, 0.998, 0.01).name('Spin Kerr').onChange((v) => {
    ctx.universe.spin = v;
    ctx.onRsChange();
  });
  bh.open();

  const binaryState = {
    m1: ctx.binarySim?.m1Solar ?? 30,
    m2: ctx.binarySim?.m2Solar ?? 20,
    separation: ctx.binarySim?.separationVis ?? 80,
    spin1: ctx.binarySim?.spin1 ?? 0.6,
    spin2: ctx.binarySim?.spin2 ?? 0.4,
    hawkingDeath: ctx.binarySim?.hawkingDeath ?? true,
  };
  const binaryFolder = gui.addFolder('Choque binario');
  folders.binary = binaryFolder;
  binaryFolder.add(binaryState, 'm1', 5, 80, 1).name('M₁ (M☉)').onChange((v) => {
    ctx.binarySim?.configure({ m1Solar: v });
  });
  binaryFolder.add(binaryState, 'm2', 5, 80, 1).name('M₂ (M☉)').onChange((v) => {
    ctx.binarySim?.configure({ m2Solar: v });
  });
  binaryFolder.add(binaryState, 'separation', 30, 150, 1).name('Separación').onChange((v) => {
    ctx.binarySim?.configure({ separationVis: v });
  });
  binaryFolder.add(binaryState, 'spin1', 0, 0.998, 0.01).name('Spin M₁').onChange((v) => {
    ctx.binarySim?.configure({ spin1: v });
  });
  binaryFolder.add(binaryState, 'spin2', 0, 0.998, 0.01).name('Spin M₂').onChange((v) => {
    ctx.binarySim?.configure({ spin2: v });
  });
  binaryFolder.add(binaryState, 'hawkingDeath').name('Muerte por Hawking').onChange((v) => {
    ctx.binarySim?.configure({ hawkingDeath: v });
  });
  binaryFolder.add({
    start: () => {
      ctx.modeManager?.setMode('binary_merger');
      ctx.binarySim?.configure({
        m1Solar: binaryState.m1,
        m2Solar: binaryState.m2,
        separationVis: binaryState.separation,
        spin1: binaryState.spin1,
        spin2: binaryState.spin2,
        hawkingDeath: binaryState.hawkingDeath,
        timeScale: ctx.universe.timeScale,
      });
      ctx.binarySim?.startCollision();
    },
  }, 'start').name('▶ Iniciar colisión');
  binaryFolder.add({
    resetBinary: () => {
      ctx.binarySim?.reset();
      ctx.binaryScene?.reset?.();
      ctx.gwWaves?.reset?.();
    },
  }, 'resetBinary').name('↺ Reiniciar binario');

  const cosmo = gui.addFolder('Cosmología');
  folders.cosmo = cosmo;
  controllers.preset = cosmo.add(state, 'cosmoPreset', {
    'ΛCDM': 'lcdm',
    'Planck 2018': 'planck2018',
    'Hubble alto': 'hubble_tension_high',
    'Hubble bajo': 'hubble_tension_low',
    'Solo materia': 'matter_dominated',
    'Einstein-de Sitter': 'einstein_de_sitter',
    'Personalizado': 'custom',
  }).name('Modelo').onChange((v) => {
    if (v === 'custom') return;
    ctx.theoryLab.applyCosmologyPreset(v);
    syncFromUniverse();
  });
  controllers.H0 = cosmo.add(state, 'H0', 50, 90, 0.5).name('H₀').onChange(applyCosmo);
  controllers.Om = cosmo.add(state, 'OmegaM', 0, 1, 0.01).name('Ωₘ').onChange(applyCosmo);
  controllers.OL = cosmo.add(state, 'OmegaLambda', 0, 1, 0.01).name('ΩΛ').onChange(applyCosmo);

  function applyCosmo() {
    ctx.universe.setCosmology({ H0: state.H0, OmegaM: state.OmegaM, OmegaLambda: state.OmegaLambda });
    state.cosmoPreset = 'custom';
    if (controllers.preset) controllers.preset.setValue('custom');
  }
  cosmo.open();

  const horizon = gui.addFolder('Horizonte');
  folders.horizon = horizon;
  controllers.theory = horizon.add(state, 'theory', Object.keys(theoryOptions)).name('Teoría').onChange((name) => {
    const id = theoryOptions[name];
    ctx.horizonSim.setTheory(id);
    ctx.onTheoryChange(id);
  });
  controllers.launchProbe = horizon.add({ launch: () => { ctx.probe.reset(); ctx.horizonSim.launchProbe(); } }, 'launch').name('▶ Enviar sonda');
  controllers.resetProbe = horizon.add({ resetProbe: () => ctx.resetManager.resetProbe() }, 'resetProbe').name('↺ Reset sonda');

  const ruptureFolder = horizon.addFolder('★★ Ruptura física');
  folders.rupture = ruptureFolder;
  ruptureFolder.add({ aviso: '⚠ Violan física a propósito' }, 'aviso').disable();
  for (const t of PHYSICS_BREAK_THEORIES) {
    ruptureFolder.add({ pick: () => pickTheory(t.id) }, 'pick').name(t.label);
  }

  horizon.open();

  const sim = gui.addFolder('Simulación');
  folders.sim = sim;
  controllers.time = sim.add(state, 'timeScaleLog', 2, 7, 0.1).name('Velocidad (10^x)').onChange((v) => {
    ctx.universe.timeScale = 10 ** v;
    ctx.binarySim?.configure({ timeScale: ctx.universe.timeScale });
  });
  controllers.paused = sim.add(state, 'paused').name('Pausar').onChange((v) => { ctx.universe.paused = v; });
  controllers.exp = sim.add(state, 'showExpansion').name('Expansión').onChange((v) => { ctx.universe.showExpansion = v; });
  controllers.geo = sim.add(state, 'showGeodesics').name('Geodésicas').onChange((v) => { ctx.universe.showGeodesics = v; });
  controllers.lens = sim.add(state, 'showLensing').name('Lensing').onChange((v) => { ctx.universe.showLensing = v; });
  controllers.life = sim.add(state, 'lifeEnabled').name('Universo vivo').onChange((v) => { ctx.lifeEngine.enabled = v; });
  controllers.realism = sim.add(state, 'realismMode', { Estándar: 'standard', Cinemático: 'cinematic' }).name('Realismo').onChange((v) => {
    ctx.universe.realismMode = v;
    ctx.starfield?.setRealism?.(v);
    ctx.galaxyField?.setRealism?.(v);
  });
  controllers.autoCam = sim.add(state, 'autoCamera').name('Cámara auto (8s)').onChange((v) => {
    ctx.cameraLife.setEnabled?.(v);
  });
  controllers.tour = sim.add({ tour: () => ctx.cosmicTour?.start() }, 'tour').name('▶ Tour 60s');
  sim.open();

  const lab = gui.addFolder('Laboratorio');
  folders.lab = lab;
  for (const [id, exp] of Object.entries(EXPERIMENTS)) {
    lab.add({ run: () => ctx.onExperiment(id, ctx.theoryLab.runExperiment(id)) }, 'run').name(exp.name);
  }
  const customParams = { name: 'Mi fórmula', expr: 'sqrt(G * M / r)', preset: 'Energía en reposo' };
  lab.add(customParams, 'name').name('Fórmula nombre');
  lab.add(customParams, 'expr').name('Expresión');
  lab.add(customParams, 'preset', FORMULA_PRESETS.map((p) => p.name)).name('Preset').onChange((n) => {
    const p = FORMULA_PRESETS.find((x) => x.name === n);
    if (p) customParams.expr = p.expr;
  });
  lab.add({
    addFormula: () => {
      try {
        const f = createCustomFormula(customParams.name, customParams.expr);
        ctx.customFormulas.push(f);
        ctx.theoryLab.setCustomFormulas([...ctx.customFormulas]);
        saveCustomFormulas(ctx.customFormulas);
      } catch (e) { alert(e.message); }
    },
  }, 'addFormula').name('+ Fórmula');
  lab.add({ clearFormulas: () => {
    clearCustomFormulasStorage();
    ctx.customFormulas.length = 0;
    ctx.theoryLab.setCustomFormulas([]);
  }}, 'clearFormulas').name('Borrar fórmulas custom');

  const resetFolder = gui.addFolder('Reset');
  folders.reset = resetFolder;
  resetFolder.add({ partial: () => { ctx.resetManager.resetSimulation(); showResetToast('↺ Simulación reiniciada'); } }, 'partial').name('↺ Simulación');
  resetFolder.add({ full: () => { ctx.resetManager.fullReset(); ctx.guiSyncDefaults?.(); showResetToast('⏮ Reset TOTAL'); } }, 'full').name('⏮ Reset TOTAL');
  resetFolder.add({ fullClear: () => { ctx.resetManager.fullReset({ clearCustomFormulas: true }); ctx.guiSyncDefaults?.(); showResetToast('⏮ Reset + fórmulas borradas'); } }, 'fullClear').name('⏮ Reset + borrar fórmulas');
  resetFolder.open();

  function syncFromUniverse() {
    const u = ctx.universe;
    state.massSolar = u.blackHoleMassSolar;
    state.spin = u.spin;
    state.H0 = u.cosmology.H0;
    state.OmegaM = u.cosmology.OmegaM;
    state.OmegaLambda = u.cosmology.OmegaLambda;
    state.cosmoPreset = ctx.theoryLab.activePreset;
    state.timeScaleLog = Math.log10(u.timeScale);
    state.paused = u.paused;
    state.showExpansion = u.showExpansion;
    state.showGeodesics = u.showGeodesics;
    state.showLensing = u.showLensing;
    state.lifeEnabled = ctx.lifeEngine.enabled;
    state.realismMode = u.realismMode ?? 'standard';
    state.theory = theoryNameById(ctx.horizonSim.theoryId);
    state.simMode = SIMULATION_MODES[ctx.modeManager?.currentMode ?? 'black_hole'].name;
    for (const c of Object.values(controllers)) c?.updateDisplay?.();
  }

  function syncToDefaults() {
    const d = DEFAULT_STATE;
    state.massSolar = d.blackHoleMassSolar;
    state.spin = d.spin;
    state.H0 = d.cosmology.H0;
    state.OmegaM = d.cosmology.OmegaM;
    state.OmegaLambda = d.cosmology.OmegaLambda;
    state.cosmoPreset = d.cosmoPreset;
    state.timeScaleLog = Math.log10(d.timeScale);
    state.paused = d.paused;
    state.showExpansion = d.showExpansion;
    state.showGeodesics = d.showGeodesics;
    state.showLensing = d.showLensing;
    state.lifeEnabled = d.lifeEnabled;
    state.realismMode = d.realismMode ?? 'standard';
    state.theory = theoryNameById(d.theoryId);
    state.simMode = SIMULATION_MODES.black_hole.name;
    syncFromUniverse();
  }

  ctx.guiSync = syncFromUniverse;
  ctx.guiSyncDefaults = syncToDefaults;

  const TOP_LEVEL_FOLDERS = ['bh', 'cosmo', 'horizon', 'sim', 'lab', 'binary', 'reset'];
  const SIM_BASIC = new Set(['time', 'paused']);

  function setFolderTitle(folder, title) {
    if (folder?.$title) folder.$title.textContent = title;
  }

  function setFolderVisible(folder, visible) {
    if (!folder) return;
    if (visible) folder.show();
    else {
      folder.close?.();
      folder.hide();
    }
  }

  function adaptControlsToMode(modeId) {
    const config = MODE_CONTROL_MAP[modeId] ?? MODE_CONTROL_MAP.black_hole;
    const mode = SIMULATION_MODES[modeId] ?? SIMULATION_MODES.black_hole;

    modeHint.hint = `Controles para: ${mode.name}`;
    controllers.modeHint?.updateDisplay?.();

    setFolderVisible(folders.featured, !!config.featured);

    for (const key of TOP_LEVEL_FOLDERS) {
      const visible = config.folders.includes(key);
      setFolderVisible(folders[key], visible);
      if (visible) {
        setFolderTitle(folders[key], FOLDER_MODE_TITLES[modeId]?.[key] ?? FOLDER_DEFAULT_TITLES[key]);
      }
    }

    if (config.bh === 'mass') {
      controllers.mass?.show();
      controllers.spin?.hide();
    } else if (config.bh === 'full') {
      controllers.mass?.show();
      controllers.spin?.show();
    }

    if (config.cosmo === 'omega') {
      controllers.preset?.hide();
      controllers.H0?.hide();
      controllers.Om?.show();
      controllers.OL?.show();
    } else if (config.cosmo === 'full') {
      controllers.preset?.show();
      controllers.H0?.show();
      controllers.Om?.show();
      controllers.OL?.show();
    }

    if (config.horizon === 'theory') {
      controllers.theory?.show();
      controllers.launchProbe?.hide();
      controllers.resetProbe?.hide();
      setFolderVisible(folders.rupture, false);
    } else if (config.horizon === 'full') {
      controllers.theory?.show();
      controllers.launchProbe?.show();
      controllers.resetProbe?.show();
      setFolderVisible(folders.rupture, true);
    }

    const simKeys = ['time', 'paused', 'exp', 'geo', 'lens', 'life', 'realism', 'autoCam', 'tour'];
    for (const key of simKeys) {
      const ctrl = controllers[key];
      if (!ctrl) continue;
      if (config.sim === 'basic') ctrl.show(SIM_BASIC.has(key));
      else if (config.sim === 'full') ctrl.show();
    }
  }

  ctx.adaptGuiToMode = adaptControlsToMode;
  adaptControlsToMode(ctx.modeManager?.currentMode ?? 'black_hole');

  return { gui, syncFromUniverse, syncToDefaults, adaptControlsToMode };
}

export { theoryNameById, theoryOptions };
