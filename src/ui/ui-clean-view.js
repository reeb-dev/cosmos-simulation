import { t } from '../i18n/i18n.js';
import { setPanelCollapsed } from './panel-collapse.js';
import { showToast } from './toast.js';

const STORAGE_KEY = 'cosmos-ui-clean-v2';
const PANEL_IDS = ['lab-panel', 'theory-panel', 'research-panel', 'life-panel'];

function loadCleanPreference() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return false;
    return raw === '1';
  } catch {
    return false;
  }
}

function saveCleanPreference(clean) {
  try {
    localStorage.setItem(STORAGE_KEY, clean ? '1' : '0');
  } catch { /* ignore */ }
}

function applyPanelState(clean) {
  for (const id of PANEL_IDS) {
    setPanelCollapsed(id, clean, { persist: !clean });
  }
}

/** Inicializa vista limpia (3D + dock + mode picker + GUI). Tecla V para alternar. */
export function initCleanView() {
  let clean = loadCleanPreference();
  const body = document.body;

  function apply(cleanView) {
    clean = cleanView;
    body.classList.toggle('ui-clean', clean);
    if (clean) {
      applyPanelState(true);
    } else {
      setPanelCollapsed('research-panel', false, { persist: true });
    }
    saveCleanPreference(clean);
  }

  apply(clean);

  function toggle() {
    apply(!clean);
    showToast(clean ? t('ux.cleanViewOn') : t('ux.cleanViewOff'));
    return clean;
  }

  return {
    isClean: () => clean,
    toggle,
    setClean: (v) => apply(!!v),
  };
}
