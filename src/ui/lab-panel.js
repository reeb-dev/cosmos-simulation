import { FORMULA_CATEGORIES, formatFormulaValue } from '../physics/formula-registry.js';
import { getEraForZ, COSMIC_TIMELINE_MARKERS } from '../lab/theory-lab.js';
import { renderPhysicsFootnote } from '../research/physics-metadata.js';

/** Mapeo nombre de fórmula → id de metadatos */
const FORMULA_META_MAP = {
  'Parámetro de Hubble': 'friedmann_h',
  'Radio de Schwarzschild': 'schwarzschild_rs',
  'Dilatación temporal': 'time_dilation',
  'Temperatura Hawking': 'hawking_temperature',
  'Tiempo evaporación Hawking': 'hawking_lifetime',
  'Strain GW': 'gw_strain_inspiral',
};

export function updateLabPanel(lab) {
  const panel = document.getElementById('lab-panel');
  if (!panel) return;
  const body = panel.querySelector('.panel-body') || panel;

  const results = lab.lastResults;
  const cosmo = lab.universe.cosmology;
  const z = cosmo.redshift;
  const era = getEraForZ(z);
  const ageGyr = cosmo.universeAgeGyr?.() ?? 13.8;

  const byCategory = {};
  for (const r of results) {
    const cat = FORMULA_CATEGORIES[r.category] || r.category;
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(r);
  }

  let html = `
    <h2>Laboratorio</h2>
    <div class="lab-era" style="color:${era.color}">${era.name}</div>
    <div class="lab-age">Edad del universo: <strong>${ageGyr.toFixed(2)} Gyr</strong> · a=${cosmo.a.toFixed(5)}</div>
    <div class="lab-timeline">${renderTimeline(z)}</div>
    <div class="lab-timeline-legend">${renderTimelineLegend(z)}</div>
  `;

  for (const [cat, items] of Object.entries(byCategory)) {
    html += `<div class="lab-category"><strong>${cat}</strong>`;
    for (const item of items) {
      const val = item.error ? `error: ${item.error}` : formatFormulaValue(item);
      const sim = item.result?.simValue !== undefined
        ? ` <span class="lab-sim">↔ ${typeof item.result.simValue === 'number' ? item.result.simValue.toPrecision(4) : item.result.simValue}</span>`
        : '';
      const err = item.error ? ` <span class="lab-err">!</span>` : '';
      const metaId = FORMULA_META_MAP[item.name];
      const foot = metaId ? renderPhysicsFootnote(metaId) : '';
      html += `<div class="lab-formula" title="${item.latex}">${item.name}${foot}: <code>${val}</code>${sim}${err}</div>`;
    }
    html += '</div>';
  }

  const comparisons = lab.getComparisons();
  if (comparisons.length) {
    html += '<div class="lab-category"><strong>Validación</strong>';
    for (const c of comparisons) {
      const icon = c.diffPercent < 2 ? '✓' : c.diffPercent < 10 ? '~' : '✗';
      html += `<div class="lab-compare">${icon} ${c.name}: Δ${c.diffPercent.toFixed(1)}%</div>`;
    }
    html += '</div>';
  }

  body.innerHTML = html;
}

function zToTimelinePct(z) {
  if (z <= 0) return 95;
  const logZ = Math.log10(1 + z);
  const logMax = Math.log10(1101);
  return Math.min(95, Math.max(2, (logZ / logMax) * 95));
}

function renderTimeline(z) {
  const pct = zToTimelinePct(z);
  const markers = COSMIC_TIMELINE_MARKERS.map((m) =>
    `<span class="timeline-marker" style="left:${m.pct}%" title="${m.label} (z≈${m.z >= 100 ? m.z.toExponential(0) : m.z})"></span>`
  ).join('');
  return `
    <div class="timeline-bar">
      <div class="timeline-fill" style="width:${pct}%"></div>
      <div class="timeline-markers">${markers}</div>
      <span class="timeline-label">z=${z.toFixed(4)}</span>
    </div>`;
}

function renderTimelineLegend(z) {
  const active = [...COSMIC_TIMELINE_MARKERS].reverse().find((m) => z >= m.z || m.z === 0);
  const labels = COSMIC_TIMELINE_MARKERS.map((m) => {
    const on = active?.id === m.id;
    return `<span class="tl-era${on ? ' active' : ''}">${m.label}</span>`;
  }).join('');
  return `<div class="timeline-eras">${labels}</div>`;
}

export function updateExperimentModal(data) {
  const modal = document.getElementById('experiment-result');
  if (!modal || !data) return;

  const lines = Object.entries(data).map(([k, v]) => {
    const val = typeof v === 'number' ? v.toPrecision(5) : v;
    return `<div><strong>${k}:</strong> ${val}</div>`;
  });

  modal.innerHTML = `<div class="exp-title">Resultado del experimento</div>${lines.join('')}`;
  modal.style.display = 'block';
  clearTimeout(modal._timer);
  modal._timer = setTimeout(() => { modal.style.display = 'none'; }, 10000);
}

export function showResetToast(msg) {
  const el = document.getElementById('reset-toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('visible');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('visible'), 2500);
}
