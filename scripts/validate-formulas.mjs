/**
 * Validación numérica de fórmulas del registro contra referencias analíticas.
 */
import { FORMULA_REGISTRY, buildFormulaContext } from '../src/physics/formula-registry.js';
import { Universe } from '../src/simulation/universe.js';
import { HorizonSimulator } from '../src/simulation/horizon-simulator.js';
import { SimulationEngine } from '../src/simulation/engine.js';
import { G, C, M_SUN } from '../src/physics/constants.js';
import { schwarzschildRadius } from '../src/physics/units.js';
import { sanitizeCosmologyParams } from '../src/physics/friedmann.js';

const HBAR = 1.055e-34;
const K_B = 1.381e-23;

const errors = [];
const passed = [];

function check(name, ok, detail = '') {
  if (ok) passed.push({ name, detail });
  else errors.push({ name, detail });
}

const u = new Universe();
u.setBlackHoleMass(10);
u.setCosmology(sanitizeCosmologyParams({ H0: 67.4, OmegaM: 0.315, OmegaLambda: 0.685 }));
const hs = new HorizonSimulator(u.rsVis);
const eng = new SimulationEngine(u);
const ctx = buildFormulaContext(u, hs, eng);

const M10 = 10 * M_SUN;
const rs = schwarzschildRadius(M10);

// Referencias analíticas
const refs = {
  rs,
  isco: 3 * rs,
  photon: 1.5 * rs,
  hawkingT: (HBAR * C ** 3) / (8 * Math.PI * G * M10 * K_B),
  H: 67.4,
  ageGyr: u.cosmology.universeAgeGyr(1),
};

for (const f of Object.values(FORMULA_REGISTRY)) {
  if (!f.enabled) continue;
  try {
    const r = f.compute(ctx);
    const finite = [r?.value, r?.display, r?.simValue].every(
      (v) => v === undefined || (typeof v === 'number' && Number.isFinite(v)),
    );
    check(`${f.id} finite`, finite, finite ? '' : 'NaN/Inf detected');
  } catch (e) {
    check(`${f.id} eval`, false, e.message);
  }
}

const rsF = FORMULA_REGISTRY.schwarzschild_rs.compute(ctx);
check('schwarzschild_rs', Math.abs(rsF.value - refs.rs) / refs.rs < 1e-9, `${rsF.value} vs ${refs.rs}`);

const iscoF = FORMULA_REGISTRY.isco.compute(ctx);
check('isco 3×rs', Math.abs(iscoF.display - 3) < 1e-6);

const photonF = FORMULA_REGISTRY.photon_sphere.compute(ctx);
check('photon_sphere 1.5×rs', Math.abs(photonF.display - 1.5) < 1e-6);

const hawkingF = FORMULA_REGISTRY.hawking_temperature.compute(ctx);
check('hawking_temperature', Math.abs(hawkingF.value - refs.hawkingT) / refs.hawkingT < 1e-6);

const Hf = FORMULA_REGISTRY.friedmann_H.compute(ctx);
check('friedmann_H', Math.abs(Hf.value - refs.H) < 0.01 && Math.abs(Hf.value - Hf.simValue) < 0.01);

const ageF = FORMULA_REGISTRY.universe_age.compute(ctx);
check(
  'universe_age integral',
  Math.abs(ageF.display - refs.ageGyr) / refs.ageGyr < 0.01,
  `${ageF.display} vs ${refs.ageGyr} Gyr`,
);

const rsVis = u.rsVis;
const r = 10 * rsVis;
const pred = Math.sqrt(1 - rsVis / r);
const td = FORMULA_REGISTRY.time_dilation.compute({ ...ctx, probeR: r, horizonDilation: pred });
check('time_dilation', Math.abs(td.value - pred) < 1e-9);

console.log('\n=== Formula Validation ===\n');
for (const p of passed) {
  console.log(`✓ ${p.name}${p.detail ? ` — ${p.detail}` : ''}`);
}
for (const e of errors) {
  console.error(`✗ ${e.name}${e.detail ? ` — ${e.detail}` : ''}`);
}
console.log(`\n${passed.length}/${passed.length + errors.length} passed`);
if (errors.length) process.exit(1);
