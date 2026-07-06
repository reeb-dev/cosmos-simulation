import { evaluateAllFormulas, buildFormulaContext, FORMULA_REGISTRY } from '../physics/formula-registry.js';

export class TheoryLab {
  constructor(universe, horizonSim, engine) {
    this.universe = universe;
    this.horizonSim = horizonSim;
    this.engine = engine;
    this.customFormulas = [];
    this.experiments = [];
    this.lastResults = [];
    this.activePreset = 'lcdm';
  }

  setCustomFormulas(formulas) {
    this.customFormulas = formulas;
  }

  step() {
    const ctx = buildFormulaContext(this.universe, this.horizonSim, this.engine);
    this.lastResults = evaluateAllFormulas(ctx, this.customFormulas);
    return this.lastResults;
  }

  runExperiment(id) {
    const exp = EXPERIMENTS[id];
    if (!exp) return null;
    const ctx = buildFormulaContext(this.universe, this.horizonSim, this.engine);
    return exp.run(ctx, this.universe, this.horizonSim);
  }

  applyCosmologyPreset(preset) {
    const presets = {
      lcdm: { H0: 70, OmegaM: 0.3, OmegaLambda: 0.7 },
      planck2018: { H0: 67.4, OmegaM: 0.315, OmegaLambda: 0.685 },
      hubble_tension_high: { H0: 73, OmegaM: 0.3, OmegaLambda: 0.7 },
      hubble_tension_low: { H0: 67, OmegaM: 0.3, OmegaLambda: 0.7 },
      matter_dominated: { H0: 70, OmegaM: 1.0, OmegaLambda: 0 },
      lambda_only: { H0: 70, OmegaM: 0, OmegaLambda: 1 },
      einstein_de_sitter: { H0: 70, OmegaM: 1.0, OmegaLambda: 0 },
    };
    const p = presets[preset];
    if (p) {
      this.universe.setCosmology(p);
      this.activePreset = preset;
    }
    return p;
  }

  toggleFormula(id, enabled) {
    if (FORMULA_REGISTRY[id]) FORMULA_REGISTRY[id].enabled = enabled;
  }

  getComparisons() {
    return this.lastResults
      .filter((r) => r.result?.simValue !== undefined && r.result?.value !== undefined)
      .map((r) => {
        const predicted = r.result.value;
        const simulated = r.result.simValue;
        const diff = simulated !== 0 ? Math.abs((predicted - simulated) / simulated) * 100 : 0;
        return { name: r.name, predicted, simulated, diffPercent: diff };
      });
  }
}

export const EXPERIMENTS = {
  hubble_law: {
    name: 'Ley de Hubble',
    description: 'Verifica v = H·d para galaxias en el campo estelar',
    run: (ctx) => ({
      formula: 'v = H₀ × d',
      H0: ctx.H0,
      predictedVelocity: ctx.H0 * (ctx.dc / 3.086e22),
      unit: 'km/s',
    }),
  },
  time_dilation_test: {
    name: 'Dilatación en el horizonte',
    description: 'Compara √(1−rₛ/r) con la dilatación de la sonda/cámara',
    run: (ctx) => {
      const r = ctx.probeR;
      const rs = ctx.rsVis;
      const predicted = r > rs ? Math.sqrt(1 - rs / r) : 0;
      return {
        predicted,
        simulated: ctx.horizonDilation ?? 0,
        match: Math.abs(predicted - (ctx.horizonDilation ?? 0)) < 0.1,
      };
    },
  },
  friedmann_consistency: {
    name: 'Consistencia Friedmann',
    description: 'H simulado vs H(a) teórico',
    run: (ctx) => ({
      theoretical: ctx.H0 * Math.sqrt(ctx.OmegaM / ctx.a ** 3 + ctx.OmegaLambda),
      simulated: ctx.HNow,
      a: ctx.a,
      z: ctx.z,
    }),
  },
  hawking_vs_mass: {
    name: 'Hawking vs masa',
    description: 'T_H inversamente proporcional a M',
    run: (ctx) => {
      const HBAR = 1.055e-34;
      const K_B = 1.381e-23;
      const G = 6.674e-11;
      const C = 2.998e8;
      const T = (HBAR * C ** 3) / (8 * Math.PI * G * ctx.massKg * K_B);
      return { temperature_K: T, massSolar: ctx.massSolar, note: 'Más masa → menos radiación' };
    },
  },
  cosmic_resonance: {
    name: 'Resonancia H(z) en horizonte',
    description: 'Compara H simulado con el modo resonante H/H₀ para la teoría de eco cosmológico',
    run: (ctx) => {
      const Htheory = ctx.H0 * Math.sqrt(ctx.OmegaM / ctx.a ** 3 + ctx.OmegaLambda);
      const resonance = ctx.HNow / ctx.H0;
      const H0si = (ctx.H0 * 1000) / 3.086e22;
      return {
        H_simulado: ctx.HNow,
        H_teorico: Htheory,
        resonance_H_over_H0: resonance,
        periodo_Gyr: 1 / H0si / 3.156e7 / 1e9,
        z: ctx.z,
        a: ctx.a,
      };
    },
  },
  hawking_islands_page: {
    name: 'Islas de Hawking (Page time)',
    description: 'Estima τ_Page y fracción de recuperación de información para la masa simulada',
    run: (ctx) => {
      const HBAR = 1.055e-34;
      const G = 6.674e-11;
      const C = 2.998e8;
      const K_B = 1.381e-23;
      const rs = (2 * G * ctx.massKg) / (C * C);
      const A = 4 * Math.PI * rs * rs;
      const S = (K_B * C ** 3 * A) / (4 * G * HBAR);
      const tauPage = (512 * Math.PI * G ** 2 * ctx.massKg ** 3) / (HBAR * C ** 4);
      const tEvap = (5120 * Math.PI * G ** 2 * ctx.massKg ** 3) / (HBAR * C ** 4);
      return {
        entropia_kB: S / K_B,
        tau_Page_Gyr: tauPage / 3.156e7 / 1e9,
        t_evap_Gyr: tEvap / 3.156e7 / 1e9,
        masa_Msun: ctx.massSolar,
        nota: 'Page time ≈ mitad de la vida del agujero negro',
      };
    },
  },
  er_epr_entanglement: {
    name: 'ER=EPR (escala de puente)',
    description: 'Compara rₛ/l_P con el número de pares EPR informacionales',
    run: (ctx) => {
      const HBAR = 1.055e-34;
      const G = 6.674e-11;
      const C = 2.998e8;
      const K_B = 1.381e-23;
      const L_PLANCK = Math.sqrt((HBAR * G) / C ** 3);
      const rs = (2 * G * ctx.massKg) / (C * C);
      const A = 4 * Math.PI * rs * rs;
      const S = (K_B * C ** 3 * A) / (4 * G * HBAR);
      const pairs = S / (K_B * Math.LN2);
      return {
        rs_over_lp: rs / L_PLANCK,
        pares_EPR: pairs,
        bridge_scale_sqrt: Math.sqrt(rs / L_PLANCK),
        dilatacion: ctx.horizonDilation ?? 0,
      };
    },
  },
  planck_star_bounce: {
    name: 'Rebote estrella de Planck',
    description: 'Compara densidad media del BH con ρ_Planck y estima radio de rebote',
    run: (ctx) => {
      const HBAR = 1.055e-34;
      const G = 6.674e-11;
      const C = 2.998e8;
      const rs = (2 * G * ctx.massKg) / (C * C);
      const rhoP = (C ** 5) / (HBAR * G ** 2);
      const rhoBh = ctx.massKg / ((4 / 3) * Math.PI * rs ** 3);
      const bounceR = rs * Math.cbrt(rhoBh / rhoP);
      return {
        rho_Planck: rhoP,
        rho_BH: rhoBh,
        ratio: rhoBh / rhoP,
        radio_rebote_m: bounceR,
        masa_Msun: ctx.massSolar,
      };
    },
  },
  max_entropy_horizon: {
    name: 'Entropía máxima del horizonte',
    description: 'Calcula S_BH y bits informacionales desde la masa del agujero simulado',
    run: (ctx) => {
      const HBAR = 1.055e-34;
      const K_B = 1.381e-23;
      const G = 6.674e-11;
      const C = 2.998e8;
      const rs = (2 * G * ctx.massKg) / (C * C);
      const A = 4 * Math.PI * rs * rs;
      const S = (K_B * C ** 3 * A) / (4 * G * HBAR);
      const T = (HBAR * C ** 3) / (8 * Math.PI * G * ctx.massKg * K_B);
      return {
        entropia_kB: S / K_B,
        bits: S / (K_B * Math.LN2),
        T_Hawking_K: T,
        area_m2: A,
        masa_Msun: ctx.massSolar,
      };
    },
  },
};

export const COSMIC_ERAS = [
  { zMin: 1100, name: 'Recombinación (CMB)', color: '#ffaa44' },
  { zMin: 20, name: 'Era oscura', color: '#334466' },
  { zMin: 6, name: 'Primera luz', color: '#88aaff' },
  { zMin: 2, name: 'Formación galáctica', color: '#aa88ff' },
  { zMin: 0.5, name: 'Era estelar', color: '#66ffaa' },
  { zMin: 0, name: 'Presente', color: '#ffffff' },
];

export function getCosmicEra(z) {
  return getEraForZ(z);
}

export function getEraForZ(z) {
  for (const era of COSMIC_ERAS) {
    if (z >= era.zMin) return era;
  }
  return COSMIC_ERAS[COSMIC_ERAS.length - 1];
}
