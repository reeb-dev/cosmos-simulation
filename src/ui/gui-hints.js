import { t } from '../i18n/i18n.js';

/** Fila de ayuda no editable en lil-gui */
export function addGuiHint(folder, textKey) {
  const hint = { info: t(textKey) };
  const ctrl = folder.add(hint, 'info').name('ℹ️');
  ctrl.disable();
  if (ctrl.domElement) {
    const input = ctrl.domElement.querySelector('input, .controller');
    if (input) {
      input.style.whiteSpace = 'normal';
      input.style.lineHeight = '1.35';
      input.style.fontSize = '10px';
      input.style.opacity = '0.85';
    }
  }
  return ctrl;
}

export function refreshGuiHint(ctrl, textKey) {
  if (!ctrl) return;
  ctrl.object.info = t(textKey);
  ctrl.updateDisplay?.();
}
