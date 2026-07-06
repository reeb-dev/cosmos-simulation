import { getLocale, setLocale, onLocaleChange } from './i18n.js';
import { applyStaticUi } from './static-ui.js';

export function createLangToggle(onChange) {
  let btn = document.getElementById('lang-toggle');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'lang-toggle';
    btn.type = 'button';
    const toolbar = document.getElementById('top-toolbar');
    if (toolbar) {
      toolbar.insertBefore(btn, toolbar.firstChild);
    } else {
      document.body.appendChild(btn);
    }
  }

  btn.addEventListener('click', async () => {
    const next = getLocale() === 'es' ? 'en' : 'es';
    await setLocale(next);
  });

  onLocaleChange((loc) => {
    applyStaticUi();
    btn.textContent = loc === 'es' ? 'ES | EN' : 'EN | ES';
    btn.setAttribute('aria-label', loc === 'es' ? 'Switch to English' : 'Cambiar a español');
    onChange?.(loc);
  });

  applyStaticUi();
  btn.textContent = getLocale() === 'es' ? 'ES | EN' : 'EN | ES';
  return btn;
}
