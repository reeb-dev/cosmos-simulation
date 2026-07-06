import { t } from '../i18n/i18n.js';

const STORAGE_KEY = 'cosmos-panel-collapsed-v2';

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

/**
 * Añade botón minimizar (▼/▲) a un panel.
 */
export function initPanelCollapse(panelId, { defaultCollapsed = false, title = '' } = {}) {
  const panel = document.getElementById(panelId);
  if (!panel || panel.dataset.collapseInit) return;
  if (panel.querySelector('.panel-header')) {
    panel.dataset.collapseInit = '1';
    const header = panel.querySelector('.panel-header');
    let titleEl = header.querySelector('.panel-title');
    if (title && !titleEl) {
      titleEl = document.createElement('span');
      titleEl.className = 'panel-title';
      titleEl.textContent = title;
      header.insertBefore(titleEl, header.firstChild);
    } else if (titleEl && title) {
      titleEl.textContent = title;
    }
    return;
  }
  panel.dataset.collapseInit = '1';

  const state = loadState();
  const collapsed = state[panelId] ?? defaultCollapsed;

  const header = document.createElement('div');
  header.className = 'panel-header';

  const titleEl = document.createElement('span');
  titleEl.className = 'panel-title';
  titleEl.textContent = title;

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'panel-toggle';
  toggle.setAttribute('aria-label', t('panels.collapse'));
  toggle.textContent = collapsed ? '▲' : '▼';

  const body = document.createElement('div');
  body.className = 'panel-body';
  while (panel.firstChild) body.appendChild(panel.firstChild);
  panel.appendChild(header);
  panel.appendChild(body);
  if (title) header.appendChild(titleEl);
  header.appendChild(toggle);

  function setCollapsed(v, { persist = true } = {}) {
    panel.classList.toggle('panel-collapsed', v);
    toggle.textContent = v ? '▲' : '▼';
    if (persist) {
      state[panelId] = v;
      saveState(state);
    }
  }

  panel._setCollapsed = setCollapsed;
  setCollapsed(collapsed);
  toggle.addEventListener('click', () => setCollapsed(!panel.classList.contains('panel-collapsed')));
}

/** Colapsa o expande un panel ya inicializado. */
export function setPanelCollapsed(panelId, collapsed, { persist = true } = {}) {
  const panel = document.getElementById(panelId);
  if (!panel) return;
  if (typeof panel._setCollapsed === 'function') {
    panel._setCollapsed(collapsed, { persist });
    return;
  }
  panel.classList.toggle('panel-collapsed', collapsed);
  const btn = panel.querySelector('.panel-toggle');
  if (btn) btn.textContent = collapsed ? '▲' : '▼';
  if (persist) {
    const state = loadState();
    state[panelId] = collapsed;
    saveState(state);
  }
}
