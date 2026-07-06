import { t, getBundle } from './i18n.js';

export function applyStaticUi() {
  const meta = getBundle('meta') ?? {};
  document.title = meta.title ?? document.title;

  const desc = document.querySelector('meta[name="description"]');
  if (desc && meta.description) desc.content = meta.description;
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle && meta.ogTitle) ogTitle.content = meta.ogTitle;
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc && meta.ogDescription) ogDesc.content = meta.ogDescription;

  const hudTitle = document.querySelector('#hud h1');
  if (hudTitle) hudTitle.textContent = t('hud.title');
  const tagline = document.querySelector('#hud .hud-tagline');
  if (tagline) tagline.textContent = t('hud.tagline');

  const helpBar = document.getElementById('help-bar');
  if (helpBar) helpBar.innerHTML = t('helpBar');

  const modePickerLabel = document.getElementById('mode-picker-label');
  if (modePickerLabel) modePickerLabel.textContent = t('hud.modeLabel').replace(':', '');
  const modePresetLabel = document.getElementById('mode-preset-label');
  if (modePresetLabel) modePresetLabel.textContent = t('hud.presetLabel');

  const guideToggle = document.getElementById('guide-toggle');
  const guidePanel = document.getElementById('guide-panel');
  if (guidePanel) {
    const h2 = guidePanel.querySelector('.guide-header h2');
    const p = guidePanel.querySelector('.guide-header p');
    if (h2) h2.textContent = t('guide.headerTitle');
    if (p) p.textContent = t('guide.headerDesc');
  }
  if (guideToggle && !guidePanel?.classList.contains('open')) {
    guideToggle.textContent = t('guide.toggle');
  }

  const explainerTitle = document.getElementById('mode-explainer-title');
  if (explainerTitle && !explainerTitle.dataset.modeTitle) {
    explainerTitle.textContent = t('explainer.activeMode');
  }
  const dismiss = document.getElementById('mode-explainer-dismiss');
  if (dismiss) dismiss.title = t('explainer.close');
  const explainerToggle = document.getElementById('mode-explainer-toggle');
  if (explainerToggle) {
    explainerToggle.title = t('explainer.expand');
    explainerToggle.setAttribute('aria-label', t('explainer.expand'));
  }

  const langBtn = document.getElementById('lang-toggle');
  if (langBtn) {
    langBtn.textContent = t('lang.toggle');
    langBtn.title = t('lang.switchHint');
  }
}
