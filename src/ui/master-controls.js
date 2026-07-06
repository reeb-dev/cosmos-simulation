import GUI from 'lil-gui';
import { t, getBundle } from '../i18n/i18n.js';
import { theoryPrefix, getTheoryName } from '../i18n/theory-i18n.js';
import { DEFAULT_STATE } from '../simulation/reset-manager.js';
import { HORIZON_THEORIES, THEORY_IDS } from '../simulation/horizon-theories.js';
import { SIMULATION_MODES, MODE_IDS, FEATURED_THEORIES, PHYSICS_BREAK_THEORIES, getModeName } from '../simulation/simulation-modes.js';
import { EXPERIMENTS } from '../lab/theory-lab.js';
import { FORMULA_PRESETS, createCustomFormula, saveCustomFormulas, clearCustomFormulasStorage } from '../lab/custom-formula.js';
import { applyGargantuaPreset } from '../physics/gargantua-preset.js';
import { MODE_PRESETS, getModePresetLabel, applyModePreset } from '../physics/mode-presets.js';
function buildTheoryOptions() {
  const opts = {};
  for (const id of THEORY_IDS) {
    opts[getTheoryName(id)] = id;
  }
  return opts;
}

function buildModeOptions() {
  const opts = {};
  for (const id of MODE_IDS) {
    opts[getModeName(id)] = id;
  }
  return opts;
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
  gargantua: {
    folders: ['bh', 'horizon', 'sim', 'reset'],
    featured: true,
    bh: 'mass',
    horizon: 'full',
    sim: 'basic',
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
  deep_field: {
    folders: ['cosmo', 'sim', 'lab', 'reset'],
    featured: false,
    cosmo: 'full',
    sim: 'full',
  },
};

function folderDefaultTitles() {
  return {
    bh: t('gui.bh'),
    cosmo: t('gui.cosmo'),
    horizon: t('gui.horizon'),
    sim: t('gui.sim'),
    lab: t('gui.lab'),
    binary: t('gui.binary'),
    reset: t('gui.reset'),
  };
}

const FOLDER_MODE_TITLES = {
  multiverse: { cosmo: 'gui.cosmoMultiverse' },
  string_theory: { horizon: 'gui.horizonStrings' },
};

/**
 * GUI unificada con sincronización bidireccional.
 */
export function createMasterGui(ctx) {
  const gui = new GUI({ title: t('gui.title'), width: 280 });
  gui.domElement.style.marginTop = '8px';

  let theoryOptions = buildTheoryOptions();
  let modeOptions = buildModeOptions();

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
    realismMode: ctx.universe.realismMode ?? 'realistic',
    cosmicScale: ctx.deepField?.getCosmicScale?.() ?? 0.65,
    theory: getTheoryName(ctx.horizonSim.theoryId),
    autoCamera: true,
    simMode: getModeName(ctx.modeManager?.currentMode ?? 'black_hole'),
  };

  const controllers = {};
  const folders = {};
  const featuredControllers = [];
  const ruptureControllers = [];
  const labControllers = [];

  const modeFolder = gui.addFolder(t('gui.modeFolder'));
  folders.mode = modeFolder;
  controllers.simMode = modeFolder.add(state, 'simMode', Object.keys(modeOptions)).name(t('gui.scene')).onChange((name) => {
    const id = modeOptions[name];
    ctx.modeManager?.setMode(id);
  });
  controllers.viewDeepField = modeFolder.add({
    viewDeepField: () => {
      ctx.modeManager?.setMode('deep_field');
      syncFromUniverse();
    },
  }, 'viewDeepField').name(t('gui.viewUniverseAtScale'));

  const presetsFolder = modeFolder.addFolder(t('gui.modePresets'));
  folders.presets = presetsFolder;
  for (const preset of MODE_PRESETS) {
    presetsFolder.add({
      launch: () => applyModePreset(ctx, preset.id),
    }, 'launch').name(`${preset.icon} ${getModePresetLabel(preset.id)}`);
  }
  presetsFolder.open();

  const modeHint = { hint: '' };
  controllers.modeHint = modeFolder.add(modeHint, 'hint').name(' ').disable();
  controllers.modeHint.domElement.classList.add('mode-control-hint');

  modeFolder.open();

  const featuredFolder = modeFolder.addFolder(t('gui.featuredFolder'));
  folders.featured = featuredFolder;
  const pickTheory = (id) => {
    ctx.horizonSim.setTheory(id);
    ctx.onTheoryChange(id);
    ctx.modeManager?.zoomToHorizon?.();
    syncFromUniverse();
  };
  for (const ft of FEATURED_THEORIES) {
    const ctrl = featuredFolder.add({ pick: () => pickTheory(ft.id) }, 'pick').name(t(`featuredTheories.${ft.id}`));
    featuredControllers.push({ ctrl, id: ft.id });
  }

  const bh = gui.addFolder(t('gui.bh'));
  folders.bh = bh;
  controllers.mass = bh.add(state, 'massSolar', 1, 100, 1).name(t('gui.mass')).onChange((v) => {
    ctx.universe.setBlackHoleMass(v);
    ctx.onRsChange();
  });
  controllers.spin = bh.add(state, 'spin', 0, 0.998, 0.01).name(t('gui.spin')).onChange((v) => {
    ctx.universe.spin = v;
    ctx.onRsChange();
  });
  controllers.gargantua = bh.add({
    gargantua: () => applyGargantuaPreset(ctx),
  }, 'gargantua').name(t('gui.gargantuaPreset'));
  bh.open();

  const binaryState = {
    m1: ctx.binarySim?.m1Solar ?? 30,
    m2: ctx.binarySim?.m2Solar ?? 20,
    separation: ctx.binarySim?.separationVis ?? 80,
    spin1: ctx.binarySim?.spin1 ?? 0.6,
    spin2: ctx.binarySim?.spin2 ?? 0.4,
    hawkingDeath: ctx.binarySim?.hawkingDeath ?? true,
  };
  const binaryFolder = gui.addFolder(t('gui.binary'));
  folders.binary = binaryFolder;
  binaryFolder.add(binaryState, 'm1', 5, 80, 1).name(t('gui.m1')).onChange((v) => {
    ctx.binarySim?.configure({ m1Solar: v });
  });
  binaryFolder.add(binaryState, 'm2', 5, 80, 1).name(t('gui.m2')).onChange((v) => {
    ctx.binarySim?.configure({ m2Solar: v });
  });
  binaryFolder.add(binaryState, 'separation', 30, 150, 1).name(t('gui.separation')).onChange((v) => {
    ctx.binarySim?.configure({ separationVis: v });
  });
  binaryFolder.add(binaryState, 'spin1', 0, 0.998, 0.01).name(t('gui.spin1')).onChange((v) => {
    ctx.binarySim?.configure({ spin1: v });
  });
  binaryFolder.add(binaryState, 'spin2', 0, 0.998, 0.01).name(t('gui.spin2')).onChange((v) => {
    ctx.binarySim?.configure({ spin2: v });
  });
  binaryFolder.add(binaryState, 'hawkingDeath').name(t('gui.hawkingDeath')).onChange((v) => {
    ctx.binarySim?.configure({ hawkingDeath: v });
  });
  binaryFolder.add({
    gw150914: () => {
      binaryState.m1 = 36;
      binaryState.m2 = 29;
      binaryState.spin1 = 0.7;
      binaryState.spin2 = -0.4;
      binaryState.separation = 95;
      ctx.binarySim?.configure({
        m1Solar: 36,
        m2Solar: 29,
        spin1: 0.7,
        spin2: -0.4,
        separationVis: 95,
        hawkingDeath: binaryState.hawkingDeath,
        timeScale: ctx.universe.timeScale,
        realismMode: 'realistic',
      });
      ctx.modeManager?.setMode('binary_merger');
      ctx.binarySim?.startCollision();
      syncFromUniverse();
    },
  }, 'gw150914').name(t('gui.gw150914'));
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
  }, 'start').name(t('gui.startCollision'));
  binaryFolder.add({
    resetBinary: () => {
      ctx.binarySim?.reset();
      ctx.binaryScene?.reset?.();
      ctx.gwWaves?.reset?.();
    },
  }, 'resetBinary').name(t('gui.resetBinary'));

  const cosmoPresets = getBundle('gui.cosmoPresets') ?? {};
  const cosmo = gui.addFolder(t('gui.cosmo'));
  folders.cosmo = cosmo;
  controllers.preset = cosmo.add(state, 'cosmoPreset', cosmoPresets).name(t('gui.model') || 'Model').onChange((v) => {
    if (v === 'custom') return;
    ctx.theoryLab.applyCosmologyPreset(v);
    syncFromUniverse();
  });
  controllers.H0 = cosmo.add(state, 'H0', 50, 90, 0.5).name('H₀').onChange(applyCosmo);
  controllers.Om = cosmo.add(state, 'OmegaM', 0, 1, 0.01).name('Ωₘ').onChange(applyCosmo);
  controllers.OL = cosmo.add(state, 'OmegaLambda', 0, 1, 0.01).name('ΩΛ').onChange(applyCosmo);
  controllers.cosmicScale = cosmo.add(state, 'cosmicScale', 0, 1, 0.01).name(t('gui.cosmicScale')).onChange((v) => {
    ctx.deepField?.setCosmicScale?.(v);
  });

  function applyCosmo() {
    ctx.universe.setCosmology({
      H0: state.H0,
      OmegaM: state.OmegaM,
      OmegaLambda: state.OmegaLambda,
    });
    ctx.universe.repairCosmology();
    state.H0 = ctx.universe.cosmology.H0;
    state.OmegaM = ctx.universe.cosmology.OmegaM;
    state.OmegaLambda = ctx.universe.cosmology.OmegaLambda;
    state.cosmoPreset = 'custom';
    if (controllers.preset) controllers.preset.setValue('custom');
  }
  cosmo.open();

  const horizon = gui.addFolder(t('gui.horizon'));
  folders.horizon = horizon;
  controllers.theory = horizon.add(state, 'theory', Object.keys(theoryOptions)).name(t('gui.theory')).onChange((name) => {
    const id = theoryOptions[name];
    ctx.horizonSim.setTheory(id);
    ctx.onTheoryChange(id);
  });
  controllers.launchProbe = horizon.add({ launch: () => { ctx.probe.reset(); ctx.horizonSim.launchProbe(); } }, 'launch').name(t('gui.launchProbe'));
  controllers.resetProbe = horizon.add({ resetProbe: () => ctx.resetManager.resetProbe() }, 'resetProbe').name(t('gui.resetProbe'));

  const ruptureFolder = horizon.addFolder(t('gui.ruptureFolder'));
  folders.rupture = ruptureFolder;
  ruptureFolder.add({ aviso: t('gui.ruptureWarning') }, 'aviso').disable();
  for (const rt of PHYSICS_BREAK_THEORIES) {
    const ctrl = ruptureFolder.add({ pick: () => pickTheory(rt.id) }, 'pick').name(t(`physicsBreakTheories.${rt.id}`));
    ruptureControllers.push({ ctrl, id: rt.id });
  }

  horizon.open();

  const realismLabels = {
    [t('gui.realismGargantua')]: 'gargantua',
    [t('gui.realismRealistic')]: 'realistic',
    [t('gui.realismStandard')]: 'standard',
    [t('gui.realismCinematic')]: 'cinematic',
  };

  const sim = gui.addFolder(t('gui.sim'));
  folders.sim = sim;
  controllers.time = sim.add(state, 'timeScaleLog', 2, 7, 0.1).name(t('gui.timeScale')).onChange((v) => {
    ctx.universe.timeScale = 10 ** v;
    ctx.binarySim?.configure({ timeScale: ctx.universe.timeScale });
  });
  controllers.paused = sim.add(state, 'paused').name(t('gui.pause')).onChange((v) => { ctx.universe.paused = v; });
  controllers.exp = sim.add(state, 'showExpansion').name(t('gui.expansion')).onChange((v) => { ctx.universe.showExpansion = v; });
  controllers.geo = sim.add(state, 'showGeodesics').name(t('gui.geodesics')).onChange((v) => { ctx.universe.showGeodesics = v; });
  controllers.lens = sim.add(state, 'showLensing').name(t('gui.lensing')).onChange((v) => { ctx.universe.showLensing = v; });
  controllers.life = sim.add(state, 'lifeEnabled').name(t('gui.life')).onChange((v) => { ctx.lifeEngine.enabled = v; });
  controllers.realism = sim.add(state, 'realismMode', realismLabels).name(t('gui.realism')).onChange((v) => {
    ctx.universe.realismMode = v;
    ctx.binarySim?.configure({ realismMode: v });
    ctx.starfield?.setRealism?.(v);
    ctx.galaxyField?.setRealism?.(v);
    ctx.deepField?.setRealism?.(v);
    ctx.gwWaves?.setRealism?.(v);
  });
  controllers.autoCam = sim.add(state, 'autoCamera').name(t('gui.autoCamera')).onChange((v) => {
    ctx.cameraLife.setEnabled?.(v);
  });
  controllers.zoomHorizon = sim.add({ zoomHorizon: () => ctx.modeManager?.zoomToHorizon?.() }, 'zoomHorizon').name(t('gui.zoomHorizon'));
  controllers.zoomDisk = sim.add({ zoomDisk: () => ctx.modeManager?.zoomToDisk?.() }, 'zoomDisk').name(t('gui.zoomDisk'));
  controllers.zoomWide = sim.add({ zoomWide: () => ctx.modeManager?.zoomWide?.() }, 'zoomWide').name(t('gui.zoomWide'));
  controllers.tour = sim.add({ tour: () => ctx.cosmicTour?.start() }, 'tour').name(t('gui.tour'));
  sim.open();

  const lab = gui.addFolder(t('gui.lab'));
  folders.lab = lab;
  for (const [id, exp] of Object.entries(EXPERIMENTS)) {
    const ctrl = lab.add({ run: () => ctx.onExperiment(id, ctx.theoryLab.runExperiment(id)) }, 'run').name(exp.name);
    labControllers.push({ ctrl, id, name: exp.name });
  }
  const customParams = { name: t('gui.formulaName'), expr: 'sqrt(G * M / r)', preset: FORMULA_PRESETS[0]?.name ?? '' };
  lab.add(customParams, 'name').name(t('gui.formulaName'));
  lab.add(customParams, 'expr').name(t('gui.expression'));
  lab.add(customParams, 'preset', FORMULA_PRESETS.map((p) => p.name)).name(t('gui.preset')).onChange((n) => {
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
  }, 'addFormula').name(t('gui.addFormula'));
  lab.add({ clearFormulas: () => {
    clearCustomFormulasStorage();
    ctx.customFormulas.length = 0;
    ctx.theoryLab.setCustomFormulas([]);
  }}, 'clearFormulas').name(t('gui.clearFormulas'));

  const resetFolder = gui.addFolder(t('gui.reset'));
  folders.reset = resetFolder;
  resetFolder.add({ partial: () => { ctx.resetManager.resetSimulation(); showResetToast(t('toast.resetSim')); } }, 'partial').name(t('gui.resetSim'));
  resetFolder.add({ full: () => { ctx.resetManager.fullReset(); ctx.guiSyncDefaults?.(); showResetToast(t('toast.resetFull')); } }, 'full').name(t('gui.resetFull'));
  resetFolder.add({ fullClear: () => { ctx.resetManager.fullReset({ clearCustomFormulas: true }); ctx.guiSyncDefaults?.(); showResetToast(t('toast.resetFullClear')); } }, 'fullClear').name(t('gui.resetFullClear'));
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
    state.realismMode = u.realismMode ?? 'realistic';
    state.cosmicScale = ctx.deepField?.getCosmicScale?.() ?? state.cosmicScale;
    state.theory = getTheoryName(ctx.horizonSim.theoryId);
    state.simMode = getModeName(ctx.modeManager?.currentMode ?? 'black_hole');
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
    state.realismMode = d.realismMode ?? 'realistic';
    state.theory = getTheoryName(d.theoryId);
    state.simMode = getModeName('black_hole');
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
    const mode = getModeName(modeId);

    modeHint.hint = t('gui.modeHint', { mode });
    controllers.modeHint?.updateDisplay?.();

    setFolderVisible(folders.featured, !!config.featured);

    const defaults = folderDefaultTitles();
    for (const key of TOP_LEVEL_FOLDERS) {
      const visible = config.folders.includes(key);
      setFolderVisible(folders[key], visible);
      if (visible) {
        const titleKey = FOLDER_MODE_TITLES[modeId]?.[key];
        setFolderTitle(folders[key], titleKey ? t(titleKey) : defaults[key]);
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
      controllers.cosmicScale?.hide();
    } else if (config.cosmo === 'full') {
      controllers.preset?.show();
      controllers.H0?.show();
      controllers.Om?.show();
      controllers.OL?.show();
      if (modeId === 'deep_field') controllers.cosmicScale?.show();
      else controllers.cosmicScale?.hide();
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

    const simKeys = ['time', 'paused', 'exp', 'geo', 'lens', 'life', 'realism', 'autoCam', 'zoomHorizon', 'zoomDisk', 'zoomWide', 'tour'];
    for (const key of simKeys) {
      const ctrl = controllers[key];
      if (!ctrl) continue;
      if (config.sim === 'basic') ctrl.show(SIM_BASIC.has(key));
      else if (config.sim === 'full') ctrl.show();
    }
  }

  function refreshGuiI18n() {
    gui.title(t('gui.title'));
    theoryOptions = buildTheoryOptions();
    modeOptions = buildModeOptions();
    const currentModeId = ctx.modeManager?.currentMode ?? 'black_hole';
    const currentTheoryId = ctx.horizonSim.theoryId;

    setFolderTitle(folders.mode, t('gui.modeFolder'));
    controllers.simMode?.options(Object.keys(modeOptions));
    controllers.simMode?.name(t('gui.scene'));
    controllers.viewDeepField?.name(t('gui.viewUniverseAtScale'));
    state.simMode = getModeName(currentModeId);
    controllers.simMode?.setValue(state.simMode);

    setFolderTitle(folders.featured, t('gui.featuredFolder'));
    for (const { ctrl, id } of featuredControllers) {
      ctrl.name(t(`featuredTheories.${id}`));
    }

    setFolderTitle(folders.bh, t('gui.bh'));
    controllers.mass?.name(t('gui.mass'));
    controllers.spin?.name(t('gui.spin'));
    controllers.gargantua?.name(t('gui.gargantuaPreset'));
    setFolderTitle(folders.binary, t('gui.binary'));
    setFolderTitle(folders.cosmo, t('gui.cosmo'));
    controllers.cosmicScale?.name(t('gui.cosmicScale'));
    setFolderTitle(folders.horizon, t('gui.horizon'));
    controllers.theory?.options(Object.keys(theoryOptions));
    controllers.theory?.name(t('gui.theory'));
    state.theory = getTheoryName(currentTheoryId);
    controllers.theory?.setValue(state.theory);
    controllers.launchProbe?.name(t('gui.launchProbe'));
    controllers.resetProbe?.name(t('gui.resetProbe'));
    setFolderTitle(folders.rupture, t('gui.ruptureFolder'));
    for (const { ctrl, id } of ruptureControllers) {
      ctrl.name(t(`physicsBreakTheories.${id}`));
    }
    setFolderTitle(folders.sim, t('gui.sim'));
    controllers.time?.name(t('gui.timeScale'));
    controllers.paused?.name(t('gui.pause'));
    controllers.exp?.name(t('gui.expansion'));
    controllers.geo?.name(t('gui.geodesics'));
    controllers.lens?.name(t('gui.lensing'));
    controllers.life?.name(t('gui.life'));
    controllers.realism?.name(t('gui.realism'));
    controllers.autoCam?.name(t('gui.autoCamera'));
    controllers.zoomHorizon?.name(t('gui.zoomHorizon'));
    controllers.zoomDisk?.name(t('gui.zoomDisk'));
    controllers.zoomWide?.name(t('gui.zoomWide'));
    controllers.tour?.name(t('gui.tour'));
    setFolderTitle(folders.lab, t('gui.lab'));
    setFolderTitle(folders.reset, t('gui.reset'));

    adaptControlsToMode(currentModeId);
    syncFromUniverse();
  }

  ctx.adaptGuiToMode = adaptControlsToMode;
  ctx.refreshGuiI18n = refreshGuiI18n;
  adaptControlsToMode(ctx.modeManager?.currentMode ?? 'black_hole');

  let guiVisible = true;
  ctx.guiVisible = true;
  ctx.toggleGui = () => {
    guiVisible = !guiVisible;
    ctx.guiVisible = guiVisible;
    gui.domElement.style.display = guiVisible ? '' : 'none';
  };

  return { gui, syncFromUniverse, syncToDefaults, adaptControlsToMode, refreshGuiI18n, controllers, folders, toggleGui: ctx.toggleGui };
}

export function theoryNameById(id) {
  return getTheoryName(id);
}

export { buildTheoryOptions as theoryOptions };
