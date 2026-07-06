import { C, G, M_SUN, DEFAULT_BLACK_HOLE, DEFAULT_COSMOLOGY } from './constants.js';
import { schwarzschildRadius, schwarzschildRadiusVis, massFromSolar } from './units.js';
import { qnmFrequencyHz } from './realism-profiles.js';

/** Constantes físicas adicionales */
export const HBAR = 1.055e-34;
export const K_B = 1.381e-23;
export const MPC = 3.086e22;
/** Constante de Stefan-Boltzmann */
export const SIGMA_SB = 5.670374419e-8;

function binaryMasses(ctx) {
  const m1 = Math.max(safeNum(ctx.m1Solar, 30), 0.1) * M_SUN;
  const m2 = Math.max(safeNum(ctx.m2Solar, 20), 0.1) * M_SUN;
  return { m1, m2, M: m1 + m2, mu: (m1 * m2) / (m1 + m2) };
}

function separationMeters(ctx) {
  const vis = safeNum(ctx.separationVis ?? ctx.orbitR, safeRs(ctx) * 25);
  return vis * safeNum(ctx.visScale, 1e10);
}

function safeNum(v, fallback = 0) {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

function safeRs(ctx) {
  return Math.max(safeNum(ctx.rsVis, schwarzschildRadiusVis(DEFAULT_BLACK_HOLE.massSolar)), 1e-12);
}

/**
 * Registro de fórmulas científicas.
 * Cada fórmula tiene: id, nombre, latex, categoría, compute(ctx), enabled
 */
export const FORMULA_REGISTRY = {
  schwarzschild_rs: {
    id: 'schwarzschild_rs',
    name: 'Horizonte de Schwarzschild',
    latex: 'r_s = \\frac{2GM}{c^2}',
    category: 'agujero_negro',
    enabled: true,
    compute: (ctx) => {
      const rs = (2 * G * ctx.massKg) / (C * C);
      return { value: rs, unit: 'm', simValue: schwarzschildRadius(ctx.massKg) };
    },
  },
  kepler_velocity: {
    id: 'kepler_velocity',
    name: 'Velocidad orbital (Kepler)',
    latex: 'v = \\sqrt{\\frac{GM}{r}}',
    category: 'gravedad',
    enabled: true,
    compute: (ctx) => {
      const r = ctx.orbitR || ctx.rsVis * 25;
      const rM = r * (ctx.visScale || 1e10);
      const v = Math.sqrt((G * ctx.massKg) / rM);
      return { value: v, unit: 'm/s', label: `r=${r.toFixed(1)} u.vis` };
    },
  },
  escape_velocity: {
    id: 'escape_velocity',
    name: 'Velocidad de escape',
    latex: 'v_{esc} = \\sqrt{\\frac{2GM}{r}}',
    category: 'gravedad',
    enabled: true,
    compute: (ctx) => {
      const r = ctx.orbitR || ctx.rsVis * 25;
      const rM = r * (ctx.visScale || 1e10);
      const v = Math.sqrt((2 * G * ctx.massKg) / rM);
      return { value: v, unit: 'm/s' };
    },
  },
  time_dilation: {
    id: 'time_dilation',
    name: 'Dilatación temporal (GR)',
    latex: 'd\\tau = dt\\sqrt{1 - \\frac{r_s}{r}}',
    category: 'agujero_negro',
    enabled: true,
    compute: (ctx) => {
      const rs = safeRs(ctx);
      const r = Math.max(safeNum(ctx.probeR, rs * 10), rs * 1.001);
      const ratio = r / rs;
      const dilation = ratio > 1 ? Math.sqrt(Math.max(0, 1 - 1 / ratio)) : 0;
      const sim = safeNum(ctx.horizonDilation, dilation);
      return { value: dilation, unit: 'adim', simValue: sim };
    },
  },
  isco: {
    id: 'isco',
    name: 'ISCO (órbita estable más interna)',
    latex: 'r_{ISCO} = 6\\frac{GM}{c^2} = 3r_s',
    category: 'agujero_negro',
    enabled: true,
    compute: (ctx) => {
      const isco = (6 * G * ctx.massKg) / (C * C);
      return { value: isco, unit: 'm', display: isco / schwarzschildRadius(ctx.massKg), displayUnit: '× rₛ' };
    },
  },
  photon_sphere: {
    id: 'photon_sphere',
    name: 'Esfera de fotones',
    latex: 'r_{fotón} = \\frac{3GM}{c^2} = 1.5\\,r_s',
    category: 'agujero_negro',
    enabled: true,
    compute: (ctx) => {
      const rp = (3 * G * ctx.massKg) / (C * C);
      return { value: rp, unit: 'm', display: 1.5, displayUnit: '× rₛ' };
    },
  },
  hawking_temperature: {
    id: 'hawking_temperature',
    name: 'Temperatura de Hawking',
    latex: 'T_H = \\frac{\\hbar c^3}{8\\pi G M k_B}',
    category: 'cuantica',
    enabled: true,
    compute: (ctx) => {
      const T = (HBAR * C ** 3) / (8 * Math.PI * G * ctx.massKg * K_B);
      return { value: T, unit: 'K' };
    },
  },
  hawking_lifetime: {
    id: 'hawking_lifetime',
    name: 'Vida del agujero negro (Hawking)',
    latex: 't_{evap} \\approx \\frac{5120\\pi G^2 M^3}{\\hbar c^4}',
    category: 'cuantica',
    enabled: true,
    compute: (ctx) => {
      const M = ctx.massKg;
      const t = (5120 * Math.PI * G ** 2 * M ** 3) / (HBAR * C ** 4);
      return { value: t, unit: 's', display: t / (3.156e7 * 1e9), displayUnit: 'Gyr' };
    },
  },
  lensing_deflection: {
    id: 'lensing_deflection',
    name: 'Deflexión gravitacional',
    latex: '\\alpha = \\frac{4GM}{c^2 b}',
    category: 'lensing',
    enabled: true,
    compute: (ctx) => {
      const b = ctx.impactParam || schwarzschildRadius(ctx.massKg) * 5;
      const alpha = (4 * G * ctx.massKg) / (C * C * b);
      return { value: alpha, unit: 'rad', display: (alpha * 180) / Math.PI, displayUnit: '°' };
    },
  },
  friedmann_H: {
    id: 'friedmann_H',
    name: 'Parámetro de Hubble H(a)',
    latex: 'H(a) = H_0\\sqrt{\\Omega_m a^{-3} + \\Omega_\\Lambda}',
    category: 'cosmologia',
    enabled: true,
    compute: (ctx) => {
      const a = ctx.a || 1;
      const H = ctx.H0 * Math.sqrt(ctx.OmegaM / a ** 3 + ctx.OmegaLambda);
      return { value: H, unit: 'km/s/Mpc', simValue: ctx.HNow };
    },
  },
  friedmann_q: {
    id: 'friedmann_q',
    name: 'Parámetro de desaceleración',
    latex: 'q = \\frac{\\Omega_m}{2a^3 H^2/H_0^2} - \\Omega_\\Lambda \\frac{H^2}{H_0^2}',
    category: 'cosmologia',
    enabled: true,
    compute: (ctx) => {
      const a = ctx.a || 1;
      const E = Math.sqrt(ctx.OmegaM / a ** 3 + ctx.OmegaLambda);
      const q = ctx.OmegaM / (2 * a ** 3 * E ** 2) - ctx.OmegaLambda;
      return { value: q, unit: 'adim' };
    },
  },
  critical_density: {
    id: 'critical_density',
    name: 'Densidad crítica',
    latex: '\\rho_c = \\frac{3H_0^2}{8\\pi G}',
    category: 'cosmologia',
    enabled: true,
    compute: (ctx) => {
      const H0si = (ctx.H0 * 1000) / MPC;
      const rho = (3 * H0si ** 2) / (8 * Math.PI * G);
      return { value: rho, unit: 'kg/m³', display: rho / 1e-26, displayUnit: '×10⁻²⁶ kg/m³' };
    },
  },
  hubble_distance: {
    id: 'hubble_distance',
    name: 'Distancia de Hubble',
    latex: 'D_H = \\frac{c}{H_0}',
    category: 'cosmologia',
    enabled: true,
    compute: (ctx) => {
      const H0si = (ctx.H0 * 1000) / MPC;
      const d = C / H0si;
      return { value: d, unit: 'm', display: d / MPC, displayUnit: 'Mpc' };
    },
  },
  redshift: {
    id: 'redshift',
    name: 'Redshift cosmológico',
    latex: 'z = \\frac{1}{a} - 1',
    category: 'cosmologia',
    enabled: true,
    compute: (ctx) => {
      const z = 1 / (ctx.a || 1) - 1;
      return { value: z, unit: 'adim', simValue: ctx.z };
    },
  },
  comoving_distance: {
    id: 'comoving_distance',
    name: 'Distancia comóvil',
    latex: 'd_c = c\\int_0^z \\frac{dz\'}{H(z\')}',
    category: 'cosmologia',
    enabled: true,
    compute: (ctx) => ({
      value: ctx.dc || 0,
      unit: 'm',
      display: (ctx.dc || 0) / MPC,
      displayUnit: 'Mpc',
    }),
  },
  universe_age: {
    id: 'universe_age',
    name: 'Edad del universo (ΛCDM)',
    latex: 't_0 = \\int_0^{a} \\frac{da\'}{a\' H(a\')}',
    category: 'cosmologia',
    enabled: true,
    compute: (ctx) => {
      const ageGyr = safeNum(ctx.universeAgeGyr, 0);
      const age = ageGyr * 3.156e16;
      return { value: age, unit: 's', display: ageGyr, displayUnit: 'Gyr', simValue: ageGyr };
    },
  },
  tidal_force: {
    id: 'tidal_force',
    name: 'Fuerza de marea',
    latex: 'a_{marea} \\approx \\frac{2GM\\,\\Delta r}{r^3}',
    category: 'agujero_negro',
    enabled: true,
    compute: (ctx) => {
      const r = ctx.orbitR || ctx.rsVis * 10;
      const rM = r * (ctx.visScale || 1e10);
      const dr = 2;
      const a = (2 * G * ctx.massKg * dr) / (rM ** 3);
      return { value: a, unit: 'm/s²' };
    },
  },
  kerr_isco: {
    id: 'kerr_isco',
    name: 'ISCO Kerr (aprox. spin a)',
    latex: 'r_{ISCO} = \\frac{r_s}{2}\\left(3 + Z_2 - \\sqrt{(3-Z_1)(3+Z_1+2Z_2)}\\right)',
    category: 'agujero_negro',
    enabled: true,
    compute: (ctx) => {
      const a = Math.min(0.998, Math.max(0, ctx.spin || 0));
      const rs = schwarzschildRadius(ctx.massKg);
      const Z1 = 1 + (1 - a * a) ** (1 / 3) * ((1 + a) ** (1 / 3) + (1 - a) ** (1 / 3));
      const Z2 = Math.sqrt(3 * a * a + Z1 * Z1);
      const rIsco = (rs / 2) * (3 + Z2 - Math.sqrt((3 - Z1) * (3 + Z1 + 2 * Z2)));
      return { value: rIsco, unit: 'm', display: rIsco / rs, displayUnit: '× rₛ' };
    },
  },
  bekenstein_entropy: {
    id: 'bekenstein_entropy',
    name: 'Entropía de Bekenstein-Hawking',
    latex: 'S = \\frac{k_B c^3 A}{4G\\hbar} = \\frac{k_B 4\\pi r_s^2 c^3}{4G\\hbar}',
    category: 'cuantica',
    enabled: true,
    compute: (ctx) => {
      const rs = schwarzschildRadius(ctx.massKg);
      const A = 4 * Math.PI * rs * rs;
      const S = (K_B * C ** 3 * A) / (4 * G * HBAR);
      return { value: S, unit: 'J/K', display: S / K_B, displayUnit: '×k_B' };
    },
  },
  string_tension: {
    id: 'string_tension',
    name: 'Tensión de cuerda (simbólica)',
    latex: 'T \\sim \\frac{1}{2\\pi\\alpha\' l_s^2},\\quad \\alpha\' \\sim l_P^2',
    category: 'cuantica',
    enabled: true,
    compute: (ctx) => {
      const L_PLANCK = Math.sqrt((HBAR * G) / C ** 3);
      const alphaPrime = L_PLANCK ** 2;
      const ls = L_PLANCK;
      const T = 1 / (2 * Math.PI * alphaPrime * ls ** 2);
      const rs = schwarzschildRadius(ctx.massKg);
      const gs = Math.min(1, 1 / Math.cbrt(rs / L_PLANCK));
      return { value: T, unit: 'N (simb.)', display: gs, displayUnit: 'g_s' };
    },
  },
  orbital_period: {
    id: 'orbital_period',
    name: 'Período orbital (Kepler)',
    latex: 'T = 2\\pi\\sqrt{\\frac{r^3}{GM}}',
    category: 'gravedad',
    enabled: true,
    compute: (ctx) => {
      const r = ctx.orbitR || ctx.rsVis * 25;
      const rM = r * (ctx.visScale || 1e10);
      const T = 2 * Math.PI * Math.sqrt(rM ** 3 / (G * ctx.massKg));
      return { value: T, unit: 's', display: T / 3600, displayUnit: 'h' };
    },
  },
  disk_temperature: {
    id: 'disk_temperature',
    name: 'Temperatura disco (Shakura-Sunyaev)',
    latex: 'T \\propto \\left(\\frac{3GM\\dot{m}}{8\\pi\\sigma r^3}\\right)^{1/4}',
    category: 'agujero_negro',
    enabled: true,
    compute: (ctx) => {
      const rM = safeRadiusVis(ctx, 3) * safeNum(ctx.visScale, 1e10);
      const mdot = safeNum(ctx.mdot, 1e17);
      const T = ((3 * G * ctx.massKg * mdot) / (8 * Math.PI * SIGMA_SB * rM ** 3)) ** 0.25;
      return { value: T, unit: 'K', display: T / 1e6, displayUnit: '×10⁶ K' };
    },
  },
  reduced_mass: {
    id: 'reduced_mass',
    name: 'Masa reducida (binario)',
    latex: '\\mu = \\frac{m_1 m_2}{m_1 + m_2}',
    category: 'ondas_gw',
    enabled: true,
    compute: (ctx) => {
      const { mu, M } = binaryMasses(ctx);
      return { value: mu, unit: 'kg', display: mu / M_SUN, displayUnit: 'M☉' };
    },
  },
  chirp_mass: {
    id: 'chirp_mass',
    name: 'Masa de chirp',
    latex: '\\mathcal{M} = \\frac{(m_1 m_2)^{3/5}}{(m_1 + m_2)^{1/5}}',
    category: 'ondas_gw',
    enabled: true,
    compute: (ctx) => {
      const { m1, m2, M } = binaryMasses(ctx);
      const Mc = (m1 * m2) ** (3 / 5) / M ** (1 / 5);
      return { value: Mc, unit: 'kg', display: Mc / M_SUN, displayUnit: 'M☉' };
    },
  },
  gw_energy_loss: {
    id: 'gw_energy_loss',
    name: 'Pérdida energía orbital (Peters)',
    latex: '\\frac{dE}{dt} = -\\frac{32}{5}\\frac{G^4\\mu^2 M^3}{c^5 a^5}',
    category: 'ondas_gw',
    enabled: true,
    compute: (ctx) => {
      const { m1, m2, M, mu } = binaryMasses(ctx);
      const sepM = separationMeters(ctx);
      const dEdt = ((32 / 5) * G ** 4 * mu ** 2 * M ** 3) / (C ** 5 * sepM ** 5);
      return { value: dEdt, unit: 'J/s' };
    },
  },
  gw_strain_inspiral: {
    id: 'gw_strain_inspiral',
    name: 'Strain GW (inspiral)',
    latex: 'h \\sim \\frac{4G\\mu}{c^2 r}\\left(\\frac{v}{c}\\right)^2',
    category: 'ondas_gw',
    enabled: true,
    compute: (ctx) => {
      const { m1, m2, M, mu } = binaryMasses(ctx);
      const sepM = separationMeters(ctx);
      const v = Math.sqrt((G * M) / sepM);
      const h = ((4 * G * mu) / (C ** 2 * sepM)) * (v / C) ** 2;
      return { value: h, unit: 'adim', simValue: ctx.gwStrain };
    },
  },
  gw_frequency: {
    id: 'gw_frequency',
    name: 'Frecuencia GW (chirp)',
    latex: 'f_{GW} \\approx 2 f_{orb} = \\frac{1}{\\pi}\\sqrt{\\frac{GM}{a^3}}',
    category: 'ondas_gw',
    enabled: true,
    compute: (ctx) => {
      const { m1, m2, M } = binaryMasses(ctx);
      const sepM = separationMeters(ctx);
      const omega = Math.sqrt((G * M) / sepM ** 3);
      const fGw = (omega / (2 * Math.PI)) * 2;
      return { value: fGw, unit: 'Hz', simValue: ctx.gwFrequency };
    },
  },
  qnm_frequency: {
    id: 'qnm_frequency',
    name: 'Frecuencia QNM (ringdown)',
    latex: 'f_{QNM} \\approx f_{geom}\\,(0.3737 + 0.127\\,a)',
    category: 'ondas_gw',
    enabled: true,
    compute: (ctx) => {
      const mSolar = safeNum(ctx.mergedMassSolar, ctx.massSolar);
      const spin = safeNum(ctx.mergedSpin ?? ctx.spin, 0.67);
      const f = qnmFrequencyHz(mSolar, spin);
      return { value: f, unit: 'Hz' };
    },
  },
};

export const FORMULA_CATEGORIES = {
  agujero_negro: 'Agujero negro',
  gravedad: 'Gravedad',
  cosmologia: 'Cosmología',
  cuantica: 'Cuántica / Hawking',
  lensing: 'Lensing',
  ondas_gw: 'Ondas gravitacionales',
  custom: 'Personalizada',
};

function safeMassKg(ctx) {
  const massSolar = safeNum(ctx.massSolar, DEFAULT_BLACK_HOLE.massSolar);
  return Math.max(safeNum(ctx.massKg, massFromSolar(massSolar)), 1e-30);
}

function safeRadiusVis(ctx, factor, minRsMul = 1.001) {
  const rs = safeRs(ctx);
  return Math.max(safeNum(ctx.orbitR ?? ctx.probeR, rs * factor), rs * minRsMul);
}

export function buildFormulaContext(universe, horizonSim, engine, binarySim = null) {
  const massSolar = safeNum(universe?.blackHoleMassSolar, DEFAULT_BLACK_HOLE.massSolar);
  const rs = Math.max(safeNum(universe?.rsVis, schwarzschildRadiusVis(massSolar)), 1e-12);
  const massKg = Math.max(safeNum(universe?.massKg, massFromSolar(massSolar)), 1e-30);
  const readouts = universe?.getReadouts?.() ?? {};
  const cosmo = universe?.cosmology ?? {};
  const H0 = safeNum(cosmo.H0, DEFAULT_COSMOLOGY.H0);
  const OmegaM = safeNum(cosmo.OmegaM, DEFAULT_COSMOLOGY.OmegaM);
  const OmegaLambda = safeNum(cosmo.OmegaLambda, DEFAULT_COSMOLOGY.OmegaLambda);
  const a = Math.max(safeNum(readouts.a, 1), 1e-12);
  const visScale = safeNum(ctxVisScale(engine), 1e10);

  return {
    massSolar,
    massKg,
    rsVis: rs,
    visScale,
    spin: safeNum(universe?.spin, 0),
    a,
    z: safeNum(readouts.z, 0),
    H0,
    OmegaM,
    OmegaLambda,
    HNow: safeNum(readouts.H, H0),
    dc: safeNum(readouts.dc, 0),
    universeAgeGyr: safeNum(cosmo.universeAgeGyr?.(), 0),
    orbitR: rs * 25,
    probeR: Math.max(safeNum(horizonSim?.probeRadius, rs * 10), rs * 1.001),
    impactParam: Math.max(rs * 5, schwarzschildRadius(massKg) * 0.01),
    horizonDilation: safeNum(horizonSim?.effectiveTimeDilation, 1),
    m1Solar: safeNum(binarySim?.m1Solar, 30),
    m2Solar: safeNum(binarySim?.m2Solar, 20),
    separationVis: safeNum(binarySim?.separationVis, rs * 25),
    mergedMassSolar: safeNum(binarySim?.mergedMassSolar, massSolar),
    mergedSpin: safeNum(binarySim?.mergedSpin, safeNum(universe?.spin, 0)),
    gwStrain: safeNum(binarySim?.lastPhysicalStrain, undefined),
    gwFrequency: safeNum(binarySim?.lastFrequency, undefined),
  };
}

function ctxVisScale(engine) {
  return engine?.universe?.visScale ?? 1e10;
}

export function evaluateAllFormulas(ctx, customFormulas = []) {
  const results = [];
  for (const f of Object.values(FORMULA_REGISTRY)) {
    if (!f.enabled) continue;
    try {
      const r = f.compute(ctx);
      results.push({ ...f, result: r, error: null });
    } catch (e) {
      results.push({ ...f, result: null, error: e.message });
    }
  }
  for (const cf of customFormulas) {
    if (!cf.enabled) continue;
    try {
      const r = cf.compute(ctx);
      results.push({ ...cf, result: r, error: null });
    } catch (e) {
      results.push({ ...cf, result: null, error: e.message });
    }
  }
  return results;
}

function fmtNum(n) {
  if (!Number.isFinite(n)) return '—';
  if (Math.abs(n) < 1e-3 || Math.abs(n) > 1e6) return n.toExponential(3);
  return n.toFixed(4);
}

export function formatFormulaValue(result) {
  if (!result?.result) return '—';
  const r = result.result;
  if (r.display !== undefined) {
    const disp = fmtNum(r.display);
    if (disp === '—') return '—';
    return `${disp} ${r.displayUnit || ''}`.trim();
  }
  const val = fmtNum(r.value);
  if (val === '—') return '—';
  return `${val} ${r.unit || ''}`.trim();
}
