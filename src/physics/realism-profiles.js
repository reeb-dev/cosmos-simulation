/**
 * Perfiles de realismo: calibran física pedagógica vs observacional.
 * - realistic: valores Planck 2018, órbitas Keplerianas, lensing físico, GW calibradas
 * - standard: equilibrio visual / física (legacy)
 * - cinematic: exagerado para demos
 */

export const REALISM_PROFILES = {
  gargantua: {
    id: 'gargantua',
    starSize: 1.12,
    starOpacity: 0.98,
    brightStarBoost: 1.28,
    expansionRate: 0.028,
    geodesicTau: 1.1,
    gravityStep: 0.72,
    orbitalFactor: 1.0,
    gwWaveSpeed: 48,
    gwAmplitudeScale: 0.85,
    lensStrengthMul: 2.4,
    toneExposure: 1.55,
    fogDensity: 0.00008,
    diskIntensity: 1.75,
    diskThinness: 0.38,
    diskVolumetric: 1.0,
    bloomStrength: 1.0,
    photonRingOpacity: 0.98,
    haloStrengthMul: 1.15,
    binaryTimeScale: 1.2,
    hawkingAccel: 1e10,
    showPhotonSphere: false,
    geodesicOpacity: 0.2,
  },
  realistic: {
    id: 'realistic',
    starSize: 1.05,
    starOpacity: 0.95,
    brightStarBoost: 1.15,
    expansionRate: 0.032,
    geodesicTau: 1.2,
    gravityStep: 0.75,
    orbitalFactor: 1.0,
    gwWaveSpeed: 48,
    gwAmplitudeScale: 0.85,
    lensStrengthMul: 1.85,
    toneExposure: 1.28,
    fogDensity: 0.00032,
    diskIntensity: 1.28,
    diskThinness: 0.88,
    photonRingOpacity: 0.92,
    haloStrengthMul: 1.0,
    binaryTimeScale: 1.2,
    hawkingAccel: 1e10,
    showPhotonSphere: false,
    geodesicOpacity: 0.35,
  },
  standard: {
    id: 'standard',
    starSize: 1.1,
    starOpacity: 0.9,
    brightStarBoost: 1.1,
    expansionRate: 0.05,
    geodesicTau: 1.5,
    gravityStep: 0.8,
    orbitalFactor: 0.85,
    gwWaveSpeed: 55,
    gwAmplitudeScale: 1.0,
    lensStrengthMul: 1.0,
    toneExposure: 1.2,
    fogDensity: 0.0008,
    diskIntensity: 1.0,
    diskThinness: 0.75,
    photonRingOpacity: 0.85,
    haloStrengthMul: 0.9,
    binaryTimeScale: 1.0,
    hawkingAccel: 1e12,
    showPhotonSphere: false,
    geodesicOpacity: 0.45,
  },
  cinematic: {
    id: 'cinematic',
    starSize: 1.35,
    starOpacity: 0.98,
    brightStarBoost: 1.35,
    expansionRate: 0.07,
    geodesicTau: 2.0,
    gravityStep: 0.9,
    orbitalFactor: 0.35,
    gwWaveSpeed: 72,
    gwAmplitudeScale: 1.35,
    lensStrengthMul: 1.55,
    toneExposure: 1.48,
    fogDensity: 0.001,
    diskIntensity: 1.35,
    diskThinness: 0.82,
    photonRingOpacity: 0.95,
    haloStrengthMul: 1.05,
    binaryTimeScale: 0.85,
    hawkingAccel: 1e13,
    showPhotonSphere: true,
    geodesicOpacity: 0.55,
  },
};

export function getRealismProfile(mode = 'realistic') {
  return REALISM_PROFILES[mode] ?? REALISM_PROFILES.realistic;
}

/** Temperatura efectiva disco delgado T ∝ (M/r³)^(1/4) → RGB aproximado */
export function diskTemperatureColor(tNorm, intensity = 1) {
  const t = Math.pow(Math.max(tNorm, 0.02), -0.75);
  const tempK = 2500 + t * 12000;
  const u = Math.min(1, (tempK - 2500) / 10000);
  const r = Math.min(1, 0.55 + u * 0.45 + (1 - u) * 0.4);
  const g = Math.min(1, 0.25 + u * 0.7 + (1 - u) * 0.15);
  const b = Math.min(1, 0.1 + u * 0.95);
  return [r * intensity, g * intensity, b * intensity];
}

/** Frecuencia QNM dominante (l=m=2) aproximada — Berti et al. */
export function qnmFrequencyHz(massSolar, spin = 0.67) {
  const M = massSolar * 1.989e30;
  const G = 6.674e-11;
  const C = 2.998e8;
  const fGeom = (C ** 3) / (2 * Math.PI * G * M);
  const f1 = 0.3737 + 0.127 * Math.min(0.998, Math.max(0, spin));
  return fGeom * f1;
}
