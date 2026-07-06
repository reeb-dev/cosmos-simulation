/** Constantes físicas en unidades SI */
export const G = 6.674e-11;
export const C = 2.998e8;
export const M_SUN = 1.989e30;
export const PARSEC = 3.086e16;
export const MPC = 1e6 * PARSEC;
export const KM_PER_S_TO_M_PER_S = 1000;

/** Parámetros cosmológicos ΛCDM — Planck 2018 (valores observacionales) */
export const DEFAULT_COSMOLOGY = {
  H0: 67.4,
  OmegaM: 0.315,
  OmegaLambda: 0.685,
  OmegaK: 0,
};

/** Alias legado ΛCDM aproximado */
export const LCDM_APPROX = {
  H0: 70,
  OmegaM: 0.3,
  OmegaLambda: 0.7,
  OmegaK: 0,
};

/** Parámetros del agujero negro por defecto */
export const DEFAULT_BLACK_HOLE = {
  massSolar: 10,
};

/** Umbrales del motor híbrido (en unidades de visualización) */
export const REGIME_THRESHOLDS = {
  schwarzschildFactor: 100,
  localRadius: 80,
};

/** Escala de visualización del horizonte (unidades Three.js) */
export const DISPLAY_RS_BASE = 3;
export const DISPLAY_MASS_BASE = 10;

/** Constante gravitacional en unidades de visualización (ajustada para órbitas visibles) */
export const G_DISPLAY = 10;

/** Escala SI para lecturas cosmológicas (metros por unidad comóvil del starfield) */
export const VIS_SCALE = 1e10;
