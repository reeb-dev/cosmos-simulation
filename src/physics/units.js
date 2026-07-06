import { C, DISPLAY_MASS_BASE, DISPLAY_RS_BASE, G, M_SUN } from './constants.js';

/** Convierte metros a unidades de visualización Three.js (solo cosmología) */
export function toVis(meters) {
  return meters / 1e10;
}

/** Radio de Schwarzschild real en metros: r_s = 2GM/c² */
export function schwarzschildRadius(massKg) {
  return (2 * G * massKg) / (C * C);
}

/**
 * Radio de Schwarzschild en unidades de visualización.
 * Escala normalizada: 3 unidades para 10 M☉, proporcional a la masa.
 */
export function schwarzschildRadiusVis(massSolar) {
  return DISPLAY_RS_BASE * (massSolar / DISPLAY_MASS_BASE);
}

/** Radio de Schwarzschild real en metros (para lecturas HUD) */
export function schwarzschildRadiusMeters(massSolar) {
  return schwarzschildRadius(massSolar * M_SUN);
}

/** Masa en kg desde masas solares */
export function massFromSolar(massSolar) {
  return massSolar * M_SUN;
}

/** H0 en s⁻¹ desde km/s/Mpc */
export function h0ToSI(h0KmPerSMpc) {
  const MPC = 3.086e22;
  return (h0KmPerSMpc * 1000) / MPC;
}
