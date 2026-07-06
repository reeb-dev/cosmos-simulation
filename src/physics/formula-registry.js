import { C, G, M_SUN } from './constants.js';
import { schwarzschildRadius, schwarzschildRadiusVis } from './units.js';

/** Constantes físicas adicionales */
export const HBAR = 1.055e-34;
export const K_B = 1.381e-23;
export const MPC = 3.086e22;

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
      const r = ctx.probeR || ctx.rsVis * 10;
      const rs = schwarzschildRadiusVis(ctx.massSolar);
      const ratio = r / rs;
      const dilation = ratio > 1 ? Math.sqrt(1 - 1 / ratio) : 0;
      return { value: dilation, unit: 'adim', simValue: ctx.horizonDilation };
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
    name: 'Edad del universo (aprox.)',
    latex: 't_0 \\approx \\frac{1}{H_0} \\cdot f(\\Omega)',
    category: 'cosmologia',
    enabled: true,
    compute: (ctx) => {
      const H0si = (ctx.H0 * 1000) / MPC;
      const omega = ctx.OmegaM + ctx.OmegaLambda;
      const age = (1 / H0si) * (2 / 3) * (1 / Math.sqrt(omega));
      return { value: age, unit: 's', display: age / (3.156e7 * 1e9), displayUnit: 'Gyr' };
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
    latex: 'r_{ISCO} \\approx r_{s}\\left(3 + Z_2 \\mp \\sqrt{(3-Z_1)(3+Z_1+2Z_2)}\\right)',
    category: 'agujero_negro',
    enabled: true,
    compute: (ctx) => {
      const a = Math.min(0.998, Math.max(0, ctx.spin || 0));
      const rs = schwarzschildRadius(ctx.massKg);
      const Z1 = 1 + (1 - a * a) ** (1 / 3) * ((1 + a) ** (1 / 3) + (1 - a) ** (1 / 3));
      const Z2 = Math.sqrt(3 * a * a + Z1 * Z1);
      const rIsco = rs * (3 + Z2 - Math.sqrt((3 - Z1) * (3 + Z1 + 2 * Z2)));
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
};

export const FORMULA_CATEGORIES = {
  agujero_negro: 'Agujero negro',
  gravedad: 'Gravedad',
  cosmologia: 'Cosmología',
  cuantica: 'Cuántica / Hawking',
  lensing: 'Lensing',
  custom: 'Personalizada',
};

export function buildFormulaContext(universe, horizonSim, engine) {
  const rs = universe.rsVis;
  const readouts = universe.getReadouts();
  return {
    massSolar: universe.blackHoleMassSolar,
    massKg: universe.massKg,
    rsVis: rs,
    visScale: 1e10,
    spin: universe.spin || 0,
    a: readouts.a,
    z: readouts.z,
    H0: universe.cosmology.H0,
    OmegaM: universe.cosmology.OmegaM,
    OmegaLambda: universe.cosmology.OmegaLambda,
    HNow: readouts.H,
    dc: readouts.dc,
    orbitR: rs * 25,
    probeR: horizonSim?.probeRadius ?? rs * 10,
    impactParam: rs * 5 * (universe.visScale || 1e10) / 1e10,
    horizonDilation: horizonSim?.effectiveTimeDilation,
  };
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

export function formatFormulaValue(result) {
  if (!result?.result) return '—';
  const r = result.result;
  if (r.display !== undefined) return `${r.display.toExponential(3)} ${r.displayUnit || ''}`;
  if (Math.abs(r.value) < 1e-3 || Math.abs(r.value) > 1e6) return `${r.value.toExponential(3)} ${r.unit}`;
  return `${r.value.toFixed(4)} ${r.unit}`;
}
