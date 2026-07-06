/**
 * Auditoría estática rápida del proyecto CosmosSim.
 */
import { MODE_IDS, SIMULATION_MODES } from '../src/simulation/simulation-modes.js';
import { THEORY_IDS } from '../src/simulation/horizon-theories.js';
import { FORMULA_REGISTRY } from '../src/physics/formula-registry.js';
import { createCustomFormula } from '../src/lab/custom-formula.js';
import { GARGANTUA_VISUAL, gargantuaAngularRs } from '../src/physics/gargantua-preset.js';
import { getRealismProfile } from '../src/physics/realism-profiles.js';
import { schwarzschildRadiusVis } from '../src/physics/units.js';
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

for (const id of ['friedmann_H', 'schwarzschild_rs', 'hawking_temperature', 'hawking_luminosity', 'hawking_page_time', 'bekenstein_bound', 'gw_strain_inspiral', 'gw_energy_loss', 'disk_temperature', 'qnm_frequency', 'reduced_mass', 'kerr_isco']) {
  const f = FORMULA_REGISTRY[id];
  if (!f?.compute) fail(`formula ${id}`, 'missing');
  else {
    const r = f.compute({ massKg: 2e31, H0: 70, a: 1, OmegaM: 0.3, OmegaLambda: 0.7, rsVis: 10, orbitR: 50, HNow: 70, m1Solar: 30, m2Solar: 20, separationVis: 80, visScale: 1e10 });
    if (r?.value == null && r?.simValue == null && r?.display == null) fail(`formula ${id}`, 'no value');
    else ok(`formula ${id}`);
  }
}

const enabledFormulas = Object.values(FORMULA_REGISTRY).filter((f) => f.enabled).length;
if (enabledFormulas >= 36) ok('formula registry coverage', `${enabledFormulas} enabled`);
else fail('formula registry coverage', `only ${enabledFormulas}`);

try {
  const cf = createCustomFormula('test', 'sqrt(G * M / r)');
  const val = cf.compute({ massKg: 2e31, orbitR: 50, rsVis: 10, visScale: 1e10 });
  if (typeof val.value === 'number' && Number.isFinite(val.value)) ok('custom formula sqrt');
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

{
  const modeCam = SIMULATION_MODES.gargantua?.camera;
  const presetCam = GARGANTUA_VISUAL.camera;
  if (
    modeCam?.z === presetCam.z &&
    modeCam?.y === presetCam.y &&
    modeCam?.x === presetCam.x
  ) {
    ok('gargantua camera sync preset/mode');
  } else {
    fail('gargantua camera sync', 'simulation-modes vs gargantua-preset mismatch');
  }

  const rs = schwarzschildRadiusVis(GARGANTUA_VISUAL.massSolar);
  const angRs = gargantuaAngularRs(rs, presetCam.z);
  if (angRs < 0.14) ok('gargantua angular rs', angRs.toFixed(3));
  else fail('gargantua angular rs', `too large: ${angRs.toFixed(3)} (max 0.14)`);

  const diskAng = (rs * GARGANTUA_VISUAL.diskOuterMul) / presetCam.z;
  if (diskAng < 0.52) ok('gargantua disk angular', diskAng.toFixed(3));
  else fail('gargantua disk angular', `too large: ${diskAng.toFixed(3)}`);

  const profile = getRealismProfile('gargantua');
  if (profile.diskOuterMul === GARGANTUA_VISUAL.diskOuterMul) {
    ok('gargantua profile diskOuterMul');
  } else {
    fail('gargantua profile', 'diskOuterMul mismatch with preset');
  }

  if (GARGANTUA_VISUAL.massSolar >= 40 && GARGANTUA_VISUAL.massSolar <= 80) {
    ok('gargantua mass range', `${GARGANTUA_VISUAL.massSolar} M☉`);
  } else {
    fail('gargantua mass', `out of cinematic range: ${GARGANTUA_VISUAL.massSolar}`);
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
