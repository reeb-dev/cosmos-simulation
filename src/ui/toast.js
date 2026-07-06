/** Toast breve centrado arriba */
export function showToast(msg, duration = 2600) {
  const el = document.getElementById('app-toast') ?? document.getElementById('reset-toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('visible');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('visible'), duration);
}
