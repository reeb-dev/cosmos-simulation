import { computeValidations } from '../ui/research-panel.js';
import { computeMaturityScore } from './maturity-score.js';
import { compareStrainToLigo } from './ligo-comparison.js';
import { getModeMetadata, PHYSICS_METADATA } from './physics-metadata.js';
import { collectUrlState, syncUrlState } from './simulation-seed.js';
import { GW150914_META } from '../data/ligo-gw150914.js';
import { SDSS_SAMPLE_META } from '../data/sdss-sample.js';

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatNum(v) {
  if (typeof v !== 'number') return esc(v);
  if (Math.abs(v) < 0.001 || Math.abs(v) > 1e6) return v.toExponential(3);
  return v.toPrecision(4);
}

/**
 * Genera informe HTML autocontenido para publicación / reproducibilidad.
 */
export function buildPublicationReportHtml(ctx) {
  const mode = ctx.modeManager?.currentMode ?? 'black_hole';
  const validations = computeValidations(ctx);
  const maturity = computeMaturityScore(ctx, validations);
  const modeMeta = getModeMetadata(mode);
  const seed = ctx.simulationSeed?.seed ?? 42;
  const urlState = collectUrlState(ctx);
  syncUrlState(urlState);
  const reproUrl = typeof window !== 'undefined' ? window.location.href : '';

  const ligo =
    mode === 'binary_merger' && ctx.binarySim?.strainHistory?.length
      ? compareStrainToLigo(ctx.binarySim.strainHistory)
      : null;

  const valRows = validations
    .map((v) => {
      const ok = v.errorPercent < 5 ? '✓' : v.errorPercent < 10 ? '~' : '✗';
      const cite = v.meta?.citation ? esc(v.meta.citation) : '—';
      return `<tr>
        <td>${ok}</td>
        <td>${esc(v.name)}</td>
        <td>${formatNum(v.theoretical)}</td>
        <td>${formatNum(v.simulated)}</td>
        <td>${v.errorPercent.toFixed(2)}%</td>
        <td>${esc(v.unit)}</td>
        <td><small>${cite}</small></td>
      </tr>`;
    })
    .join('');

  const citations = [...new Set(validations.map((v) => v.meta?.citation).filter(Boolean))];

  const ligoSection = ligo
    ? `<section>
        <h2>Comparación LIGO GW150914</h2>
        <p>Correlación de forma: <strong>${(ligo.correlation * 100).toFixed(1)}%</strong> ·
           pico sim/LIGO: <strong>${(ligo.peakRatio * 100).toFixed(1)}%</strong> ·
           puntuación: <strong>${ligo.score}%</strong></p>
        <p><small>${esc(GW150914_META.reference)} · ${esc(GW150914_META.source)}</small></p>
        <p><em>Plantilla educativa; no sustituye datos LOSC ni simulación NR.</em></p>
      </section>`
    : '';

  const observatory = ctx.observatory ?? {};
  const obsNotes = [
    observatory.planckCmb ? 'CMB estilo Planck (anisotropías ~2,725 K)' : null,
    observatory.sdssEnabled ? `Catálogo SDSS (${SDSS_SAMPLE_META.count} galaxias, ${SDSS_SAMPLE_META.reference})` : null,
    observatory.ligoEnabled ? 'Comparador LIGO GW150914 activo' : null,
  ].filter(Boolean);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <title>CosmosSim — Informe de validación</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 920px; margin: 2rem auto; padding: 0 1rem;
           background: #0a0e18; color: #d8e0f0; line-height: 1.5; }
    h1, h2 { color: #8ec4ff; }
    table { width: 100%; border-collapse: collapse; font-size: 0.9rem; margin: 1rem 0; }
    th, td { border: 1px solid #334; padding: 0.4rem 0.6rem; text-align: left; }
    th { background: #152030; }
    .maturity { display: grid; gap: 0.5rem; margin: 1rem 0; }
    .maturity div { background: #121a28; padding: 0.6rem 1rem; border-radius: 6px; }
    .meta { color: #8899aa; font-size: 0.85rem; }
    .warn { color: #ffb366; }
    ul { padding-left: 1.2rem; }
    code { background: #1a2438; padding: 0.1rem 0.35rem; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>CosmosSim — Informe de validación</h1>
  <p class="meta">Exportado: ${esc(new Date().toISOString())} · Modo: <strong>${esc(modeMeta.name ?? mode)}</strong></p>

  <section>
    <h2>Reproducibilidad</h2>
    <p>Semilla: <code>${seed}</code></p>
    <p>URL reproducible: <code>${esc(reproUrl)}</code></p>
    <p>Muestras registradas: <strong>${ctx.dataLogger?.samples?.length ?? 0}</strong></p>
  </section>

  <section>
    <h2>Madurez científica</h2>
    <div class="maturity">
      <div>Nivel 2 — ${esc(maturity.level2.label)}: <strong>${maturity.level2.score}%</strong></div>
      <div>Nivel 3 — ${esc(maturity.level3.label)}: <strong>${maturity.level3.score}%</strong></div>
      <div>Nivel 4 — ${esc(maturity.level4.label)}: <strong>${maturity.level4.score}%</strong></div>
      <div>Global ponderado: <strong>${maturity.overall}%</strong></div>
    </div>
  </section>

  <section>
    <h2>Validaciones teórico vs simulación</h2>
    <table>
      <thead><tr><th></th><th>Quantity</th><th>Teórico</th><th>Simulado</th><th>Δ%</th><th>Unidad</th><th>Cita</th></tr></thead>
      <tbody>${valRows}</tbody>
    </table>
  </section>

  ${ligoSection}

  <section>
    <h2>Citas bibliográficas</h2>
    <ul>${citations.map((c) => `<li>${esc(c)} — ${esc(PHYSICS_METADATA[Object.keys(PHYSICS_METADATA).find((k) => PHYSICS_METADATA[k].citation === c)]?.reference ?? '')}</li>`).join('') || '<li>—</li>'}</ul>
  </section>

  ${obsNotes.length ? `<section><h2>Observatorio</h2><ul>${obsNotes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul></section>` : ''}

  <section>
    <h2>Limitaciones</h2>
    <p class="warn">${esc(modeMeta.disclaimer ?? 'Ver panel de investigación para limitaciones por modo.')}</p>
    <p><strong>Validado:</strong> ${modeMeta.validated.map(esc).join(', ')}</p>
    <p><strong>Solo visual:</strong> ${modeMeta.visualOnly.map(esc).join(', ')}</p>
  </section>

  <footer class="meta"><p>CosmosSim — motor híbrido Schwarzschild + Friedmann. No es simulación NR ni catálogo SDSS completo.</p></footer>
</body>
</html>`;
}

export function exportPublicationReport(ctx) {
  const html = buildPublicationReportHtml(ctx);
  const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cosmos-publication-${ts}.html`;
  a.click();
  URL.revokeObjectURL(url);
  return html;
}
