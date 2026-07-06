import { FORMULA_CATEGORIES, formatFormulaValue } from '../physics/formula-registry.js';
import { getEraForZ, COSMIC_TIMELINE_MARKERS } from '../lab/theory-lab.js';
import { renderPhysicsFootnote } from '../research/physics-metadata.js';
import { t } from '../i18n/i18n.js';

function fmtNum(n, digits = 2) {
  if (!Number.isFinite(n)) return '—';
  return n.toFixed(digits);
}

function fmtSim(v) {
  if (typeof v !== 'number' || !Number.isFinite(v)) return '—';
  return v.toPrecision(4);
}

/** Mapeo nombre de fórmula → id de metadatos */
const FORMULA_META_MAP = {
  'Parámetro de Hubble H(a)': 'friedmann_h',
  'Horizonte de Schwarzschild': 'schwarzschild_rs',
  'Dilatación temporal (GR)': 'time_dilation',
  'Temperatura de Hawking': 'hawking_temperature',
  'Vida del agujero negro (Hawking)': 'hawking_lifetime',
  'Luminosidad Hawking': 'hawking_luminosity',
  'Pérdida de masa (Hawking)': 'hawking_mass_loss_rate',
  'Tiempo de Page': 'hawking_page_time',
  'Entropía de Bekenstein-Hawking': 'bekenstein_entropy',
  'Bits informacionales (Hawking)': 'hawking_information_bits',
  'Cota de Bekenstein': 'bekenstein_bound',
  'Strain GW (inspiral)': 'gw_strain_inspiral',
  'Pérdida energía orbital (Peters)': 'gw_energy_loss',
  'Masa reducida (binario)': 'reduced_mass',
  'Distancia comóvil': 'comoving_distance',
};

export function updateLabPanel(lab) {
  const panel = document.getElementById('lab-panel');
  if (!panel) return;
  const body = panel.querySelector('.panel-body') || panel;

  const results = lab.lastResults;
  const cosmo = lab.universe.cosmology;
  const z = cosmo.redshift;
  const era = getEraForZ(z);
  const rawAge = cosmo.universeAgeGyr?.();
  const ageGyr = Number.isFinite(rawAge) ? rawAge : 13.8;
  const aVal = Number.isFinite(cosmo.a) ? cosmo.a : 1;
  const ageStr = Number.isFinite(ageGyr) ? fmtNum(ageGyr) : '—';
  const aStr = Number.isFinite(cosmo.a) ? cosmo.a.toFixed(5) : '—';

  const byCategory = {};
  for (const r of results) {
    const cat = FORMULA_CATEGORIES[r.category] || r.category;
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(r);
  }

  let html = `
    <div class="lab-era" style="color:${era.color}">${era.name}</div>
    <div class="lab-age">${t('panels.lab.age')} <strong>${ageStr} Gyr</strong> · a=${aStr}</div>
    <div class="lab-timeline">${renderTimeline(z)}</div>
    <div class="lab-timeline-legend">${renderTimelineLegend(z)}</div>
  `;

  for (const [cat, items] of Object.entries(byCategory)) {
    html += `<div class="lab-category"><strong>${cat}</strong>`;
    for (const item of items) {
      const val = item.error ? `${t('panels.lab.error')} ${item.error}` : formatFormulaValue(item);
      const sim = item.result?.simValue !== undefined
        ? ` <span class="lab-sim">↔ ${fmtSim(item.result.simValue)}</span>`
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
    html += `<div class="lab-category"><strong>${t('panels.lab.validation')}</strong>`;
    for (const c of comparisons) {
      const icon = c.diffPercent < 2 ? '✓' : c.diffPercent < 10 ? '~' : '✗';
      const diff = Number.isFinite(c.diffPercent) ? `${c.diffPercent.toFixed(1)}%` : '—';
      html += `<div class="lab-compare">${icon} ${c.name}: Δ${diff}</div>`;
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

  modal.innerHTML = `<div class="exp-title">${t('experiment.title')}</div>${lines.join('')}`;
  modal.style.display = 'block';
  clearTimeout(modal._timer);
  modal._timer = setTimeout(() => { modal.style.display = 'none'; }, 10000);
}

import { showToast } from './toast.js';

export function showResetToast(msg) {
  showToast(msg);
}
