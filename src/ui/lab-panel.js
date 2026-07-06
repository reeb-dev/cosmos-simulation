import { FORMULA_CATEGORIES, formatFormulaValue } from '../physics/formula-registry.js';
import { getEraForZ } from '../lab/theory-lab.js';

export function updateLabPanel(lab) {
  const panel = document.getElementById('lab-panel');
  if (!panel) return;

  const results = lab.lastResults;
  const z = lab.universe.cosmology.redshift;
  const era = getEraForZ(z);

  const byCategory = {};
  for (const r of results) {
    const cat = FORMULA_CATEGORIES[r.category] || r.category;
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(r);
  }

  let html = `
    <h2>Laboratorio</h2>
    <div class="lab-era" style="color:${era.color}">${era.name}</div>
    <div class="lab-timeline">${renderTimeline(z)}</div>
  `;

  for (const [cat, items] of Object.entries(byCategory)) {
    html += `<div class="lab-category"><strong>${cat}</strong>`;
    for (const item of items) {
      const val = item.error ? `error: ${item.error}` : formatFormulaValue(item);
      const sim = item.result?.simValue !== undefined
        ? ` <span class="lab-sim">↔ ${typeof item.result.simValue === 'number' ? item.result.simValue.toPrecision(4) : item.result.simValue}</span>`
        : '';
      const err = item.error ? ` <span class="lab-err">!</span>` : '';
      html += `<div class="lab-formula" title="${item.latex}">${item.name}: <code>${val}</code>${sim}${err}</div>`;
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

  panel.innerHTML = html;
}

function renderTimeline(z) {
  const pct = z <= 0 ? 0 : Math.min(100, (Math.log10(1 + z) / Math.log10(1101)) * 100);
  return `<div class="timeline-bar"><div class="timeline-fill" style="width:${pct}%"></div><span class="timeline-label">z=${z.toFixed(4)}</span></div>`;
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
