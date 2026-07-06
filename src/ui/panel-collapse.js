const STORAGE_KEY = 'cosmos-panel-collapsed';

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
export function initPanelCollapse(panelId, { defaultCollapsed = false } = {}) {
  const panel = document.getElementById(panelId);
  if (!panel || panel.dataset.collapseInit) return;
  panel.dataset.collapseInit = '1';

  const state = loadState();
  const collapsed = state[panelId] ?? defaultCollapsed;

  const header = document.createElement('div');
  header.className = 'panel-header';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'panel-toggle';
  toggle.setAttribute('aria-label', 'Minimizar panel');
  toggle.textContent = collapsed ? '▲' : '▼';

  const body = document.createElement('div');
  body.className = 'panel-body';
  while (panel.firstChild) body.appendChild(panel.firstChild);
  panel.appendChild(header);
  panel.appendChild(body);
  header.appendChild(toggle);

  function setCollapsed(v) {
    panel.classList.toggle('panel-collapsed', v);
    toggle.textContent = v ? '▲' : '▼';
    state[panelId] = v;
    saveState(state);
  }

  setCollapsed(collapsed);
  toggle.addEventListener('click', () => setCollapsed(!panel.classList.contains('panel-collapsed')));
}
