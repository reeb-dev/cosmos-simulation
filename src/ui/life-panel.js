import { t, getBundle } from '../i18n/i18n.js';

const DEFAULT_CAMERA = { x: 0, y: 40, z: 120, tx: 0, ty: 0, tz: 0 };

export function createCameraLife(controls, camera) {
  let idleTime = 0;
  let enabled = true;
  const breath = { angle: 0, radius: 120, height: 40 };

  controls.addEventListener('start', () => {
    idleTime = 0;
  });

  function setEnabled(v) {
    enabled = v;
    if (!v) idleTime = 0;
  }

  function resetIdle() {
    idleTime = 0;
  }

  function resetCamera(cam = camera, ctrl = controls) {
    cam.position.set(DEFAULT_CAMERA.x, DEFAULT_CAMERA.y, DEFAULT_CAMERA.z);
    ctrl.target.set(DEFAULT_CAMERA.tx, DEFAULT_CAMERA.ty, DEFAULT_CAMERA.tz);
    ctrl.update();
    idleTime = 0;
  }

  function update(dt, vitality) {
    if (!enabled) return;
    idleTime += dt;
    if (idleTime < 8) return;

    breath.angle += dt * (0.08 + vitality * 0.06);
    const r = breath.radius + Math.sin(breath.angle * 0.7) * 15;
    const h = breath.height + Math.cos(breath.angle * 0.5) * 12;

    camera.position.x = Math.cos(breath.angle) * r;
    camera.position.z = Math.sin(breath.angle) * r;
    camera.position.y = h;
    controls.target.set(Math.sin(breath.angle * 0.3) * 2, Math.cos(breath.angle * 0.2) * 1, 0);
  }

  return { update, resetIdle, resetCamera, setEnabled };
}

function getPhaseLabels() {
  return getBundle('panels.life.phases') ?? {};
}

export function updateLifePanel(lifeEngine, binarySim = null, isBinary = false) {
  const el = document.getElementById('life-panel');
  if (!el) return;
  const body = el.querySelector('.panel-body') || el;

  if (isBinary && binarySim) {
    const eventsHtml = binarySim.events.slice(0, 5).map((e) => `<div class="life-event">${e.text}</div>`).join('')
      || `<div class="life-event dim">${t('panels.life.waitingBinary')}</div>`;
    const r = binarySim.getReadouts();
    body.innerHTML = `
      <div class="life-header">
        <span class="life-phase">⚫ ${r.phase}</span>
        <span class="life-age">M₁=${r.m1} M₂=${r.m2} M☉</span>
      </div>
      <div class="life-pulse">〰 Strain GW ${(r.strain * 100).toFixed(0)}% · f=${r.frequency.toExponential(1)} Hz</div>
      <div class="life-events">${eventsHtml}</div>
    `;
    return;
  }

  const phaseLabels = getPhaseLabels();
  const pulseBar = '█'.repeat(Math.floor(lifeEngine.pulse * 10)) + '░'.repeat(10 - Math.floor(lifeEngine.pulse * 10));
  const eventsHtml = lifeEngine.events.slice(0, 5).map((e) => `<div class="life-event">${e.text}</div>`).join('')
    || `<div class="life-event dim">${t('panels.life.awakening')}</div>`;

  body.innerHTML = `
    <div class="life-header">
      <span class="life-phase">${phaseLabels[lifeEngine.phase] ?? lifeEngine.phase}</span>
      <span class="life-age">${lifeEngine.enabled ? '' : '⏸ '}${formatAge(lifeEngine.age)}</span>
    </div>
    <div class="life-pulse">♥ [${pulseBar}] ${(lifeEngine.vitality * 100).toFixed(0)}%</div>
    <div class="life-events">${eventsHtml}</div>
  `;
}

function formatAge(s) {
  if (s < 60) return `${s.toFixed(0)}s`;
  if (s < 3600) return `${(s / 60).toFixed(1)}min`;
  return `${(s / 3600).toFixed(1)}h`;
}
