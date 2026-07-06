/**
 * RNG determinista (mulberry32) y codificación de estado en URL.
 */
import { applyModePreset } from '../physics/mode-presets.js';

export const DEFAULT_SEED = 42;

/** mulberry32 — PRNG rápido y reproducible */
export function createSeededRng(seed = DEFAULT_SEED) {
  let s = seed >>> 0;
  return function next() {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class SimulationSeed {
  constructor(seed = DEFAULT_SEED) {
    this.seed = seed >>> 0;
    this._rng = createSeededRng(this.seed);
  }

  /** Valor uniforme [0, 1) */
  random() {
    return this._rng();
  }

  /** Entero en [min, max) */
  randomInt(min, max) {
    return Math.floor(this.random() * (max - min)) + min;
  }

  /** Ángulo [0, 2π) */
  randomAngle() {
    return this.random() * Math.PI * 2;
  }

  setSeed(seed) {
    this.seed = seed >>> 0;
    this._rng = createSeededRng(this.seed);
    return this;
  }

  /** Deriva sub-semilla para subsistemas */
  fork(label) {
    let h = this.seed;
    for (let i = 0; i < label.length; i++) {
      h = Math.imul(31, h) + label.charCodeAt(i);
      h >>>= 0;
    }
    return createSeededRng(h);
  }
}

/** Parámetros reconocidos en la URL */
const URL_PARAMS = [
  'mode', 'preset', 'theory', 'seed',
  'M1', 'M2', 'M', 'H0', 'OmegaM', 'OmegaLambda',
  'spin', 'timeScale',
];

/**
 * Parsea ?mode=binary_merger&M1=30&M2=20&H0=70&theory=firewall&seed=42
 * @returns {Record<string, string|number>}
 */
export function parseUrlState(search = window.location.search) {
  const params = new URLSearchParams(search);
  const state = {};
  for (const key of URL_PARAMS) {
    const v = params.get(key);
    if (v == null) continue;
    const num = Number(v);
    state[key] = Number.isFinite(num) && v.trim() !== '' ? num : v;
  }
  return state;
}

/**
 * Construye query string desde estado actual.
 */
export function encodeUrlState(state) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(state)) {
    if (v != null && v !== '') params.set(k, String(v));
  }
  return params.toString();
}

/**
 * Actualiza la URL sin recargar (history.replaceState).
 */
export function syncUrlState(state) {
  const qs = encodeUrlState(state);
  const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState(null, '', url);
}

/**
 * Aplica estado de URL al contexto de la app.
 */
export function applyUrlState(ctx, urlState) {
  if (!urlState || !Object.keys(urlState).length) return;

  if (urlState.seed != null) {
    ctx.simulationSeed?.setSeed(Number(urlState.seed));
  }
  if (urlState.H0 != null || urlState.OmegaM != null || urlState.OmegaLambda != null) {
    ctx.universe.setCosmology({
      H0: urlState.H0 ?? ctx.universe.cosmology.H0,
      OmegaM: urlState.OmegaM ?? ctx.universe.cosmology.OmegaM,
      OmegaLambda: urlState.OmegaLambda ?? ctx.universe.cosmology.OmegaLambda,
    });
    ctx.theoryLab.activePreset = 'custom';
  }
  if (urlState.M != null) {
    ctx.universe.setBlackHoleMass(urlState.M);
    ctx.onRsChange?.();
  }
  if (urlState.spin != null) {
    ctx.universe.spin = urlState.spin;
    ctx.onRsChange?.();
  }
  if (urlState.timeScale != null) {
    ctx.universe.timeScale = urlState.timeScale;
  }
  if (urlState.theory != null) {
    ctx.horizonSim.setTheory(String(urlState.theory));
    ctx.onTheoryChange?.(String(urlState.theory));
  }
  if (urlState.M1 != null || urlState.M2 != null) {
    ctx.binarySim?.configure({
      m1Solar: urlState.M1 ?? ctx.binarySim.m1Solar,
      m2Solar: urlState.M2 ?? ctx.binarySim.m2Solar,
    });
  }
  if (urlState.preset != null) {
    applyModePreset(ctx, String(urlState.preset));
  } else if (urlState.mode != null) {
    ctx.modeManager?.setMode(String(urlState.mode));
  }
  ctx.guiSync?.();
}

/**
 * Recoge estado actual para URL / snapshot.
 */
export function collectUrlState(ctx) {
  const mode = ctx.modeManager?.currentMode ?? 'black_hole';
  const state = {
    mode,
    theory: ctx.horizonSim?.theoryId,
    seed: ctx.simulationSeed?.seed ?? DEFAULT_SEED,
    M: ctx.universe.blackHoleMassSolar,
    H0: ctx.universe.cosmology.H0,
    OmegaM: ctx.universe.cosmology.OmegaM,
    OmegaLambda: ctx.universe.cosmology.OmegaLambda,
    spin: ctx.universe.spin,
  };
  if (mode === 'binary_merger' && ctx.binarySim) {
    state.M1 = ctx.binarySim.m1Solar;
    state.M2 = ctx.binarySim.m2Solar;
  }
  return state;
}
