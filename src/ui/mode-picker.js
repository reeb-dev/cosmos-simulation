import { t } from '../i18n/i18n.js';
import { MODE_IDS, getModeName } from '../simulation/simulation-modes.js';
import { MODE_PRESETS, getModePresetLabel, applyModePreset } from '../physics/mode-presets.js';

const MODE_ICONS = {
  black_hole: '⚫',
  gargantua: '🎬',
  multiverse: '🫧',
  higgs: '✨',
  cosmology: '🌌',
  theory_picker: '🔭',
  string_theory: '〰️',
  binary_merger: '💥',
  deep_field: '🌠',
};

/** Selector horizontal de modos y escenarios preconfigurados */
export function createModePicker(ctx) {
  const modeContainer = document.getElementById('mode-picker-chips');
  const presetContainer = document.getElementById('mode-preset-chips');
  let activePresetId = null;

  function renderModes(activeId) {
    if (!modeContainer) return;
    modeContainer.innerHTML = MODE_IDS.map((id) => {
      const active = id === activeId ? ' active' : '';
      const icon = MODE_ICONS[id] ?? '·';
      const name = getModeName(id);
      const short = name.length > 14 ? `${name.slice(0, 12)}…` : name;
      return `<button type="button" class="mode-chip${active}" data-mode="${id}" title="${name}">${icon} ${short}</button>`;
    }).join('');

    for (const btn of modeContainer.querySelectorAll('.mode-chip')) {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        if (mode && mode !== ctx.modeManager?.currentMode) {
          activePresetId = null;
          renderPresets(null);
          ctx.modeManager?.setMode(mode);
        }
      });
    }
  }

  function renderPresets(activeId = activePresetId) {
    if (!presetContainer) return;
    activePresetId = activeId;
    presetContainer.innerHTML = MODE_PRESETS.map((preset) => {
      const active = preset.id === activeId ? ' active' : '';
      const label = getModePresetLabel(preset.id);
      const short = label.length > 16 ? `${label.slice(0, 14)}…` : label;
      return `<button type="button" class="mode-chip mode-preset-chip${active}" data-preset="${preset.id}" title="${label}">${preset.icon} ${short}</button>`;
    }).join('');

    for (const btn of presetContainer.querySelectorAll('.mode-preset-chip')) {
      btn.addEventListener('click', () => {
        const presetId = btn.dataset.preset;
        if (presetId) applyModePreset(ctx, presetId);
      });
    }
  }

  renderModes(ctx.modeManager?.currentMode ?? 'black_hole');
  renderPresets(null);

  return {
    refresh(activeId = ctx.modeManager?.currentMode) {
      renderModes(activeId);
      const preset = MODE_PRESETS.find((p) => p.id === activePresetId);
      if (preset && preset.mode !== activeId) {
        activePresetId = null;
      }
      renderPresets(activePresetId);
    },
    setActivePreset(presetId) {
      renderPresets(presetId);
    },
  };
}
