import GUI from 'lil-gui';
import { HORIZON_THEORIES, PROBE_STATE, THEORY_IDS } from '../simulation/horizon-theories.js';

function theoryPrefix(theory) {
  if (theory.fiction) return '★★ ';
  if (theory.original || theory.speculative) return '★ ';
  return '';
}

const theoryOptions = {};
for (const id of THEORY_IDS) {
  const t = HORIZON_THEORIES[id];
  theoryOptions[`${theoryPrefix(t)}${t.name}`] = id;
}

function theoryNameById(id) {
  const t = HORIZON_THEORIES[id];
  return `${theoryPrefix(t)}${t.name}`;
}

export function createHorizonControls(simulator, callbacks = {}) {
  const gui = new GUI({ title: 'Horizonte de Sucesos' });
  const folder = gui.addFolder('Cruce del horizonte');

  const params = {
    theory: theoryNameById(simulator.theoryId),
    launch: () => {
      simulator.launchProbe();
      callbacks.onLaunch?.();
    },
    reset: () => {
      simulator.reset();
      callbacks.onReset?.();
    },
  };

  folder
    .add(params, 'theory', Object.keys(theoryOptions))
    .name('Teoría del otro lado')
    .onChange((name) => {
      const id = theoryOptions[name];
      simulator.setTheory(id);
      callbacks.onTheoryChange?.(id);
    });

  folder.add(params, 'launch').name('▶ Enviar sonda');
  folder.add(params, 'reset').name('↺ Reiniciar sonda');
  folder.open();

  return gui;
}

export function updateTheoryPanel(simulator, simContext) {
  const panel = document.getElementById('theory-panel');
  if (!panel) return;

  const theory = simulator.theory;
  const stateLabels = {
    [PROBE_STATE.IDLE]: 'En espera',
    [PROBE_STATE.APPROACHING]: 'Aproximándose al horizonte',
    [PROBE_STATE.CROSSING]: '¡Cruzando el horizonte!',
    [PROBE_STATE.INSIDE]: 'En el interior',
  };

  const dilation =
    simulator.effectiveTimeDilation > 0.01
      ? `${(simulator.effectiveTimeDilation * 100).toFixed(1)}%`
      : '≈ 0% (congelado)';

  const originalBadge = theory.original
    ? '<span class="theory-original">Teoría derivada de esta simulación</span>'
    : '';
  const speculativeBadge = theory.speculative
    ? '<span class="theory-original">Especulativa ★</span>'
    : '';
  const fictionBadge = theory.fiction
    ? '<span class="theory-original">Ficción científica ★★</span>'
    : '';

  let theoryReadoutsHtml = '';
  if (theory.computeReadouts && simContext) {
    const readoutData = theory.computeReadouts(simContext);
    if (readoutData?.rows?.length) {
      const rows = readoutData.rows
        .map(
          (row) =>
            `<div><strong>${row.label}:</strong> ${row.value}${row.unit ? ` ${row.unit}` : ''}</div>`
        )
        .join('');
      theoryReadoutsHtml = `
        <div class="theory-readouts">
          <h3>Lecturas de la teoría</h3>
          ${rows}
        </div>`;
    }
    if (theory.physicsBasis) {
      theoryReadoutsHtml += `<p class="theory-physics"><strong>Base física:</strong> ${theory.physicsBasis}</p>`;
    }
  }

  panel.innerHTML = `
    <h2>${theory.name}</h2>
    <span class="theory-status">${theory.status}</span>
    ${originalBadge}
    ${speculativeBadge}
    ${fictionBadge}
    <p class="theory-short">${theory.short}</p>
    <p class="theory-desc">${theory.description}</p>
    ${theoryReadoutsHtml}
    <div class="probe-readouts">
      <div><strong>Inmersión:</strong> ${simulator.immersionLabel}</div>
      <div><strong>Estado sonda:</strong> ${stateLabels[simulator.probeState]}</div>
      <div><strong>Dilatación temporal:</strong> ${dilation}</div>
      <div><strong>Progreso cruce:</strong> ${(Math.max(simulator.crossingProgress, simulator.cameraCrossingProgress) * 100).toFixed(0)}%</div>
      <div><strong>Dist. cámara al horizonte:</strong> ${Math.max(0, simulator.cameraRadius - simulator.rs).toFixed(2)} u.vis</div>
      <div><strong>Interior visible:</strong> ${(simulator.interiorOpacity * 100).toFixed(0)}%</div>
    </div>
    <p class="theory-hint">💡 Haz zoom hacia el agujero negro para activar la teoría sin usar la sonda.</p>
  `;
}

export function updateHud(readouts) {
  const el = document.getElementById('hud-readouts');
  if (!el) return;

  const dcMpc = readouts.dc / 3.086e22;

  el.innerHTML = `
    <div class="hud-row"><span>a(t)</span><span>${readouts.a.toFixed(6)}</span></div>
    <div class="hud-row"><span>z</span><span>${readouts.z.toFixed(6)}</span></div>
    <div class="hud-row"><span>H(t)</span><span>${readouts.H.toFixed(2)} km/s/Mpc</span></div>
    <div class="hud-row"><span>rₛ</span><span>${readouts.rs.toFixed(2)} u · ${readouts.rsMeters.toExponential(2)} m</span></div>
    <div class="hud-row"><span>d_c</span><span>${dcMpc < 0.001 ? dcMpc.toExponential(2) : dcMpc.toFixed(3)} Mpc</span></div>
  `;
}
