import GUI from 'lil-gui';
import { t } from '../i18n/i18n.js';
import { theoryPrefix, getTheory, getTheoryName } from '../i18n/theory-i18n.js';
import { HORIZON_THEORIES, PROBE_STATE } from '../simulation/horizon-theories.js';
import { getMode } from '../simulation/simulation-modes.js';
import { getTheorySummaryHtml } from './mode-explainer.js';

export function createHorizonControls(simulator, callbacks = {}) {
  const gui = new GUI({ title: t('gui.horizon') });
  const folder = gui.addFolder(t('gui.horizon'));

  const params = {
    theory: getTheoryName(simulator.theoryId),
    launch: () => {
      simulator.launchProbe();
      callbacks.onLaunch?.();
    },
    reset: () => {
      simulator.reset();
      callbacks.onReset?.();
    },
  };

  folder.add(params, 'theory', [getTheoryName(simulator.theoryId)])
    .name(t('gui.theory'))
    .onChange(() => {});

  folder.add(params, 'launch').name(t('gui.launchProbe'));
  folder.add(params, 'reset').name(t('gui.resetProbe'));
  folder.open();

  return gui;
}

function setPanelTitle(panel, title) {
  const titleEl = panel?.querySelector('.panel-title');
  if (titleEl && title) titleEl.textContent = title;
}

function probeStateLabel(state) {
  const map = {
    [PROBE_STATE.IDLE]: t('probe.states.idle'),
    [PROBE_STATE.APPROACHING]: t('probe.states.approaching'),
    [PROBE_STATE.CROSSING]: t('probe.states.crossing'),
    [PROBE_STATE.INSIDE]: t('probe.states.inside'),
  };
  return map[state] ?? state;
}

export function updateTheoryPanel(simulator, simContext, modeManager, higgsScene, binarySim = null, stringScene = null) {
  const panel = document.getElementById('theory-panel');
  if (!panel) return;

  const mode = modeManager ? getMode(modeManager.currentMode) : null;

  if (mode?.id === 'binary_merger' && binarySim) {
    const r = binarySim.getReadouts();
    const eventsHtml = binarySim.events.slice(0, 4).map((e) => `<div class="life-event">${e.text}</div>`).join('')
      || `<div class="life-event dim">${t('panels.theory.binary.waiting')}</div>`;
    const body = panel.querySelector('.panel-body') || panel;
    body.innerHTML = `
      <span class="theory-status">${r.phase}</span>
      <p class="theory-short">${t('panels.theory.binary.short')}</p>
      <p class="theory-desc">${t('panels.theory.binary.desc')}</p>
      <div class="theory-readouts">
        <h3>${t('panels.theory.binary.system')}</h3>
        <div><strong>M₁ / M₂:</strong> ${r.m1} / ${r.m2} M☉</div>
        <div><strong>μ:</strong> ${r.mu?.toFixed(2) ?? '—'} M☉</div>
        <div><strong>ℳ chirp:</strong> ${r.chirpMass?.toFixed(2) ?? '—'} M☉</div>
        <div><strong>${t('gui.separation')}:</strong> ${r.separation.toFixed(1)} u.vis</div>
        <div><strong>Strain h:</strong> ${r.strain.toExponential(2)}</div>
        <div><strong>f<sub>GW</sub>:</strong> ${r.frequency.toFixed(1)} Hz (chirp)</div>
        <div><strong>E<sub>rad</sub>:</strong> ${r.energyRadiated.toExponential(2)} J</div>
        ${r.merged > 0 ? `<div><strong>M fusionado:</strong> ${r.merged.toFixed(1)} M☉</div>` : ''}
        ${r.peakStrain > 0 ? `<div><strong>h<sub>pico</sub>:</strong> ${r.peakStrain.toExponential(2)}</div>` : ''}
        ${r.evapPct > 0 ? `<div><strong>Evaporación:</strong> ${r.evapPct.toFixed(0)}%</div>` : ''}
        <div><strong>T Hawking:</strong> ${r.hawkingT.toExponential(2)} K</div>
      </div>
      <div class="life-events">${eventsHtml}</div>
      <p class="theory-hint">${t('panels.theory.binary.hint')}</p>
    `;
    setPanelTitle(panel, t('panels.theory.binary.title'));
    return;
  }

  if (mode?.id === 'higgs' && higgsScene) {
    const readoutData = higgsScene.getReadouts();
    const rows = readoutData.rows
      .map((row) => `<div><strong>${row.label}:</strong> ${row.value}${row.unit ? ` ${row.unit}` : ''}</div>`)
      .join('');
    const body = panel.querySelector('.panel-body') || panel;
    body.innerHTML = `
      <span class="theory-status">${t('panels.theory.higgs.status')}</span>
      <p class="theory-short">${t('panels.theory.higgs.short')}</p>
      <p class="theory-desc">${t('panels.theory.higgs.desc')}</p>
      <div class="theory-readouts"><h3>${t('panels.theory.higgs.readouts')}</h3>${rows}</div>
      <p class="theory-hint">${t('panels.theory.higgs.hint')}</p>
    `;
    setPanelTitle(panel, t('panels.theory.higgs.title'));
    return;
  }

  if (mode?.id === 'string_theory' && stringScene) {
    const theory = getTheory('string_theory');
    const readoutData = stringScene.getReadouts();
    const rows = readoutData.rows
      .map((row) => `<div><strong>${row.label}:</strong> ${row.value}${row.unit ? ` ${row.unit}` : ''}</div>`)
      .join('');
    const body = panel.querySelector('.panel-body') || panel;
    body.innerHTML = `
      <span class="theory-status">${theory.status}</span>
      <span class="theory-original">${t('panels.theory.speculative')}</span>
      <p class="theory-short">${theory.short}</p>
      <p class="theory-desc">${t('panels.theory.strings.desc')}</p>
      <div class="theory-readouts"><h3>${t('panels.theory.strings.status')}</h3>${rows}</div>
      <p class="theory-hint">${t('panels.theory.strings.hint')}</p>
    `;
    setPanelTitle(panel, theory.name);
    return;
  }

  if (mode?.id === 'multiverse') {
    const { universe } = simContext;
    const { OmegaM, OmegaLambda } = universe.cosmology;
    const ratio = OmegaLambda > 0 ? OmegaM / OmegaLambda : Infinity;
    const body = panel.querySelector('.panel-body') || panel;
    body.innerHTML = `
      <span class="theory-status">${t('panels.theory.multiverse.status')}</span>
      <p class="theory-short">${t('panels.theory.multiverse.short')}</p>
      <p class="theory-desc">${t('panels.theory.multiverse.desc')}</p>
      <div class="theory-readouts">
        <h3>${t('panels.theory.multiverse.cosmo')}</h3>
        <div><strong>Ωₘ:</strong> ${OmegaM.toFixed(3)}</div>
        <div><strong>ΩΛ:</strong> ${OmegaLambda.toFixed(3)}</div>
        <div><strong>Ωₘ/ΩΛ:</strong> ${Number.isFinite(ratio) ? ratio.toFixed(3) : '∞'}</div>
        <div><strong>${t('panels.theory.multiverse.bubbles')}</strong> ${t('panels.theory.multiverse.bubblesCount')}</div>
      </div>
      <p class="theory-hint">${t('panels.theory.multiverse.hint')}</p>
    `;
    setPanelTitle(panel, t('panels.theory.multiverse.title'));
    return;
  }

  const theory = getTheory(simulator.theoryId);
  const baseTheory = HORIZON_THEORIES[simulator.theoryId];

  const dilation =
    simulator.effectiveTimeDilation > 0.01
      ? `${(simulator.effectiveTimeDilation * 100).toFixed(1)}%`
      : t('panels.theory.frozen');

  const originalBadge = baseTheory.original
    ? `<span class="theory-original">${t('panels.theory.original')}</span>`
    : '';
  const speculativeBadge = baseTheory.speculative && !baseTheory.physicsBreak
    ? `<span class="theory-original">${t('panels.theory.speculative')}</span>`
    : '';
  const physicsBreakBadge = baseTheory.physicsBreak
    ? `<span class="theory-physics-break">${t('panels.theory.physicsBreak')}</span>`
    : '';
  const fictionBadge = baseTheory.fiction && !baseTheory.physicsBreak
    ? `<span class="theory-original">${t('panels.theory.fiction')}</span>`
    : '';

  let theoryReadoutsHtml = '';
  if (baseTheory.computeReadouts && simContext) {
    const readoutData = baseTheory.computeReadouts(simContext);
    if (readoutData?.rows?.length) {
      const rows = readoutData.rows
        .map(
          (row) =>
            `<div><strong>${row.label}:</strong> ${row.value}${row.unit ? ` ${row.unit}` : ''}</div>`
        )
        .join('');
      theoryReadoutsHtml = `
        <div class="theory-readouts">
          <h3>${t('panels.theory.readouts')}</h3>
          ${rows}
        </div>`;
    }
    if (theory.physicsBasis) {
      theoryReadoutsHtml += `<p class="theory-physics"><strong>${t('panels.theory.physicsBasis')}</strong> ${theory.physicsBasis}</p>`;
    }
  }

  const crossingDesc = theory.horizonVisual?.crossingDescription || t('panels.theory.crossingDefault');

  panel.querySelector('.panel-body')?.replaceChildren?.();
  const body = panel.querySelector('.panel-body') || panel;
  body.innerHTML = `
    <span class="theory-status">${theory.status}</span>
    ${originalBadge}
    ${speculativeBadge}
    ${physicsBreakBadge}
    ${fictionBadge}
    <p class="theory-short">${theory.short}</p>
    <p class="theory-desc">${theory.description}</p>
    <p class="theory-crossing"><strong>${t('panels.theory.crossing')}</strong> ${crossingDesc}</p>
    ${theoryReadoutsHtml}
    <div class="probe-readouts">
      <div><strong>${t('panels.theory.immersion')}</strong> ${simulator.immersionLabel}</div>
      <div><strong>${t('panels.theory.probeState')}</strong> ${probeStateLabel(simulator.probeState)}</div>
      <div><strong>${t('panels.theory.dilation')}</strong> ${dilation}</div>
      <div><strong>${t('panels.theory.crossingProgress')}</strong> ${(Math.max(simulator.crossingProgress, simulator.cameraCrossingProgress) * 100).toFixed(0)}%</div>
      <div><strong>${t('panels.theory.cameraDist')}</strong> ${Math.max(0, simulator.cameraRadius - simulator.rs).toFixed(2)} u.vis</div>
      <div><strong>${t('panels.theory.interiorVisible')}</strong> ${(simulator.interiorOpacity * 100).toFixed(0)}%</div>
    </div>
    <p class="theory-hint">${t('panels.theory.hint')}</p>
    ${getTheorySummaryHtml(simulator.theoryId)}
  `;
  setPanelTitle(panel, theory.name);
}

export function updateHud(readouts, modeManager, binaryReadouts = null, seed = null) {
  const el = document.getElementById('hud-readouts');
  if (!el) return;

  const fmt = (n, digits = 6) => (Number.isFinite(n) ? n.toFixed(digits) : '—');
  const fmtExp = (n) => (Number.isFinite(n) ? n.toExponential(2) : '—');

  const seedRow = seed != null
    ? `<div class="hud-row hud-seed"><span>${t('hud.seed')}</span><span>${seed}</span></div>`
    : '';

  if (binaryReadouts && modeManager?.currentMode === 'binary_merger') {
    el.innerHTML = `
      ${seedRow}
      <div class="hud-row"><span>Fase</span><span>${binaryReadouts.phase}</span></div>
      <div class="hud-row"><span>M₁ / M₂</span><span>${binaryReadouts.m1} / ${binaryReadouts.m2} M☉</span></div>
      <div class="hud-row"><span>μ</span><span>${binaryReadouts.mu?.toFixed(2) ?? '—'} M☉</span></div>
      <div class="hud-row"><span>${t('gui.separation')}</span><span>${binaryReadouts.separation.toFixed(1)} u</span></div>
      <div class="hud-row"><span>h (strain)</span><span>${binaryReadouts.strain.toExponential(2)}</span></div>
      <div class="hud-row"><span>f<sub>GW</sub></span><span>${binaryReadouts.frequency.toFixed(1)} Hz</span></div>
      <div class="hud-row"><span>E<sub>rad</sub></span><span>${binaryReadouts.energyRadiated.toExponential(2)} J</span></div>
    `;
    return;
  }

  const dcMpc = (readouts.dc ?? 0) / 3.086e22;

  el.innerHTML = `
    ${seedRow}
    <div class="hud-row"><span>a(t)</span><span>${fmt(readouts.a)}</span></div>
    <div class="hud-row"><span>z</span><span>${fmt(readouts.z)}</span></div>
    <div class="hud-row"><span>H(t)</span><span>${fmt(readouts.H, 2)} km/s/Mpc</span></div>
    <div class="hud-row"><span>rₛ</span><span>${fmt(readouts.rs, 2)} u · ${fmtExp(readouts.rsMeters)} m</span></div>
    <div class="hud-row"><span>d_c</span><span>${dcMpc < 0.001 && dcMpc > 0 ? dcMpc.toExponential(2) : fmt(dcMpc, 3)} Mpc</span></div>
    <div class="hud-row"><span>${t('panels.lab.age')}</span><span>${fmt(readouts.ageGyr, 2)} Gyr</span></div>
  `;
}

export function updateModePanel(modeManager) {
  if (!modeManager) return;
  modeManager.updateHudLabel();
}
