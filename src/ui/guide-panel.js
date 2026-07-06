import { t, getBundle } from '../i18n/i18n.js';

function getSections() {
  return getBundle('guide.sections') ?? [];
}

function renderSections(openId) {
  return getSections().map((s) => {
    const open = s.id === openId;
    return `
      <details class="guide-section" ${open ? 'open' : ''} data-id="${s.id}">
        <summary class="guide-section-title">
          <span class="guide-icon">${s.icon}</span>
          ${s.title}
        </summary>
        <div class="guide-section-body">${s.body}</div>
      </details>
    `;
  }).join('');
}

export function createGuidePanel() {
  const btn = document.getElementById('guide-toggle');
  const panel = document.getElementById('guide-panel');
  const content = document.getElementById('guide-content');
  const backdrop = document.getElementById('guide-backdrop');
  if (!btn || !panel || !content) return;

  let openId = 'motor';

  function renderContent() {
    content.innerHTML = renderSections(openId);
  }

  renderContent();

  content.addEventListener('toggle', (e) => {
    const details = e.target;
    if (details.tagName !== 'DETAILS' || !details.open) return;
    openId = details.dataset.id;
    for (const el of content.querySelectorAll('.guide-section')) {
      if (el !== details) el.open = false;
    }
  }, true);

  function setOpen(open) {
    panel.classList.toggle('open', open);
    backdrop?.classList.toggle('visible', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? t('guide.close') : t('guide.toggle');
  }

  btn.addEventListener('click', () => setOpen(!panel.classList.contains('open')));
  backdrop?.addEventListener('click', () => setOpen(false));

  return {
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle: () => setOpen(!panel.classList.contains('open')),
    refresh: renderContent,
  };
}
