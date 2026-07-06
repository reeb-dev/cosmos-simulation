import { generateGW150914Template, GW150914_META, ligoStrainAt } from '../data/ligo-gw150914.js';

const LIGO_TEMPLATE = generateGW150914Template(400);

/** Correlación de forma normalizada entre sim y LIGO (0–100) */
export function compareStrainToLigo(strainHistory) {
  if (!strainHistory?.length) return { score: 0, peakSim: 0, peakLigo: GW150914_META.peakStrain };

  const sim = strainHistory.filter((s) => s.t <= GW150914_META.durationSec);
  if (sim.length < 5) return { score: 0, peakSim: 0, peakLigo: GW150914_META.peakStrain };

  const peakSim = Math.max(...sim.map((s) => Math.abs(s.h)));
  const peakLigo = GW150914_META.peakStrain;
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const s of sim) {
    const a = s.h / (peakSim || 1e-30);
    const b = ligoStrainAt(s.t, LIGO_TEMPLATE) / peakLigo;
    dot += a * b;
    normA += a * a;
    normB += b * b;
  }
  const corr = normA && normB ? dot / Math.sqrt(normA * normB) : 0;
  const peakRatio = peakSim > 0 ? Math.min(peakSim, peakLigo) / Math.max(peakSim, peakLigo) : 0;

  return {
    score: Math.round(Math.max(0, corr * 0.7 + peakRatio * 0.3) * 100),
    correlation: corr,
    peakRatio,
    peakSim,
    peakLigo,
    meta: GW150914_META,
  };
}

/** Dibuja comparación strain en canvas */
export function drawLigoComparisonChart(canvas, strainHistory) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.fillStyle = '#040810';
  ctx.fillRect(0, 0, w, h);

  const pad = 24;
  const plotW = w - pad * 2;
  const plotH = h - pad * 2;
  const tMax = GW150914_META.durationSec;

  const sim = strainHistory?.filter((s) => s.t <= tMax) ?? [];
  const allH = [
    ...LIGO_TEMPLATE.map((p) => p.h),
    ...sim.map((s) => s.h),
  ];
  const maxH = Math.max(...allH.map(Math.abs), 1e-22);

  const toX = (t) => pad + (t / tMax) * plotW;
  const toY = (v) => pad + plotH / 2 - (v / maxH) * (plotH / 2 - 4);

  ctx.strokeStyle = 'rgba(255,180,80,0.9)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < LIGO_TEMPLATE.length; i++) {
    const p = LIGO_TEMPLATE[i];
    const x = toX(p.t);
    const y = toY(p.h);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  if (sim.length > 1) {
    ctx.strokeStyle = 'rgba(100,200,255,0.95)';
    ctx.beginPath();
    for (let i = 0; i < sim.length; i++) {
      const x = toX(sim[i].t);
      const y = toY(sim[i].h);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  ctx.fillStyle = '#8899bb';
  ctx.font = '10px system-ui,sans-serif';
  ctx.fillText('LIGO GW150914 (naranja) · Simulación (cian)', pad, 14);
  ctx.fillText(`t (s) · h max ~${maxH.toExponential(1)}`, pad, h - 6);
}

export { LIGO_TEMPLATE, GW150914_META };
