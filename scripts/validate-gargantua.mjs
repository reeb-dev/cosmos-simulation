/**
 * Validación física del modo Gargantua vs parámetros de Interestelar (Thorne / James et al.).
 */
import { FORMULA_REGISTRY } from '../src/physics/formula-registry.js';
import { GARGANTUA_VISUAL } from '../src/physics/gargantua-preset.js';
import { SIMULATION_MODES } from '../src/simulation/simulation-modes.js';
import { M_SUN } from '../src/physics/constants.js';

const INTERSTELLAR = {
  massSolar: 1e8,
  spinNarrative: 1 - 1.3e-14,
  spinVisual: 0.6,
};

function kerrIscoOverRs(spin) {
  const a = Math.min(0.998, Math.max(0, spin));
  const Z1 = 1 + (1 - a * a) ** (1 / 3) * ((1 + a) ** (1 / 3) + (1 - a) ** (1 / 3));
  const Z2 = Math.sqrt(3 * a * a + Z1 * Z1);
  return (3 + Z2 - Math.sqrt((3 - Z1) * (3 + Z1 + 2 * Z2))) / 2;
}

const errors = [];
const warnings = [];
const passed = [];

function ok(name, detail = '') {
  passed.push({ name, detail });
}
function warn(name, detail) {
  warnings.push({ name, detail });
}
function fail(name, detail) {
  errors.push({ name, detail });
}

const ctx = {
  massKg: GARGANTUA_VISUAL.massSolar * M_SUN,
  spin: GARGANTUA_VISUAL.spin,
};

const kerr = FORMULA_REGISTRY.kerr_isco.compute(ctx);
const iscoSchw = FORMULA_REGISTRY.isco.compute(ctx);
const photon = FORMULA_REGISTRY.photon_sphere.compute(ctx);
const rs = FORMULA_REGISTRY.schwarzschild_rs.compute(ctx);

if (Math.abs(iscoSchw.display - 3) < 1e-6) ok('Schwarzschild ISCO = 3 rₛ');
else fail('Schwarzschild ISCO', `got ${iscoSchw.display}`);

if (Math.abs(photon.display - 1.5) < 1e-6) ok('photon sphere = 1.5 rₛ (Schwarzschild)');
else fail('photon sphere', `got ${photon.display}`);

const expectedKerr = kerrIscoOverRs(GARGANTUA_VISUAL.spin);
if (Math.abs(kerr.display - expectedKerr) < 1e-5) {
  ok('kerr_isco registry', `${kerr.display.toFixed(4)} × rₛ @ spin ${GARGANTUA_VISUAL.spin}`);
} else {
  fail('kerr_isco registry', `${kerr.display} vs expected ${expectedKerr}`);
}

const iscoFilmVisual = kerrIscoOverRs(INTERSTELLAR.spinVisual);
const iscoFilmNarrative = kerrIscoOverRs(INTERSTELLAR.spinNarrative);
ok('Interestelar ISCO (spin visual 0.6)', `${iscoFilmVisual.toFixed(3)} × rₛ`);
ok('Interestelar ISCO (spin narrativa ~1)', `${iscoFilmNarrative.toFixed(3)} × rₛ`);

const innerMul = GARGANTUA_VISUAL.diskInnerMul;
const innerVsKerrSim = innerMul / kerr.display;
if (innerVsKerrSim < 1.35) {
  ok('disco inner vs ISCO Kerr sim', `${innerMul} rₛ / ISCO ${kerr.display.toFixed(3)} = ×${innerVsKerrSim.toFixed(2)}`);
} else {
  warn('disco inner vs ISCO Kerr sim', `inner ${innerMul} rₛ pero ISCO@${GARGANTUA_VISUAL.spin} = ${kerr.display.toFixed(3)} rₛ (×${innerVsKerrSim.toFixed(2)} demasiado lejos)`);
}

const innerVsFilm = innerMul / iscoFilmVisual;
if (GARGANTUA_VISUAL.spin === INTERSTELLAR.spinVisual && innerVsFilm < 1.15) {
  ok('disco inner vs ISCO película (spin 0.6)');
} else if (GARGANTUA_VISUAL.spin !== INTERSTELLAR.spinVisual) {
  warn('spin preset', `sim ${GARGANTUA_VISUAL.spin} ≠ spin visual película ${INTERSTELLAR.spinVisual} (Nolan/Thorne redujeron spin en pantalla)`);
}

if (GARGANTUA_VISUAL.massSolar < INTERSTELLAR.massSolar) {
  warn('masa visual', `${GARGANTUA_VISUAL.massSolar} M☉ en sim vs ${INTERSTELLAR.massSolar.toExponential(0)} M☉ de Gargantua (escala pedagógica; rₛ SI sigue siendo correcto)`);
}

const modeCam = SIMULATION_MODES.gargantua.camera;
const presetCam = GARGANTUA_VISUAL.camera;
if (modeCam.z === presetCam.z) ok('cámara unificada', `z=${presetCam.z}`);
else fail('cámara', 'modo y preset desincronizados');

console.log('\n=== Gargantua / Interstellar Validation ===\n');
for (const p of passed) console.log(`✓ ${p.name}${p.detail ? ` — ${p.detail}` : ''}`);
for (const w of warnings) console.warn(`⚠ ${w.name} — ${w.detail}`);
for (const e of errors) console.error(`✗ ${e.name} — ${e.detail}`);
console.log(`\n${passed.length} passed, ${warnings.length} warnings, ${errors.length} errors`);
if (errors.length) process.exit(1);
