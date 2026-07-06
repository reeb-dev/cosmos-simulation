import { G, C } from '../physics/constants.js';
import { schwarzschildRadius } from '../physics/units.js';

/**
 * Evaluador seguro de fórmulas personalizadas.
 * Variables: M, rs, r, G, c, H0, a, z, Om, OL, spin, pi, e
 */
const SAFE_PATTERN = /^[0-9+\-*/().\s_a-zA-Z^]+$/;
const MATH_FUNCS = ['sqrt', 'abs', 'sin', 'cos', 'tan', 'log', 'log10', 'exp', 'pow', 'min', 'max', 'floor', 'ceil', 'round'];
const VAR_MAP = {
  M: 'massKg',
  rs: 'rsMeters',
  r: 'orbitRMeters',
  G: 'G',
  c: 'c',
  H0: 'H0',
  a: 'a',
  z: 'z',
  Om: 'OmegaM',
  OL: 'OmegaLambda',
  spin: 'spin',
  pi: 'Math.PI',
  e: 'Math.E',
};

export function createCustomFormula(name, expression) {
  if (!SAFE_PATTERN.test(expression)) {
    throw new Error('Expresión contiene caracteres no permitidos');
  }

  let jsExpr = expression;
  for (const [sym, key] of Object.entries(VAR_MAP)) {
    if (sym === 'pi' || sym === 'e') continue;
    jsExpr = jsExpr.replace(new RegExp(`\\b${sym}\\b`, 'g'), `ctx.${key}`);
  }
  jsExpr = jsExpr.replace(/\bpi\b/g, 'Math.PI');
  jsExpr = jsExpr.replace(/\b(e)\b/g, 'Math.E');
  jsExpr = jsExpr.replace(/\^/g, '**');
  for (const mathFn of MATH_FUNCS) {
    jsExpr = jsExpr.replace(new RegExp(`\\b${mathFn}\\(`, 'g'), `Math.${mathFn}(`);
  }

  const fn = new Function('ctx', 'Math', `"use strict"; return (${jsExpr});`);

  return {
    id: `custom_${Date.now()}`,
    name: name || 'Fórmula personalizada',
    latex: expression,
    category: 'custom',
    enabled: true,
    expression,
    compute: (ctx) => {
      const evalCtx = {
        massKg: ctx.massKg,
        rsMeters: schwarzschildRadius(ctx.massKg),
        orbitRMeters: (ctx.orbitR || ctx.rsVis * 25) * (ctx.visScale || 1e10),
        G,
        c: C,
        H0: ctx.H0,
        a: ctx.a || 1,
        z: ctx.z || 0,
        OmegaM: ctx.OmegaM,
        OmegaLambda: ctx.OmegaLambda,
        spin: ctx.spin || 0,
      };
      const value = fn(evalCtx, Math);
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new Error('Resultado no numérico');
      }
      return { value, unit: 'calc' };
    },
  };
}

export const FORMULA_PRESETS = [
  { name: 'Energía en reposo', expr: 'M * c^2' },
  { name: 'Límite de Bondi', expr: 'G * M / rs' },
  { name: 'Redshift gravitacional', expr: '1 / sqrt(1 - rs / r) - 1' },
  { name: 'Densidad del BH', expr: 'M / (4/3 * pi * (rs/2)^3)' },
  { name: 'H² proporcional a Ω', expr: 'H0^2 * (Om/a^3 + OL)' },
];

export function saveCustomFormulas(formulas) {
  try {
    localStorage.setItem('cosmos_custom_formulas', JSON.stringify(formulas.map((f) => ({
      name: f.name,
      expression: f.expression,
      enabled: f.enabled,
    }))));
  } catch (_) { /* ignore */ }
}

export function clearCustomFormulasStorage() {
  try { localStorage.removeItem('cosmos_custom_formulas'); } catch (_) { /* ignore */ }
}

export function loadCustomFormulas() {
  try {
    const raw = localStorage.getItem('cosmos_custom_formulas');
    if (!raw) return [];
    return JSON.parse(raw).map((f) => createCustomFormula(f.name, f.expression));
  } catch (_) {
    return [];
  }
}
