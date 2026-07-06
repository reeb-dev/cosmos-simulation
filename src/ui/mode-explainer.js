import { MODE_EXPLANATIONS, THEORY_SUMMARIES } from '../data/simulation-explanations.js';

const STORAGE_PREFIX = 'explained_';
const AUTO_EXPAND_MS = 5000;

function renderFaq(faq) {
  if (!faq?.length) return '';
  return `
    <div class="mode-explainer-faq">
      <h4>Preguntas frecuentes</h4>
      ${faq.map((item) => `
        <details class="mode-faq-item">
          <summary>${item.q}</summary>
          <p>${item.a}</p>
        </details>
      `).join('')}
    </div>`;
}

function renderTheoryBlock(theoryId) {
  if (!theoryId || !THEORY_SUMMARIES[theoryId]) return '';
  return `
    <div class="mode-explainer-theory">
      <h4>ℹ️ Teoría activa</h4>
      <p>${THEORY_SUMMARIES[theoryId]}</p>
    </div>`;
}

function renderContent(modeId, theoryId = null) {
  const data = MODE_EXPLANATIONS[modeId];
  if (!data) return '<p class="mode-explainer-empty">Sin explicación para este modo.</p>';

  const theoryBlock =
    data.showTheorySummaries || modeId === 'theory_picker'
      ? renderTheoryBlock(theoryId)
      : '';

  return `
    <p class="mode-explainer-adaptive-hint">💡 El panel <strong>Controles</strong> (derecha) muestra solo los ajustes relevantes para esta escena.</p>
    <div class="mode-explainer-intro">${data.intro}</div>
    <div class="mode-explainer-section">
      <h4>⚛️ Física detrás</h4>
      <div>${data.physics}</div>
    </div>
    <div class="mode-explainer-section">
      <h4>🎛️ Controles</h4>
      <div>${data.controls}</div>
    </div>
    <div class="mode-explainer-section">
      <h4>👁️ Qué ver en pantalla</h4>
      <div>${data.whatToWatch}</div>
    </div>
    ${theoryBlock}
    ${renderFaq(data.faq)}
  `;
}

export function createModeExplainer() {
  const panel = document.getElementById('mode-explainer');
  const titleEl = document.getElementById('mode-explainer-title');
  const iconEl = document.getElementById('mode-explainer-icon');
  const bodyEl = document.getElementById('mode-explainer-body');
  const toggleBtn = document.getElementById('mode-explainer-toggle');
  const dismissBtn = document.getElementById('mode-explainer-dismiss');
  if (!panel || !bodyEl) return null;

  let currentMode = null;
  let currentTheory = null;
  let autoExpandTimer = null;
  let collapsed = false;

  function setCollapsed(value) {
    collapsed = value;
    panel.classList.toggle('collapsed', collapsed);
    if (toggleBtn) toggleBtn.textContent = collapsed ? '▲' : '▼';
    panel.setAttribute('aria-expanded', String(!collapsed));
  }

  function clearAutoExpand() {
    if (autoExpandTimer) {
      clearTimeout(autoExpandTimer);
      autoExpandTimer = null;
    }
  }

  function dismissFirstVisit(modeId) {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${modeId}`, '1');
    } catch {
      /* ignore */
    }
    clearAutoExpand();
  }

  function updateContent() {
    if (!currentMode) return;
    const data = MODE_EXPLANATIONS[currentMode];
    if (titleEl) titleEl.textContent = data?.title ?? currentMode;
    if (iconEl) iconEl.textContent = data?.icon ?? 'ℹ️';
    bodyEl.innerHTML = renderContent(currentMode, currentTheory);
  }

  function showMode(modeId, theoryId = null, { forceExpand = false } = {}) {
    currentMode = modeId;
    currentTheory = theoryId;
    updateContent();
    panel.classList.add('visible');

    const isFirstVisit = (() => {
      try {
        return !localStorage.getItem(`${STORAGE_PREFIX}${modeId}`);
      } catch {
        return false;
      }
    })();

    clearAutoExpand();

    if (isFirstVisit || forceExpand) {
      setCollapsed(false);
      autoExpandTimer = setTimeout(() => {
        if (!localStorage.getItem(`${STORAGE_PREFIX}${modeId}`)) {
          setCollapsed(true);
        }
        dismissFirstVisit(modeId);
      }, AUTO_EXPAND_MS);
    }
  }

  function updateTheory(theoryId) {
    currentTheory = theoryId;
    if (currentMode === 'theory_picker' || currentMode === 'black_hole') {
      updateContent();
    }
  }

  toggleBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    setCollapsed(!collapsed);
    if (currentMode) dismissFirstVisit(currentMode);
  });

  dismissBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    setCollapsed(true);
    if (currentMode) dismissFirstVisit(currentMode);
  });

  panel.addEventListener('click', () => {
    if (collapsed) setCollapsed(false);
  });

  return {
    showMode,
    updateTheory,
    setCollapsed,
    toggle: () => setCollapsed(!collapsed),
    get currentMode() {
      return currentMode;
    },
  };
}

/** Resumen de teoría para el panel del horizonte */
export function getTheorySummaryHtml(theoryId) {
  const summary = THEORY_SUMMARIES[theoryId];
  if (!summary) return '';
  return `
    <details class="theory-more-info">
      <summary>ℹ️ Más info</summary>
      <p class="theory-summary-text">${summary}</p>
    </details>`;
}
