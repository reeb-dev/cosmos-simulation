/**
 * Auditoría estática rápida del proyecto CosmosSim.
 */
import { MODE_IDS, SIMULATION_MODES } from '../src/simulation/simulation-modes.js';
import { THEORY_IDS } from '../src/simulation/horizon-theories.js';
import { FORMULA_REGISTRY } from '../src/physics/formula-registry.js';
import { createCustomFormula } from '../src/lab/custom-formula.js';
import es from '../src/i18n/locales/es.js';
import en from '../src/i18n/locales/en.js';

const errors = [];
const checks = [];

function ok(name, detail = '') {
  checks.push({ name, ok: true, detail });
}

function fail(name, detail) {
  errors.push({ name, detail });
  checks.push({ name, ok: false, detail });
}

if (es.hud?.title && en.hud?.title && es.hud.title !== en.hud.title) ok('i18n HUD titles differ ES/EN');
else fail('i18n HUD', 'missing or identical titles');

if (MODE_IDS.length >= 7) ok('simulation modes', `${MODE_IDS.length} modes`);
else fail('simulation modes', `only ${MODE_IDS.length}`);

for (const id of MODE_IDS) {
  if (!SIMULATION_MODES[id]) fail(`mode ${id}`, 'missing config');
  else ok(`mode config ${id}`);
}

for (const id of MODE_IDS) {
  if (es.explainer?.modes?.[id]?.title) ok(`explainer ES ${id}`);
  else fail(`explainer ES ${id}`, 'missing');
}

if (THEORY_IDS.length >= 30) ok('horizon theories', `${THEORY_IDS.length} theories`);
else fail('horizon theories', `${THEORY_IDS.length}`);

for (const id of ['friedmann_h', 'schwarzschild_rs', 'hawking_temperature']) {
  const f = FORMULA_REGISTRY[id];
  if (!f?.compute) fail(`formula ${id}`, 'missing');
  else {
    const r = f.compute({ massKg: 2e31, H0: 70, a: 1, OmegaM: 0.3, OmegaLambda: 0.7, rsVis: 10, orbitR: 50 });
    if (r?.value == null && r?.simValue == null) fail(`formula ${id}`, 'no value');
    else ok(`formula ${id}`);
  }
}

try {
  const cf = createCustomFormula('test', 'sqrt(G * M / r)');
  const val = cf.compute({ massKg: 2e31, orbitRMeters: 1e6, G: 6.674e-11 });
  if (typeof val.value === 'number') ok('custom formula sqrt');
  else fail('custom formula', 'bad result');
} catch (e) {
  fail('custom formula', e.message);
}

for (const id of MODE_IDS) {
  if (es.modes?.[id]?.name && en.modes?.[id]?.name && es.modes[id].name !== en.modes[id].name) {
    ok(`i18n mode name ${id}`);
  } else {
    fail(`i18n mode ${id}`, 'EN name missing or equals ES');
  }
}

console.log('\n=== CosmosSim Audit ===\n');
for (const c of checks) {
  console.log(`${c.ok ? '✓' : '✗'} ${c.name}${c.detail ? ` — ${c.detail}` : ''}`);
}
console.log(`\nTotal: ${checks.filter((c) => c.ok).length}/${checks.length} passed`);
if (errors.length) {
  console.error(`\n${errors.length} issue(s) found`);
  process.exit(1);
}
console.log('\nAll checks passed.');
