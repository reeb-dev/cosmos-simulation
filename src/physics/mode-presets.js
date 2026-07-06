import { t } from '../i18n/i18n.js';
import { showToast } from '../ui/toast.js';

function syncRealism(ctx, mode) {
  ctx.universe.realismMode = mode;
  ctx.binarySim?.configure?.({ realismMode: mode });
  ctx.starfield?.setRealism?.(mode);
  ctx.galaxyField?.setRealism?.(mode);
  ctx.deepField?.setRealism?.(mode);
  ctx.gwWaves?.setRealism?.(mode);
}

function setTheory(ctx, id) {
  ctx.horizonSim?.setTheory(id);
  ctx.onTheoryChange?.(id);
}

/**
 * Escenarios preconfigurados para probar modos con un clic.
 * Cada preset aplica modo, física, cámara y opciones visuales óptimas.
 */
export const MODE_PRESETS = [
  {
    id: 'bh_realistic',
    mode: 'black_hole',
    icon: '⚫',
    apply(ctx) {
      ctx.universe.setBlackHoleMass(30);
      ctx.universe.spin = 0.35;
      syncRealism(ctx, 'realistic');
      ctx.universe.showLensing = true;
      ctx.universe.showGeodesics = true;
      ctx.universe.showExpansion = false;
      ctx.lifeEngine.enabled = false;
      setTheory(ctx, 'singularity');
      ctx.onRsChange?.();
      ctx.modeManager.setMode('black_hole');
      ctx.modeManager.zoomWide?.();
    },
  },
  {
    id: 'gargantua_disk',
    mode: 'gargantua',
    icon: '🎬',
    apply(ctx) {
      ctx.modeManager.setMode('gargantua');
      ctx.modeManager.zoomToDisk?.();
    },
  },
  {
    id: 'theory_horizon',
    mode: 'theory_picker',
    icon: '🔭',
    apply(ctx) {
      ctx.universe.setBlackHoleMass(25);
      ctx.universe.spin = 0.5;
      syncRealism(ctx, 'realistic');
      ctx.universe.showLensing = true;
      setTheory(ctx, 'hawking_islands');
      ctx.onRsChange?.();
      ctx.modeManager.setMode('theory_picker');
      ctx.modeManager.zoomToHorizon?.();
    },
  },
  {
    id: 'binary_gw150914',
    mode: 'binary_merger',
    icon: '💥',
    apply(ctx) {
      syncRealism(ctx, 'realistic');
      ctx.binarySim?.configure?.({
        m1Solar: 36,
        m2Solar: 29,
        separationVis: 70,
        spin1: 0.7,
        spin2: -0.3,
        hawkingDeath: true,
        timeScale: 1.2,
      });
      ctx.modeManager.setMode('binary_merger');
    },
  },
  {
    id: 'cosmo_planck',
    mode: 'cosmology',
    icon: '🌌',
    apply(ctx) {
      ctx.theoryLab?.applyCosmologyPreset?.('planck2018');
      syncRealism(ctx, 'realistic');
      ctx.universe.showExpansion = true;
      ctx.universe.showLensing = false;
      ctx.lifeEngine.enabled = true;
      ctx.modeManager.setMode('cosmology');
      ctx.modeManager.zoomWide?.();
    },
  },
  {
    id: 'deep_field',
    mode: 'deep_field',
    icon: '🌠',
    apply(ctx) {
      ctx.theoryLab?.applyCosmologyPreset?.('planck2018');
      syncRealism(ctx, 'realistic');
      ctx.universe.showExpansion = true;
      ctx.deepField?.setCosmicScale?.(0.72);
      ctx.modeManager.setMode('deep_field');
    },
  },
  {
    id: 'multiverse_omega',
    mode: 'multiverse',
    icon: '🫧',
    apply(ctx) {
      ctx.theoryLab?.applyCosmologyPreset?.('lcdm');
      setTheory(ctx, 'omega_multiverse');
      ctx.modeManager.setMode('multiverse');
    },
  },
  {
    id: 'string_cosmic',
    mode: 'string_theory',
    icon: '〰️',
    apply(ctx) {
      setTheory(ctx, 'string_theory');
      ctx.modeManager.setMode('string_theory');
    },
  },
  {
    id: 'higgs_field',
    mode: 'higgs',
    icon: '✨',
    apply(ctx) {
      ctx.modeManager.setMode('higgs');
    },
  },
];

export const MODE_PRESET_IDS = MODE_PRESETS.map((p) => p.id);

export function getModePresetLabel(id) {
  const key = `modePresets.${id}`;
  const label = t(key);
  return label !== key ? label : id;
}

export function getModePreset(id) {
  return MODE_PRESETS.find((p) => p.id === id) ?? null;
}

export function applyModePreset(ctx, presetId) {
  const preset = getModePreset(presetId);
  if (!preset) return false;

  preset.apply(ctx);
  ctx.guiSync?.();
  ctx.modePicker?.setActivePreset?.(presetId);
  showToast(t('toast.presetApplied', { preset: getModePresetLabel(presetId) }));
  return true;
}
