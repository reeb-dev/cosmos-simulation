/**
 * Puntuación de madurez científica (niveles 2–4) para panel de investigación.
 */

export function computeMaturityScore(ctx, validations = [], extras = {}) {
  const mode = ctx.modeManager?.currentMode ?? 'black_hole';
  const sampleCount = ctx.dataLogger?.samples?.length ?? 0;
  const hasSeed = ctx.simulationSeed?.seed != null;
  const okValidations = validations.filter((v) => v.errorPercent < 5).length;
  const totalVal = Math.max(validations.length, 1);
  const passRate = okValidations / totalVal;
  const ligoScore = extras.ligoComparison?.score ?? 0;

  let level2 = 0;
  if (sampleCount > 5) level2 += 20;
  if (hasSeed) level2 += 15;
  if (passRate >= 0.8) level2 += 25;
  if (ctx.dataLogger) level2 += 15;
  if (extras.hasExport !== false) level2 += 15;
  if (validations.length >= 3) level2 += 10;
  level2 = Math.min(100, level2);

  let level3 = 0;
  if (validations.some((v) => v.meta?.citation)) level3 += 15;
  if (okValidations >= 3) level3 += 20;
  if (mode === 'binary_merger' && ctx.binarySim?.strainHistory?.length > 10) level3 += 15;
  if (ctx.universe?.cosmology) level3 += 15;
  if (typeof window !== 'undefined' && window.CosmosSim) level3 += 15;
  if (extras.hasPublicationReport) level3 += 20;
  level3 = Math.min(100, level3);

  let level4 = 0;
  if (ctx.observatory?.ligoEnabled) {
    level4 += ligoScore >= 50 ? 35 : ligoScore >= 25 ? 25 : 15;
  }
  if (ctx.observatory?.sdssEnabled) level4 += 25;
  if (ctx.observatory?.planckCmb) level4 += 25;
  if (mode === 'binary_merger' || mode === 'deep_field' || mode === 'cosmology') level4 += 15;
  level4 = Math.min(100, level4);

  return {
    level2: { score: level2, label: 'Exploratorio / cualitativo' },
    level3: { score: level3, label: 'Publicación científica (parcial)' },
    level4: { score: level4, label: 'Observatorio / LIGO' },
    overall: Math.round(level2 * 0.4 + level3 * 0.35 + level4 * 0.25),
  };
}

export function maturityBarHtml(score) {
  const filled = Math.round(score / 10);
  const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);
  return `<span class="maturity-bar">[${bar}]</span> <strong>${score}%</strong>`;
}
