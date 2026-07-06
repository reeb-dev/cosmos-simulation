import { t } from '../i18n/i18n.js';
import { MODE_IDS, getModeName } from '../simulation/simulation-modes.js';

const MODE_ICONS = {
  black_hole: '⚫',
  gargantua: '🎬',
  multiverse: '🫧',
  higgs: '✨',
  cosmology: '🌌',
  theory_picker: '🔭',
  string_theory: '〰️',
  binary_merger: '💥',
  galaxy_collision: '🌌',
  deep_field: '🌠',
};

/** Selector horizontal de modos — reemplaza la barra pasiva */
export function createModePicker(ctx) {
  const container = document.getElementById('mode-picker-chips');
  if (!container) return null;

  function render(activeId) {
    container.innerHTML = MODE_IDS.map((id) => {
      const active = id === activeId ? ' active' : '';
      const icon = MODE_ICONS[id] ?? '·';
      const name = getModeName(id);
      const short = name.length > 14 ? `${name.slice(0, 12)}…` : name;
      return `<button type="button" class="mode-chip${active}" data-mode="${id}" title="${name}">${icon} ${short}</button>`;
    }).join('');

    for (const btn of container.querySelectorAll('.mode-chip')) {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        if (mode && mode !== ctx.modeManager?.currentMode) {
          ctx.modeManager?.setMode(mode);
        }
      });
    }
  }

  render(ctx.modeManager?.currentMode ?? 'black_hole');

  return {
    refresh(activeId = ctx.modeManager?.currentMode) {
      render(activeId);
    },
  };
}
