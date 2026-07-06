import { t, getBundle } from '../i18n/i18n.js';
import { getModeExplanation, getTheorySummary } from '../data/simulation-explanations.js';

const STORAGE_PREFIX = 'explained_';
const AUTO_EXPAND_MS = 5000;

function renderFaq(faq) {
  if (!faq?.length) return '';
  return `
    <div class="mode-explainer-faq">
      <h4>${t('explainer.sections.faq')}</h4>
      ${faq.map((item) => `
        <details class="mode-faq-item">
          <summary>${item.q}</summary>
          <p>${item.a}</p>
        </details>
      `).join('')}
    </div>`;
}

function renderTheoryBlock(theoryId) {
  const summary = getTheorySummary(theoryId);
  if (!theoryId || !summary) return '';
  return `
    <div class="mode-explainer-theory">
      <h4>${t('explainer.sections.activeTheory')}</h4>
      <p>${summary}</p>
    </div>`;
}

function renderContent(modeId, theoryId = null) {
  const data = getModeExplanation(modeId);
  if (!data) return `<p class="mode-explainer-empty">${t('explainer.empty')}</p>`;

  const theoryBlock =
    data.showTheorySummaries || modeId === 'theory_picker'
      ? renderTheoryBlock(theoryId)
      : '';

  return `
    <p class="mode-explainer-adaptive-hint">${t('explainer.adaptiveHint')}</p>
    <div class="mode-explainer-intro">${data.intro}</div>
    <div class="mode-explainer-section">
      <h4>${t('explainer.sections.physics')}</h4>
      <div>${data.physics}</div>
    </div>
    <div class="mode-explainer-section">
      <h4>${t('explainer.sections.controls')}</h4>
      <div>${data.controls}</div>
    </div>
    <div class="mode-explainer-section">
      <h4>${t('explainer.sections.watch')}</h4>
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
    const data = getModeExplanation(currentMode);
    if (titleEl) {
      titleEl.textContent = data?.title ?? currentMode;
      titleEl.dataset.modeTitle = '1';
    }
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

  function refresh() {
    updateContent();
  }

  toggleBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    setCollapsed(!collapsed);
    if (currentMode) dismissFirstVisit(currentMode);
  });

  dismissBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    hide();
    if (currentMode) dismissFirstVisit(currentMode);
  });

  function hide() {
    panel.classList.remove('visible');
    clearAutoExpand();
  }

  panel.addEventListener('click', () => {
    if (collapsed) setCollapsed(false);
  });

  return {
    showMode,
    updateTheory,
    setCollapsed,
    refresh,
    hide,
    toggle: () => {
      if (!panel.classList.contains('visible')) {
        if (currentMode) {
          panel.classList.add('visible');
          setCollapsed(false);
        }
        return;
      }
      setCollapsed(!collapsed);
    },
    get currentMode() {
      return currentMode;
    },
  };
}

/** Resumen de teoría para el panel del horizonte */
export function getTheorySummaryHtml(theoryId) {
  const summary = getTheorySummary(theoryId);
  if (!summary) return '';
  return `
    <details class="theory-more-info">
      <summary>${t('explainer.moreInfo')}</summary>
      <p class="theory-summary-text">${summary}</p>
    </details>`;
}
