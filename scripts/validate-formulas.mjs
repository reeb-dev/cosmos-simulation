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

const dMdtF = FORMULA_REGISTRY.hawking_mass_loss_rate.compute(ctx);
const LF = FORMULA_REGISTRY.hawking_luminosity.compute(ctx);
check('hawking_luminosity = c² dM/dt', Math.abs(LF.value - dMdtF.value * C ** 2) / LF.value < 1e-9);

const tEvapF = FORMULA_REGISTRY.hawking_lifetime.compute(ctx);
const pageF = FORMULA_REGISTRY.hawking_page_time.compute(ctx);
check('hawking_page_time = t_evap/10', Math.abs(pageF.value - tEvapF.value / 10) / tEvapF.value < 1e-9);

const peakF = FORMULA_REGISTRY.hawking_peak_wavelength.compute(ctx);
check('hawking_peak_wavelength Wien', Math.abs(peakF.value * refs.hawkingT - 2.898e-3) / 2.898e-3 < 1e-6);

const areaF = FORMULA_REGISTRY.hawking_horizon_area.compute(ctx);
check('hawking_horizon_area 4π rₛ²', Math.abs(areaF.value - 4 * Math.PI * rs ** 2) / areaF.value < 1e-9);

const boundF = FORMULA_REGISTRY.bekenstein_bound.compute(ctx);
check('bekenstein_bound saturated', Math.abs(boundF.display - 1) < 1e-6, `S/S_max=${boundF.display}`);

const kappaF = FORMULA_REGISTRY.hawking_surface_gravity.compute(ctx);
check('hawking_surface_gravity → T_H', Math.abs(kappaF.display - refs.hawkingT) / refs.hawkingT < 1e-6);

const bitsF = FORMULA_REGISTRY.hawking_information_bits.compute(ctx);
const Sref = FORMULA_REGISTRY.bekenstein_entropy.compute(ctx);
check('hawking_information_bits', Math.abs(bitsF.value - Sref.value / (K_B * Math.LN2)) / bitsF.value < 1e-9);

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

const kerr0 = FORMULA_REGISTRY.kerr_isco.compute({ ...ctx, spin: 0 });
check('kerr_isco spin=0', Math.abs(kerr0.display - 3) < 1e-6, `${kerr0.display} × rₛ`);

const kerr06 = FORMULA_REGISTRY.kerr_isco.compute({ ...ctx, spin: 0.6 });
check('kerr_isco spin=0.6', Math.abs(kerr06.display - 1.9145347094065754) < 1e-4, `${kerr06.display} × rₛ`);

const rInner = 3 * rs;
const Tref = ((3 * G * M10 * 1e17) / (8 * Math.PI * 5.670374419e-8 * rInner ** 3)) ** 0.25;
const diskT = FORMULA_REGISTRY.disk_temperature.compute({ ...ctx, orbitR: rInner, visScale: 1, mdot: 1e17 });
check('disk_temperature inner disk', Math.abs(diskT.value - Tref) / Tref < 1e-6, `${diskT.value} K`);

const muF = FORMULA_REGISTRY.reduced_mass.compute({ ...ctx, m1Solar: 36, m2Solar: 29 });
const muRef = (36 * 29 * M_SUN) / (36 + 29);
check('reduced_mass', Math.abs(muF.value - muRef) / muRef < 1e-9);

const McF = FORMULA_REGISTRY.chirp_mass.compute({ ...ctx, m1Solar: 36, m2Solar: 29 });
const m1 = 36 * M_SUN;
const m2 = 29 * M_SUN;
const McRef = (m1 * m2) ** (3 / 5) / (m1 + m2) ** (1 / 5);
check('chirp_mass GW150914', Math.abs(McF.value - McRef) / McRef < 1e-9);

const sepM = 80 * (u.visScale ?? 1e10);
const m1b = 30 * M_SUN;
const m2b = 20 * M_SUN;
const Mb = m1b + m2b;
const mub = (m1b * m2b) / Mb;
const dEdtRef = ((32 / 5) * G ** 4 * mub ** 2 * Mb ** 3) / (C ** 5 * sepM ** 5);
const dEdtF = FORMULA_REGISTRY.gw_energy_loss.compute({ ...ctx, m1Solar: 30, m2Solar: 20, separationVis: 80 });
check('gw_energy_loss Peters', Math.abs(dEdtF.value - dEdtRef) / dEdtRef < 1e-6);

const vOrb = Math.sqrt((G * Mb) / sepM);
const hRef = ((4 * G * mub) / (C ** 2 * sepM)) * (vOrb / C) ** 2;
const hF = FORMULA_REGISTRY.gw_strain_inspiral.compute({ ...ctx, m1Solar: 30, m2Solar: 20, separationVis: 80 });
check('gw_strain_inspiral', Math.abs(hF.value - hRef) / hRef < 1e-6, `h=${hF.value}`);

const omega = Math.sqrt((G * Mb) / sepM ** 3);
const fGwRef = (omega / (2 * Math.PI)) * 2;
const fGwF = FORMULA_REGISTRY.gw_frequency.compute({ ...ctx, m1Solar: 30, m2Solar: 20, separationVis: 80 });
check('gw_frequency', Math.abs(fGwF.value - fGwRef) / fGwRef < 1e-6);

const fQnm = FORMULA_REGISTRY.qnm_frequency.compute({ ...ctx, mergedMassSolar: 50, mergedSpin: 0.67 });
check('qnm_frequency', fQnm.value > 10 && fQnm.value < 1e5, `${fQnm.value} Hz`);

const formulaCount = Object.values(FORMULA_REGISTRY).filter((f) => f.enabled).length;
check('formula registry count', formulaCount >= 36, `${formulaCount} fórmulas`);

console.log('\n=== Formula Validation ===\n');
for (const p of passed) {
  console.log(`✓ ${p.name}${p.detail ? ` — ${p.detail}` : ''}`);
}
for (const e of errors) {
  console.error(`✗ ${e.name}${e.detail ? ` — ${e.detail}` : ''}`);
}
console.log(`\n${passed.length}/${passed.length + errors.length} passed`);
if (errors.length) process.exit(1);
