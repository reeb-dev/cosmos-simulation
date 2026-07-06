import { C } from './constants.js';
import { DEFAULT_COSMOLOGY } from './constants.js';
import { h0ToSI } from './units.js';

function clampA(a) {
  return Math.max(Number.isFinite(a) ? a : 1, 1e-6);
}

function safeNum(v, fallback) {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

/** Normaliza parámetros ΛCDM para evitar H=0 o densidades inválidas. */
export function sanitizeCosmologyParams({
  H0 = DEFAULT_COSMOLOGY.H0,
  OmegaM = DEFAULT_COSMOLOGY.OmegaM,
  OmegaLambda = DEFAULT_COSMOLOGY.OmegaLambda,
  OmegaK = 0,
} = {}) {
  let Om = Math.max(0, safeNum(OmegaM, DEFAULT_COSMOLOGY.OmegaM));
  let Ol = Math.max(0, safeNum(OmegaLambda, DEFAULT_COSMOLOGY.OmegaLambda));
  const H = Math.max(1, safeNum(H0, DEFAULT_COSMOLOGY.H0));
  const sum = Om + Ol;
  if (sum < 1e-6) {
    Om = DEFAULT_COSMOLOGY.OmegaM;
    Ol = DEFAULT_COSMOLOGY.OmegaLambda;
  } else if (Math.abs(sum - 1) > 0.05) {
    Om /= sum;
    Ol /= sum;
  }
  return {
    H0: H,
    OmegaM: Om,
    OmegaLambda: Ol,
    OmegaK: safeNum(OmegaK, 0),
  };
}

/**
 * Cosmología Friedmann (ΛCDM plano).
 * Trabaja con a(t) normalizado a a(t0)=1.
 */
export class FriedmannSolver {
  constructor({ H0 = 70, OmegaM = 0.3, OmegaLambda = 0.7, OmegaK = 0 } = {}) {
    this.setCosmology({ H0, OmegaM, OmegaLambda, OmegaK });
    this.t = 0;
    this.a = 1;
  }

  setCosmology({ H0, OmegaM, OmegaLambda, OmegaK }) {
    const p = sanitizeCosmologyParams({ H0, OmegaM, OmegaLambda, OmegaK });
    this.H0 = p.H0;
    this.OmegaM = p.OmegaM;
    this.OmegaLambda = p.OmegaLambda;
    this.OmegaK = p.OmegaK;
    this.H0SI = h0ToSI(this.H0);
    this.tH = 1 / this.H0SI;
    if (!Number.isFinite(this.a) || this.a <= 0) {
      this.a = 1;
      this.t = 0;
    }
  }

  /** H(a) / H0 en unidades adimensionales */
  HOverH0(a) {
    const invA = 1 / a;
    const invA2 = invA * invA;
    const invA3 = invA2 * invA;
    const term =
      this.OmegaM * invA3 +
      this.OmegaK * invA2 +
      this.OmegaLambda;
    return Math.sqrt(Math.max(term, 0));
  }

  /** H(a) en s⁻¹ */
  H(a) {
    return this.H0SI * this.HOverH0(a);
  }

  /** H(z) en km/s/Mpc */
  HAtZ(z) {
    const a = 1 / (1 + z);
    return this.H0 * this.HOverH0(a);
  }

  /** Derivada da/dt = a * H(a) */
  dadt(a) {
    return a * this.H(a);
  }

  /** Segunda derivada para RK4 */
  d2adt2(a) {
    const h = this.H(a);
    const h2 = h * h;
    const invA = 1 / a;
    const invA2 = invA * invA;
    const invA3 = invA2 * invA;
    const dHda =
      (this.H0SI * this.H0SI * 0.5) /
      Math.max(this.HOverH0(a), 1e-30) *
      (-3 * this.OmegaM * invA3 - 2 * this.OmegaK * invA2);
    return h2 + a * h * dHda;
  }

  /** Un paso RK4: avanza t y a */
  step(dt) {
    if (!Number.isFinite(dt) || dt <= 0) return this;
    const state = { t: this.t, a: clampA(this.a), v: this.dadt(clampA(this.a)) };

    const deriv = (s) => {
      const aSafe = clampA(s.a);
      return {
        dt: 1,
        da: s.v,
        dv: this.d2adt2(aSafe),
      };
    };

    const k1 = deriv(state);
    const k2 = deriv({
      t: state.t + 0.5 * dt * k1.dt,
      a: state.a + 0.5 * dt * k1.da,
      v: state.v + 0.5 * dt * k1.dv,
    });
    const k3 = deriv({
      t: state.t + 0.5 * dt * k2.dt,
      a: state.a + 0.5 * dt * k2.da,
      v: state.v + 0.5 * dt * k2.dv,
    });
    const k4 = deriv({
      t: state.t + dt * k3.dt,
      a: state.a + dt * k3.da,
      v: state.v + dt * k3.dv,
    });

    this.t += (dt / 6) * (k1.dt + 2 * k2.dt + 2 * k3.dt + k4.dt);
    this.a = clampA(this.a + (dt / 6) * (k1.da + 2 * k2.da + 2 * k3.da + k4.da));
    return this;
  }

  /** Repara estado numérico corrupto (NaN por parámetros extremos). */
  repair() {
    if (!Number.isFinite(this.a) || this.a <= 0) {
      this.a = 1;
      this.t = 0;
    }
    if (!Number.isFinite(this.t)) this.t = 0;
    return this;
  }

  /** Redshift z = 1/a - 1 */
  get redshift() {
    return 1 / this.a - 1;
  }

  /** H(t) actual en km/s/Mpc */
  get HNow() {
    return this.H0 * this.HOverH0(this.a);
  }

  /** Distancia comóvil dc = c ∫ dz'/H(z') desde z=0 hasta z actual */
  comovingDistance() {
    return this.comovingDistanceAtZ(this.redshift);
  }

  /** Distancia comóvil hasta redshift z (integración Simpson) */
  comovingDistanceAtZ(zTarget) {
    const z = Math.max(0, safeNum(zTarget, 0));
    if (z <= 0) return 0;
    const n = 200;
    const dz = z / n;
    let sum = 0;
    for (let i = 0; i <= n; i++) {
      const zi = i * dz;
      const weight = i === 0 || i === n ? 1 : i % 2 === 0 ? 2 : 4;
      const Hz = Math.max(this.HAtZ(zi), 1e-30);
      sum += (weight * C) / Hz;
    }
    return (dz / 3) * sum;
  }

  reset() {
    this.t = 0;
    this.a = 1;
    return this;
  }

  /** Edad del universo desde el Big Bang hasta a dado (integración Simpson) */
  universeAgeSeconds(atA = 1) {
    const aMin = 1e-9;
    const n = 300;
    const da = (atA - aMin) / n;
    let sum = 0;
    for (let i = 0; i <= n; i++) {
      const a = aMin + i * da;
      const weight = i === 0 || i === n ? 1 : i % 2 === 0 ? 2 : 4;
      const h = this.H(a);
      sum += weight / Math.max(a * h, 1e-40);
    }
    return (da / 3) * sum;
  }

  /** Edad cósmica en gigaaños */
  universeAgeGyr(atA = null) {
    const a = atA ?? this.a;
    return this.universeAgeSeconds(a) / 3.156e16;
  }
}
