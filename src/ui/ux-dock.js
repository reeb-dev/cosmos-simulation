import { t } from '../i18n/i18n.js';
import { getLocale, setLocale } from '../i18n/i18n.js';
import { setPanelCollapsed } from './panel-collapse.js';
import { showToast } from './toast.js';

function togglePanel(panelId) {
  const panel = document.getElementById(panelId);
  const btn = panel?.querySelector('.panel-toggle');
  if (panel && btn) {
    const collapsed = panel.classList.contains('panel-collapsed');
    panel.classList.toggle('panel-collapsed', !collapsed);
    btn.textContent = collapsed ? '▼' : '▲';
  }
}

/** Barra de acciones rápidas (dock inferior) */
export function createUxDock(ctx) {
  const dock = document.getElementById('ux-dock');
  if (!dock) return null;

  function openResearchPanel() {
    if (ctx.cleanView?.isClean?.()) {
      ctx.cleanView.setClean(false);
      updateCleanBtn();
    }
    setPanelCollapsed('research-panel', false);
    document.getElementById('research-panel')?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
  }

  const buttons = [
    { id: 'guide', icon: '?', action: () => ctx.guidePanel?.toggle?.() },
    { id: 'info', icon: 'ℹ', action: () => ctx.modeExplainer?.toggle?.() },
    { id: 'tour', icon: '▶', action: () => ctx.cosmicTour?.start?.() },
    { id: 'pause', icon: '⏸', toggle: true, action: () => {
      ctx.universe.paused = !ctx.universe.paused;
      ctx.guiSync?.();
      updatePauseBtn();
    }},
    { id: 'reset', icon: '↺', action: () => ctx.resetManager?.fullReset?.() },
    { id: 'clean', icon: '👁', toggle: true, action: () => {
      ctx.cleanView?.toggle?.();
      updateCleanBtn();
    }},
    { id: 'research', icon: '📊', action: () => openResearchPanel() },
    { id: 'lang', icon: '🌐', action: async () => {
      const next = getLocale() === 'es' ? 'en' : 'es';
      await setLocale(next);
      ctx.uxDock?.refresh?.();
      showToast(next === 'es' ? 'Idioma: Español' : 'Language: English');
    }},
    { id: 'controls', icon: '⚙', toggle: true, action: () => ctx.toggleGui?.() },
  ];

  const btnEls = {};

  dock.innerHTML = buttons.map((b) =>
    `<button type="button" class="ux-dock-btn" data-id="${b.id}" title="">${b.icon}</button>`
  ).join('');

  for (const b of buttons) {
    const el = dock.querySelector(`[data-id="${b.id}"]`);
    if (!el) continue;
    el.title = t(`ux.${b.id}`);
    el.addEventListener('click', b.action);
    btnEls[b.id] = el;
  }

  function updatePauseBtn() {
    const el = btnEls.pause;
    if (!el) return;
    const paused = ctx.universe.paused;
    el.textContent = paused ? '▶' : '⏸';
    el.title = paused ? t('ux.play') : t('ux.pause');
    el.classList.toggle('active', paused);
  }

  function updateControlsBtn() {
    const el = btnEls.controls;
    if (!el) return;
    el.classList.toggle('active', ctx.guiVisible !== false);
  }

  function updateCleanBtn() {
    const el = btnEls.clean;
    if (!el) return;
    const clean = ctx.cleanView?.isClean?.() ?? false;
    el.classList.toggle('active', clean);
    el.title = clean ? t('ux.cleanViewOn') : t('ux.cleanViewOff');
  }

  updatePauseBtn();
  updateControlsBtn();
  updateCleanBtn();

  return {
    refresh() {
      updatePauseBtn();
      updateControlsBtn();
      updateCleanBtn();
      for (const b of buttons) {
        const el = btnEls[b.id];
        if (!el) continue;
        if (b.id === 'clean') {
          updateCleanBtn();
        } else if (b.id !== 'pause') {
          el.title = t(`ux.${b.id}`);
        }
      }
    },
  };
}

/** Ayuda superior: se atenúa tras unos segundos, vuelve al pasar el ratón */
export function initHelpBarFade(delayMs = 12000) {
  const bar = document.getElementById('help-bar');
  if (!bar) return;
  let timer = setTimeout(() => bar.classList.add('faded'), delayMs);
  const wake = () => {
    bar.classList.remove('faded');
    clearTimeout(timer);
    timer = setTimeout(() => bar.classList.add('faded'), delayMs);
  };
  bar.addEventListener('mouseenter', wake);
  document.addEventListener('keydown', wake, { passive: true });
}

export { showToast };
