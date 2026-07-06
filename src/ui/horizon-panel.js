import GUI from 'lil-gui';
import { HORIZON_THEORIES, PROBE_STATE, THEORY_IDS } from '../simulation/horizon-theories.js';
import { getMode } from '../simulation/simulation-modes.js';

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

export function updateTheoryPanel(simulator, simContext, modeManager, higgsScene, binarySim = null) {
  const panel = document.getElementById('theory-panel');
  if (!panel) return;

  const mode = modeManager ? getMode(modeManager.currentMode) : null;

  if (mode?.id === 'binary_merger' && binarySim) {
    const r = binarySim.getReadouts();
    const eventsHtml = binarySim.events.slice(0, 4).map((e) => `<div class="life-event">${e.text}</div>`).join('')
      || '<div class="life-event dim">Configura masas y pulsa «Iniciar colisión»</div>';
    const body = panel.querySelector('.panel-body') || panel;
    body.innerHTML = `
      <h2>Choque de agujeros negros</h2>
      <span class="theory-status">${r.phase}</span>
      <p class="theory-short">Dos agujeros negros en espiral perdiendo energía por ondas gravitacionales (Peters).</p>
      <p class="theory-desc">Al fusionarse, ~5% de la masa se irradia. El remanente oscila (ringdown) y, si está activo, se evapora por Hawking (acelerado visualmente).</p>
      <div class="theory-readouts">
        <h3>Sistema binario</h3>
        <div><strong>M₁ / M₂:</strong> ${r.m1} / ${r.m2} M☉</div>
        <div><strong>Separación:</strong> ${r.separation.toFixed(1)} u.vis</div>
        <div><strong>Strain h:</strong> ${r.strain.toExponential(2)}</div>
        <div><strong>f<sub>GW</sub>:</strong> ${r.frequency.toFixed(1)} Hz (chirp)</div>
        <div><strong>E<sub>rad</sub>:</strong> ${r.energyRadiated.toExponential(2)} J</div>
        ${r.merged > 0 ? `<div><strong>M fusionado:</strong> ${r.merged.toFixed(1)} M☉</div>` : ''}
        ${r.evapPct > 0 ? `<div><strong>Evaporación:</strong> ${r.evapPct.toFixed(0)}%</div>` : ''}
        <div><strong>T Hawking:</strong> ${r.hawkingT.toExponential(2)} K</div>
      </div>
      <div class="life-events">${eventsHtml}</div>
      <p class="theory-hint">💡 Observa los anillos azul-blancos expansivos desde el baricentro. En la fusión: destello dorado + pulso de memoria gravitacional.</p>
    `;
    return;
  }

  if (mode?.id === 'higgs' && higgsScene) {
    const readoutData = higgsScene.getReadouts();
    const rows = readoutData.rows
      .map((row) => `<div><strong>${row.label}:</strong> ${row.value}${row.unit ? ` ${row.unit}` : ''}</div>`)
      .join('');
    panel.querySelector('.panel-body')?.replaceChildren?.() ||
      (panel.innerHTML = '');
    const body = panel.querySelector('.panel-body') || panel;
    body.innerHTML = `
      <h2>Partícula de Higgs</h2>
      <span class="theory-status">Campo escalar · mecanismo de Higgs</span>
      <p class="theory-short">El bosón de Higgs imparte masa a las partículas mediante el acoplamiento al campo φ.</p>
      <p class="theory-desc">Visualización educativa abstracta: no replica datos exactos del LHC, sino el concepto del valor esperado del vacío ⟨φ⟩ y la generación de masa en fermiones.</p>
      <div class="theory-readouts"><h3>Lecturas simbólicas</h3>${rows}</div>
      <p class="theory-hint">💡 Observa cómo los fermiones se acercan al núcleo dorado y ganan masa.</p>
    `;
    return;
  }

  if (mode?.id === 'multiverse') {
    const { universe } = simContext;
    const { OmegaM, OmegaLambda } = universe.cosmology;
    const ratio = OmegaLambda > 0 ? OmegaM / OmegaLambda : Infinity;
    const body = panel.querySelector('.panel-body') || panel;
    body.innerHTML = `
      <h2>Multiverso Ω</h2>
      <span class="theory-status">Escena completa · burbujas de Friedmann</span>
      <p class="theory-short">Cada burbuja es un universo con distinto par Ωₘ/ΩΛ.</p>
      <p class="theory-desc">Navega por un vacío lleno de universos-burbuja que se expanden, colisionan y nuclean. Las ramas coloreadas reflejan la interpretación de muchos mundos según tu cosmología simulada.</p>
      <div class="theory-readouts">
        <h3>Cosmología activa</h3>
        <div><strong>Ωₘ:</strong> ${OmegaM.toFixed(3)}</div>
        <div><strong>ΩΛ:</strong> ${OmegaLambda.toFixed(3)}</div>
        <div><strong>Ωₘ/ΩΛ:</strong> ${Number.isFinite(ratio) ? ratio.toFixed(3) : '∞'}</div>
        <div><strong>Burbujas:</strong> ~70+ activas</div>
      </div>
      <p class="theory-hint">💡 Vuela hacia el portal central para atravesar las ramas bifurcadas.</p>
    `;
    return;
  }

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

  panel.querySelector('.panel-body')?.replaceChildren?.();
  const body = panel.querySelector('.panel-body') || panel;
  body.innerHTML = `
    <h2>${theory.name}</h2>
    <span class="theory-status">${theory.status}</span>
    ${originalBadge}
    ${speculativeBadge}
    ${fictionBadge}
    <p class="theory-short">${theory.short}</p>
    <p class="theory-desc">${theory.description}</p>
    <p class="theory-crossing"><strong>Qué verás al cruzar:</strong> ${theory.horizonVisual?.crossingDescription ?? 'El horizonte se disuelve en un interior teórico distinto según la teoría elegida.'}</p>
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

export function updateHud(readouts, modeManager, binaryReadouts = null) {
  const el = document.getElementById('hud-readouts');
  if (!el) return;

  if (binaryReadouts && modeManager?.currentMode === 'binary_merger') {
    el.innerHTML = `
      <div class="hud-row"><span>Fase</span><span>${binaryReadouts.phase}</span></div>
      <div class="hud-row"><span>M₁ / M₂</span><span>${binaryReadouts.m1} / ${binaryReadouts.m2} M☉</span></div>
      <div class="hud-row"><span>Separación</span><span>${binaryReadouts.separation.toFixed(1)} u</span></div>
      <div class="hud-row"><span>h (strain)</span><span>${binaryReadouts.strain.toExponential(2)}</span></div>
      <div class="hud-row"><span>f<sub>GW</sub></span><span>${binaryReadouts.frequency.toFixed(1)} Hz</span></div>
      <div class="hud-row"><span>E<sub>rad</sub></span><span>${binaryReadouts.energyRadiated.toExponential(2)} J</span></div>
    `;
    return;
  }

  const dcMpc = readouts.dc / 3.086e22;

  el.innerHTML = `
    <div class="hud-row"><span>a(t)</span><span>${readouts.a.toFixed(6)}</span></div>
    <div class="hud-row"><span>z</span><span>${readouts.z.toFixed(6)}</span></div>
    <div class="hud-row"><span>H(t)</span><span>${readouts.H.toFixed(2)} km/s/Mpc</span></div>
    <div class="hud-row"><span>rₛ</span><span>${readouts.rs.toFixed(2)} u · ${readouts.rsMeters.toExponential(2)} m</span></div>
    <div class="hud-row"><span>d_c</span><span>${dcMpc < 0.001 ? dcMpc.toExponential(2) : dcMpc.toFixed(3)} Mpc</span></div>
  `;
}

export function updateModePanel(modeManager) {
  if (!modeManager) return;
  modeManager.updateHudLabel();
}
