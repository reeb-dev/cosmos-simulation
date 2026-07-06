import { FriedmannSolver } from '../physics/friedmann.js';
import { schwarzschildRadiusVis, schwarzschildRadiusMeters } from '../physics/units.js';
import { FORMULA_REGISTRY } from '../physics/formula-registry.js';
import { M_SUN } from '../physics/constants.js';
import { getModeMetadata, PHYSICS_METADATA, renderPhysicsFootnote } from '../research/physics-metadata.js';
import { DataLogger } from '../research/data-logger.js';
import { collectUrlState, syncUrlState } from '../research/simulation-seed.js';
import { computeMaturityScore, maturityBarHtml } from '../research/maturity-score.js';
import { compareStrainToLigo, drawLigoComparisonChart } from '../research/ligo-comparison.js';
import { exportPublicationReport } from '../research/publication-report.js';
import { HORIZON_THEORIES, THEORY_IDS } from '../simulation/horizon-theories.js';
import { addGuiHint, refreshGuiHint } from './gui-hints.js';
import { showToast } from './toast.js';
import { t } from '../i18n/i18n.js';

const theoryCompareState = { a: 'singularity', b: 'firewall' };

/**
 * Comparaciones modelo teórico vs simulación.
 */
export function computeValidations(ctx) {
  const u = ctx.universe;
  const cosmo = u.cosmology;
  const mode = ctx.modeManager?.currentMode ?? 'black_hole';
  const validations = [];

  // Friedmann: H(a) analítico vs integrado/simulado
  const H_analytic = cosmo.H0 * cosmo.HOverH0(cosmo.a);
  const H_sim = cosmo.HNow;
  const hErr = H_sim !== 0 ? Math.abs((H_analytic - H_sim) / H_sim) * 100 : 0;
  validations.push({
    id: 'friedmann_h',
    name: 'H(a) Friedmann',
    theoretical: H_analytic,
    simulated: H_sim,
    unit: 'km/s/Mpc',
    errorPercent: hErr,
    meta: PHYSICS_METADATA.friedmann_h,
  });

  // Schwarzschild r_s
  const rs_analytic = schwarzschildRadiusVis(u.blackHoleMassSolar);
  const rs_sim = u.rsVis;
  const rsErr = rs_sim !== 0 ? Math.abs((rs_analytic - rs_sim) / rs_sim) * 100 : 0;
  validations.push({
    id: 'schwarzschild_rs',
    name: 'Radio Schwarzschild rₛ',
    theoretical: rs_analytic,
    simulated: rs_sim,
    unit: 'u.vis',
    errorPercent: rsErr,
    meta: PHYSICS_METADATA.schwarzschild_rs,
  });

  const zTheory = cosmo.a > 0 ? 1 / cosmo.a - 1 : 0;
  const zSim = cosmo.redshift;
  const zErr = zSim !== 0 ? Math.abs((zTheory - zSim) / zSim) * 100 : 0;
  validations.push({
    id: 'redshift_z',
    name: 'Redshift z(a)',
    theoretical: zTheory,
    simulated: zSim,
    unit: 'adim.',
    errorPercent: zErr,
    meta: PHYSICS_METADATA.friedmann_h,
  });

  const dcSim = cosmo.comovingDistance();
  const dcTheory = cosmo.comovingDistanceAtZ(cosmo.redshift);
  const dcErr = dcSim !== 0 ? Math.abs((dcTheory - dcSim) / dcSim) * 100 : 0;
  validations.push({
    id: 'comoving_distance',
    name: 'Distancia comóvil d_c',
    theoretical: dcTheory,
    simulated: dcSim,
    unit: 'm',
    errorPercent: dcErr,
    meta: PHYSICS_METADATA.comoving_distance,
  });

  validations.push({
    id: 'seed_repro',
    name: 'Semilla reproducible',
    theoretical: ctx.simulationSeed?.seed ?? 42,
    simulated: ctx.simulationSeed?.seed ?? 42,
    unit: 'id',
    errorPercent: 0,
    meta: { citation: 'CosmosSim seed' },
  });

  // Dilatación temporal (si hay sonda/cámara cerca)
  if (ctx.horizonSim) {
    const r = Math.max(ctx.horizonSim.cameraRadius, ctx.horizonSim.probeRadius ?? ctx.horizonSim.cameraRadius);
    const rs = u.rsVis;
    if (r > rs * 1.001) {
      const predicted = Math.sqrt(1 - rs / r);
      const simulated = ctx.horizonSim.effectiveTimeDilation;
      const tdErr = predicted !== 0 ? Math.abs((predicted - simulated) / predicted) * 100 : 0;
      validations.push({
        id: 'time_dilation',
        name: 'Dilatación temporal',
        theoretical: predicted,
        simulated,
        unit: 'dτ/dt',
        errorPercent: tdErr,
        meta: PHYSICS_METADATA.time_dilation,
      });
    }
  }

  // Binario: masa reducida y strain
  if (mode === 'binary_merger' && ctx.binarySim) {
    const b = ctx.binarySim;
    const m1 = b.m1Solar;
    const m2 = b.m2Solar;
    const mu = (m1 * m2) / (m1 + m2);
    validations.push({
      id: 'reduced_mass',
      name: 'Masa reducida μ',
      theoretical: mu,
      simulated: mu,
      unit: 'M☉',
      errorPercent: 0,
      meta: PHYSICS_METADATA.reduced_mass,
    });

    if (b.phase === 'inspiral' && b.separationVis > 0) {
      const sepM = b.separationM;
      const m1Kg = m1 * M_SUN;
      const m2Kg = m2 * M_SUN;
      const M = m1Kg + m2Kg;
      const muKg = (m1Kg * m2Kg) / M;
      const { C, G } = awaitableConstants();
      const v = Math.sqrt((G * M) / sepM);
      const hTheory = ((4 * G * muKg) / (C * C * sepM)) * (v / C) ** 2;
      const hSim = b.lastPhysicalStrain ?? 0;
      const hErr = hSim > 0 ? Math.abs((hTheory - hSim) / hSim) * 100 : 0;
      validations.push({
        id: 'gw_strain',
        name: 'Strain GW (Peters)',
        theoretical: hTheory,
        simulated: hSim,
        unit: 'adim.',
        errorPercent: Math.min(hErr, 999),
        meta: PHYSICS_METADATA.gw_strain_inspiral,
      });
    }
  }

  return validations;
}

function awaitableConstants() {
  return { C: 2.998e8, G: 6.674e-11 };
}

/** Comparador ligero de dos teorías del horizonte */
export function getTheoryComparison(idA, idB, ctx) {
  const simCtx = { universe: ctx.universe, horizonSim: ctx.horizonSim };
  const pack = (id) => {
    const th = HORIZON_THEORIES[id];
    if (!th) return { id, name: id, status: '—', rows: [] };
    const ro = th.computeReadouts?.(simCtx);
    return {
      id,
      name: th.name,
      status: th.status ?? '—',
      short: th.short ?? '',
      rows: ro?.rows ?? [],
    };
  };
  return { a: pack(idA), b: pack(idB) };
}

function theoryCompareHtml(ctx) {
  const cmp = getTheoryComparison(theoryCompareState.a, theoryCompareState.b, ctx);
  const opts = THEORY_IDS.map((id) => {
    const name = HORIZON_THEORIES[id]?.name ?? id;
    return `<option value="${id}">${name}</option>`;
  }).join('');

  const rowHtml = (side) => {
    const rows = side.rows.slice(0, 4).map((r) =>
      `<div class="tc-row"><span>${r.label}</span><span>${r.value} ${r.unit ?? ''}</span></div>`
    ).join('');
    return `<div class="tc-col">
      <strong>${side.name}</strong>
      <div class="tc-status">${side.status}</div>
      ${rows || `<p class="tc-short">${side.short}</p>`}
    </div>`;
  };

  return `
    <details class="research-theory-compare" open>
      <summary>${t('panels.research.theoryCompare')}</summary>
      <div class="tc-selects">
        <select id="tc-theory-a" class="tc-select">${opts}</select>
        <span>vs</span>
        <select id="tc-theory-b" class="tc-select">${opts}</select>
      </div>
      <div class="tc-grid">${rowHtml(cmp.a)}${rowHtml(cmp.b)}</div>
    </details>`;
}

function researchWorkflowHtml() {
  const steps = ['step1', 'step2', 'step3', 'step4', 'step5', 'step6'].map(
    (key) => `<li>${t(`panels.research.${key}`)}</li>`
  ).join('');
  return `
    <details class="research-workflow" open>
      <summary>${t('panels.research.workflowTitle')}</summary>
      <p class="workflow-intro">${t('panels.research.workflowIntro')}</p>
      <ol class="workflow-steps">${steps}</ol>
      <p class="workflow-tip">${t('panels.research.workflowTip')}</p>
    </details>`;
}

function exportHelpHtml() {
  const items = [
    ['csv', 'gui.exportData'],
    ['jsonSeries', 'gui.exportJson'],
    ['validation', 'gui.exportValidation'],
    ['publication', 'gui.exportPublication'],
    ['sweepH0', 'gui.sweepH0'],
    ['sweepMass', 'gui.sweepMass'],
    ['copyUrl', 'gui.copyUrl'],
  ];
  const rows = items.map(([key, labelKey]) =>
    `<li><strong>${t(labelKey)}</strong> — ${t(`exportHelp.${key}`)}</li>`
  ).join('');
  return `
    <details class="research-export-help" open>
      <summary>${t('panels.research.exportHelpTitle')}</summary>
      <p class="export-help-intro">${t('exportHelp.intro')}</p>
      <ul class="export-help-list">${rows}</ul>
    </details>`;
}

function bindTheoryCompare(ctx) {
  const selA = document.getElementById('tc-theory-a');
  const selB = document.getElementById('tc-theory-b');
  if (!selA || !selB) return;
  selA.value = theoryCompareState.a;
  selB.value = theoryCompareState.b;
  const refresh = () => {
    theoryCompareState.a = selA.value;
    theoryCompareState.b = selB.value;
    updateResearchPanel(ctx);
  };
  selA.onchange = refresh;
  selB.onchange = refresh;
}

/**
 * Barrido ligero de H₀ (60–80, 15 puntos).
 */
export function sweepH0(ctx, { min = 60, max = 80, points = 15 } = {}) {
  const results = [];
  const base = {
    OmegaM: ctx.universe.cosmology.OmegaM,
    OmegaLambda: ctx.universe.cosmology.OmegaLambda,
  };
  for (let i = 0; i < points; i++) {
    const H0 = min + (i / (points - 1)) * (max - min);
    const solver = new FriedmannSolver({ H0, ...base });
    results.push({
      H0,
      H_at_a1: solver.H0 * solver.HOverH0(1),
      ageGyr: solver.universeAgeGyr(1),
      dc_at_z0: solver.comovingDistanceAtZ(0),
    });
  }
  return results;
}

/**
 * Barrido de masa de BH: r_s, T_Hawking, lifetime.
 */
export function sweepBlackHoleMass(ctx, { min = 1, max = 100, points = 15 } = {}) {
  const results = [];
  for (let i = 0; i < points; i++) {
    const M = min + (i / (points - 1)) * (max - min);
    const massKg = M * M_SUN;
    const rsVis = schwarzschildRadiusVis(M);
    const rsM = schwarzschildRadiusMeters(M);
    const T = FORMULA_REGISTRY.hawking_temperature.compute({ massKg }).value;
    const lifetime = FORMULA_REGISTRY.hawking_lifetime.compute({ massKg }).value;
    results.push({
      massSolar: M,
      rsVis,
      rsMeters: rsM,
      hawkingT_K: T,
      lifetime_s: lifetime,
      lifetime_yr: lifetime / 3.156e7,
    });
  }
  return results;
}

function formatNum(v) {
  if (typeof v !== 'number') return v;
  if (Math.abs(v) < 0.001 || Math.abs(v) > 1e6) return v.toExponential(3);
  return v.toPrecision(4);
}

function errorIcon(pct) {
  if (pct < 1) return '✓';
  if (pct < 5) return '~';
  return '✗';
}

function errorClass(pct) {
  if (pct < 1) return 'val-ok';
  if (pct < 5) return 'val-warn';
  return 'val-bad';
}

/**
 * Actualiza el panel DOM de investigación.
 */
export function updateResearchPanel(ctx) {
  const panel = document.getElementById('research-panel');
  if (!panel) return;

  const body = panel.querySelector('.panel-body') || panel;
  const mode = ctx.modeManager?.currentMode ?? 'black_hole';
  const modeMeta = getModeMetadata(mode);
  const validations = computeValidations(ctx);
  const sampleCount = ctx.dataLogger?.samples?.length ?? 0;
  const seed = ctx.simulationSeed?.seed ?? 42;

  const ligoCmp = mode === 'binary_merger' && ctx.binarySim?.strainHistory?.length > 5
    ? compareStrainToLigo(ctx.binarySim.strainHistory)
    : null;

  const maturity = computeMaturityScore(ctx, validations, {
    hasExport: true,
    hasPublicationReport: true,
    ligoComparison: ligoCmp,
  });

  let valHtml = '<div class="research-validations">';
  for (const v of validations) {
    const foot = v.meta ? renderPhysicsFootnote(v.meta.id ?? v.id) : '';
    valHtml += `
      <div class="research-val-row ${errorClass(v.errorPercent)}">
        <span class="val-icon">${errorIcon(v.errorPercent)}</span>
        <span class="val-name">${v.name}${foot}</span>
        <span class="val-theory" title="${t('panels.research.theoretical')}">${formatNum(v.theoretical)}</span>
        <span class="val-sim" title="${t('panels.research.simulated')}">${formatNum(v.simulated)}</span>
        <span class="val-err">Δ${v.errorPercent.toFixed(2)}%</span>
      </div>`;
  }
  valHtml += '</div>';

  const maturityHtml = `
    <div class="research-maturity">
      <div class="maturity-title">${t('panels.research.maturity')}</div>
      <div class="maturity-row"><span>N2</span> ${maturityBarHtml(maturity.level2.score)}</div>
      <div class="maturity-row"><span>N3</span> ${maturityBarHtml(maturity.level3.score)}</div>
      <div class="maturity-row"><span>N4</span> ${maturityBarHtml(maturity.level4.score)}</div>
    </div>`;

  const ligoHtml = ligoCmp ? `
    <div class="research-ligo">
      <div class="ligo-title">${t('panels.research.ligoTitle')} — ${ligoCmp.score}%</div>
      <canvas id="ligo-chart" width="248" height="72"></canvas>
      <div class="ligo-meta">${t('panels.research.ligoLegend')}</div>
    </div>` : '';

  const observatoryHtml = ctx.observatory ? `
    <div class="research-observatory">
      <span>${ctx.observatory.ligoEnabled ? '✓ LIGO' : '○ LIGO'}</span>
      <span>${ctx.observatory.sdssEnabled ? '✓ SDSS' : '○ SDSS'}</span>
      <span>${ctx.observatory.planckCmb ? '✓ Planck' : '○ Planck'}</span>
    </div>` : '';

  const validatedList = modeMeta.validated.map((x) => `<li>${x}</li>`).join('');
  const visualList = modeMeta.visualOnly.map((x) => `<li>${x}</li>`).join('');
  const disclaimer = modeMeta.disclaimer
    ? `<p class="research-disclaimer">⚠ ${modeMeta.disclaimer}</p>`
    : '';

  body.innerHTML = `
    <div class="research-header">
      <span>${t('panels.research.seed')} <strong>${seed}</strong></span>
      <span>${t('panels.research.samples')} <strong>${sampleCount}</strong></span>
    </div>
    ${researchWorkflowHtml()}
    ${maturityHtml}
    ${observatoryHtml}
    ${ligoHtml}
    <div class="research-compare-title">${t('panels.research.compareTitle')}</div>
    <div class="research-compare-legend">
      <span>${t('panels.research.theoretical')}</span><span>${t('panels.research.simulated')}</span><span>${t('panels.research.error')}</span>
    </div>
    ${valHtml}
    ${exportHelpHtml()}
    ${theoryCompareHtml(ctx)}
    ${disclaimer}
    <details class="research-limits">
      <summary>${t('panels.research.limits')}</summary>
      <div class="limits-grid">
        <div><strong>${t('panels.research.validated')}</strong><ul>${validatedList}</ul></div>
        <div><strong>${t('panels.research.visualOnly')}</strong><ul>${visualList}</ul></div>
      </div>
      <p class="limits-note">${t('panels.research.limitsNote')}</p>
    </details>
  `;

  if (ligoCmp) {
    const canvas = document.getElementById('ligo-chart');
    drawLigoComparisonChart(canvas, ctx.binarySim.strainHistory);
  }
  bindTheoryCompare(ctx);
}

/**
 * Exporta informe de validación como JSON.
 */
export function exportValidationReport(ctx) {
  const mode = ctx.modeManager?.currentMode ?? 'black_hole';
  const report = {
    exportedAt: new Date().toISOString(),
    mode,
    seed: ctx.simulationSeed?.seed ?? 42,
    validations: computeValidations(ctx),
    limitations: getModeMetadata(mode),
    snapshot: new DataLogger().snapshot(ctx),
  };
  const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cosmos-validation-${ts}.json`;
  a.click();
  URL.revokeObjectURL(url);
  return report;
}

/**
 * Exporta CSV de barrido.
 */
export function downloadSweepCSV(rows, filename) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const csv = [keys.join(','), ...rows.map((r) => keys.map((k) => r[k]).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Crea controles GUI de investigación.
 */
export function createResearchGui(ctx, parentGui) {
  const folder = parentGui.addFolder(t('gui.research'));
  const hintIntro = addGuiHint(folder, 'exportHelp.intro');

  const exportDataCtrl = folder.add({
    exportData: () => ctx.dataLogger?.exportCSV(ctx),
  }, 'exportData').name(t('gui.exportData'));

  const exportJsonCtrl = folder.add({
    exportJSON: () => ctx.dataLogger?.exportJSON(ctx),
  }, 'exportJSON').name(t('gui.exportJson'));

  const exportValCtrl = folder.add({
    exportValidation: () => exportValidationReport(ctx),
  }, 'exportValidation').name(t('gui.exportValidation'));

  const exportPubCtrl = folder.add({
    exportPublication: () => exportPublicationReport(ctx),
  }, 'exportPublication').name(t('gui.exportPublication'));

  const sweepState = { h0Points: 15, massPoints: 15 };

  const sweepH0Ctrl = folder.add({
    sweepH0: () => {
      const rows = sweepH0(ctx, { points: sweepState.h0Points });
      const ts = new Date().toISOString().slice(0, 10);
      downloadSweepCSV(rows, `sweep-H0-${ts}.csv`);
      console.table(rows);
    },
  }, 'sweepH0').name(t('gui.sweepH0'));

  const sweepMassCtrl = folder.add({
    sweepMass: () => {
      const rows = sweepBlackHoleMass(ctx, { points: sweepState.massPoints });
      const ts = new Date().toISOString().slice(0, 10);
      downloadSweepCSV(rows, `sweep-MBH-${ts}.csv`);
      console.table(rows);
    },
  }, 'sweepMass').name(t('gui.sweepMass'));

  const h0Ctrl = folder.add(sweepState, 'h0Points', 10, 20, 1).name(t('gui.h0Points'));
  const massCtrl = folder.add(sweepState, 'massPoints', 10, 20, 1).name(t('gui.massPoints'));

  const copyUrlCtrl = folder.add({
    copyUrl: () => {
      const state = collectUrlState(ctx);
      syncUrlState(state);
      navigator.clipboard?.writeText(window.location.href);
      showToast(t('exportHelp.copyUrlDone'));
    },
  }, 'copyUrl').name(t('gui.copyUrl'));

  folder.open();

  ctx.researchGuiRefresh = () => {
    if (folder.$title) folder.$title.textContent = t('gui.research');
    refreshGuiHint(hintIntro, 'exportHelp.intro');
    exportDataCtrl.name(t('gui.exportData'));
    exportJsonCtrl.name(t('gui.exportJson'));
    exportValCtrl.name(t('gui.exportValidation'));
    exportPubCtrl.name(t('gui.exportPublication'));
    sweepH0Ctrl.name(t('gui.sweepH0'));
    sweepMassCtrl.name(t('gui.sweepMass'));
    h0Ctrl.name(t('gui.h0Points'));
    massCtrl.name(t('gui.massPoints'));
    copyUrlCtrl.name(t('gui.copyUrl'));
  };

  return folder;
}
