/**
 * Metadatos académicos por fórmula/modo: ecuación, referencia, aproximación, rango válido.
 */

export const PHYSICS_METADATA = {
  friedmann_h: {
    id: 'friedmann_h',
    name: 'Parámetro de Hubble H(a)',
    equation: 'H²(a) = H₀² [Ωₘ/a³ + Ωₖ/a² + ΩΛ]',
    reference: 'Friedmann (1922); Lemaître (1927)',
    approximation: 'Universo plano (Ωₖ≈0), materia + Λ constante',
    validRange: '0.01 < a ≤ 1, 50 ≤ H₀ ≤ 90 km/s/Mpc',
    citation: 'Friedmann 1922',
  },
  schwarzschild_rs: {
    id: 'schwarzschild_rs',
    name: 'Radio de Schwarzschild',
    equation: 'rₛ = 2GM/c²',
    reference: 'Schwarzschild (1916)',
    approximation: 'BH no rotante (a=0); Kerr requiere r₊',
    validRange: 'M > 0, spin < 0.998 (Kerr extremo)',
    citation: 'Schwarzschild 1916',
  },
  time_dilation: {
    id: 'time_dilation',
    name: 'Dilatación temporal',
    equation: 'dτ/dt = √(1 − rₛ/r)',
    reference: 'Schwarzschild (1916)',
    approximation: 'Métrica estática; ignora rotación y marco del observador',
    validRange: 'r > rₛ',
    citation: 'Schwarzschild 1916',
  },
  hawking_temperature: {
    id: 'hawking_temperature',
    name: 'Temperatura de Hawking',
    equation: 'T_H = ℏc³ / (8πGMk_B)',
    reference: 'Hawking (1974)',
    approximation: 'BH clásico; correcciones cuánticas de orden O(1)',
    validRange: 'M ≳ 10⁻⁸ M☉ (evaporación < edad del universo)',
    citation: 'Hawking 1974',
  },
  hawking_lifetime: {
    id: 'hawking_lifetime',
    name: 'Tiempo de evaporación',
    equation: 't_evap ≈ 5120πG²M³/(ℏc⁴)',
    reference: 'Page (1976)',
    approximation: 'Emisión de cuerpo negro; ignora hair y PBH',
    validRange: 'M > 0',
    citation: 'Page 1976',
  },
  gw_strain_inspiral: {
    id: 'gw_strain_inspiral',
    name: 'Strain GW (inspiral)',
    equation: 'h ~ (4Gμ/c²r)(v²/c²), μ = m₁m₂/(m₁+m₂)',
    reference: 'Peters (1964); Misner, Thorne & Wheeler (1973)',
    approximation: 'Órbita circular, campo débil, cuadrupolo; NO reemplaza NR',
    validRange: 'Separación >> rₛ, v/c ≪ 1; fusión requiere simulación NR',
    citation: 'Peters 1964',
    disclaimer: 'La fusión y ringdown usan modelos fenomenológicos, no NR completa (SXS/ETK).',
  },
  gw_energy_loss: {
    id: 'gw_energy_loss',
    name: 'Pérdida de energía orbital (Peters)',
    equation: 'dE/dt = −(32/5)(G⁴μ²M³)/(c⁵a⁵)',
    reference: 'Peters & Mathews (1963); Peters (1964)',
    approximation: 'Órbita kepleriana circular, campo débil',
    validRange: 'a >> rₛ_total, e ≈ 0',
    citation: 'Peters 1964',
  },
  reduced_mass: {
    id: 'reduced_mass',
    name: 'Masa reducida',
    equation: 'μ = m₁m₂/(m₁+m₂)',
    reference: 'Mecánica clásica / relatividad',
    approximation: 'Definición exacta',
    validRange: 'm₁, m₂ > 0',
    citation: '—',
  },
  comoving_distance: {
    id: 'comoving_distance',
    name: 'Distancia comóvil',
    equation: 'd_c = c ∫₀^z dz′/H(z′)',
    reference: 'Weinberg (1972); Planck Collaboration',
    approximation: 'Integración numérica Simpson; ΛCDM plano',
    validRange: '0 ≤ z ≲ 1100 (límite lineal)',
    citation: 'Planck 2018',
  },
};

/** Metadatos por modo de simulación */
export const MODE_PHYSICS_METADATA = {
  black_hole: {
    name: 'Agujero negro',
    validated: ['rₛ', 'dilatación temporal', 'geodésicas Schwarzschild'],
    visualOnly: ['lensing screen-space', 'disco de acreción shader', 'interiores teóricos'],
    metadata: ['schwarzschild_rs', 'time_dilation'],
  },
  cosmology: {
    name: 'Cosmología ΛCDM',
    validated: ['H(a)', 'z(a)', 'edad cósmica', 'd_c'],
    visualOnly: ['campo galáctico procedural', 'CMB sin anisotropías Planck'],
    metadata: ['friedmann_h', 'comoving_distance'],
  },
  binary_merger: {
    name: 'Choque binario',
    validated: ['μ', 'Peters dE/dt', 'T_Hawking', 't_evap'],
    visualOnly: ['fusión visual', 'ringdown fenomenológico', 'ondas GW 3D'],
    metadata: ['gw_strain_inspiral', 'gw_energy_loss', 'reduced_mass'],
    disclaimer: PHYSICS_METADATA.gw_strain_inspiral.disclaimer,
  },
};

/**
 * HTML de footnote para panel de laboratorio.
 */
export function renderPhysicsFootnote(metaId) {
  const m = PHYSICS_METADATA[metaId];
  if (!m) return '';
  const disc = m.disclaimer ? ` · ${m.disclaimer}` : '';
  return `<span class="physics-footnote" title="${m.equation}&#10;Ref: ${m.reference}&#10;Aprox: ${m.approximation}&#10;Rango: ${m.validRange}${disc}">[${m.citation}]</span>`;
}

/**
 * Metadatos para un modo dado.
 */
export function getModeMetadata(modeId) {
  return MODE_PHYSICS_METADATA[modeId] ?? MODE_PHYSICS_METADATA.black_hole;
}
