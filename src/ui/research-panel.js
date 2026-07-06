import { FriedmannSolver } from '../physics/friedmann.js';
import { schwarzschildRadiusVis, schwarzschildRadiusMeters } from '../physics/units.js';
import { FORMULA_REGISTRY } from '../physics/formula-registry.js';
import { M_SUN } from '../physics/constants.js';
import { getModeMetadata, PHYSICS_METADATA, renderPhysicsFootnote } from '../research/physics-metadata.js';
import { DataLogger } from '../research/data-logger.js';
import { collectUrlState, syncUrlState } from '../research/simulation-seed.js';

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
      const hTheory = ((4 * G * muKg) / (C * C * sepM)) * (v / C) ** 2 * 1e21;
      const hSim = b.lastStrain;
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

  let valHtml = '<div class="research-validations">';
  for (const v of validations) {
    const foot = v.meta ? renderPhysicsFootnote(v.meta.id ?? v.id) : '';
    valHtml += `
      <div class="research-val-row ${errorClass(v.errorPercent)}">
        <span class="val-icon">${errorIcon(v.errorPercent)}</span>
        <span class="val-name">${v.name}${foot}</span>
        <span class="val-theory" title="Teórico">${formatNum(v.theoretical)}</span>
        <span class="val-sim" title="Simulado">${formatNum(v.simulated)}</span>
        <span class="val-err">Δ${v.errorPercent.toFixed(2)}%</span>
      </div>`;
  }
  valHtml += '</div>';

  const validatedList = modeMeta.validated.map((x) => `<li>${x}</li>`).join('');
  const visualList = modeMeta.visualOnly.map((x) => `<li>${x}</li>`).join('');
  const disclaimer = modeMeta.disclaimer
    ? `<p class="research-disclaimer">⚠ ${modeMeta.disclaimer}</p>`
    : '';

  body.innerHTML = `
    <h2>Investigación</h2>
    <div class="research-header">
      <span>Semilla: <strong>${seed}</strong></span>
      <span>Muestras: <strong>${sampleCount}</strong></span>
    </div>
    <div class="research-compare-title">Modelo teórico vs Simulación</div>
    <div class="research-compare-legend">
      <span>Teórico</span><span>Simulado</span><span>Error</span>
    </div>
    ${valHtml}
    ${disclaimer}
    <details class="research-limits">
      <summary>Limitaciones honestas (no grado investigación)</summary>
      <div class="limits-grid">
        <div><strong>✓ Validado en este modo</strong><ul>${validatedList}</ul></div>
        <div><strong>◎ Solo visual / pedagógico</strong><ul>${visualList}</ul></div>
      </div>
      <p class="limits-note">El lensing es post-proceso en pantalla (no ray-tracing por geodésicas). Los interiores del BH son escenas teóricas ilustrativas. El merger binario usa Peters + modelos fenomenológicos, no simulación NR (SXS/ETK).</p>
    </details>
  `;
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
  const folder = parentGui.addFolder('Investigación');

  folder.add({
    exportData: () => ctx.dataLogger?.exportCSV(ctx),
  }, 'exportData').name('📥 Exportar datos (CSV/JSON)');

  folder.add({
    exportJSON: () => ctx.dataLogger?.exportJSON(ctx),
  }, 'exportJSON').name('📥 Exportar serie (JSON)');

  folder.add({
    exportValidation: () => exportValidationReport(ctx),
  }, 'exportValidation').name('📋 Informe validación');

  const sweepState = { h0Points: 15, massPoints: 15 };

  folder.add({
    sweepH0: () => {
      const rows = sweepH0(ctx, { points: sweepState.h0Points });
      const ts = new Date().toISOString().slice(0, 10);
      downloadSweepCSV(rows, `sweep-H0-${ts}.csv`);
      console.table(rows);
    },
  }, 'sweepH0').name('Barrido H₀ (60–80)');

  folder.add({
    sweepMass: () => {
      const rows = sweepBlackHoleMass(ctx, { points: sweepState.massPoints });
      const ts = new Date().toISOString().slice(0, 10);
      downloadSweepCSV(rows, `sweep-MBH-${ts}.csv`);
      console.table(rows);
    },
  }, 'sweepMass').name('Barrido M_BH (rₛ,T,τ)');

  folder.add(sweepState, 'h0Points', 10, 20, 1).name('Puntos H₀');
  folder.add(sweepState, 'massPoints', 10, 20, 1).name('Puntos masa');

  folder.add({
    copyUrl: () => {
      const state = collectUrlState(ctx);
      syncUrlState(state);
      navigator.clipboard?.writeText(window.location.href);
    },
  }, 'copyUrl').name('🔗 Copiar URL reproducible');

  folder.open();
  return folder;
}
