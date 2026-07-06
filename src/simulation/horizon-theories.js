import { G, C, REGIME_THRESHOLDS } from '../physics/constants.js';
import { HBAR, K_B, MPC } from '../physics/formula-registry.js';
import { schwarzschildRadius } from '../physics/units.js';
import { REGIME } from './universe.js';

const L_PLANCK = Math.sqrt((HBAR * G) / C ** 3);

function regimeLabel(regime) {
  const labels = {
    [REGIME.SCHWARZSCHILD]: 'Schwarzschild',
    [REGIME.NEWTONIAN]: 'N-cuerpos',
    [REGIME.COSMOLOGICAL]: 'Friedmann',
  };
  return labels[regime] ?? regime;
}

/** Configuración visual pedagógica por teoría (membrana, interior, cruce, exterior). */
function hv({
  membraneColor,
  membraneRipple = 1,
  membraneGlitch = false,
  interiorScale = 2.5,
  crossingFlash = 'default',
  exteriorTint = [1, 1, 1],
  probeTrailColor = 0x00ffcc,
  crossingDescription,
}) {
  return {
    membraneColor,
    membraneRipple,
    membraneGlitch,
    interiorScale,
    crossingFlash,
    exteriorTint,
    probeTrailColor,
    crossingDescription,
  };
}

export const DEFAULT_HORIZON_VISUAL = hv({
  membraneColor: 0xff6600,
  crossingDescription: 'El horizonte se disuelve en un interior teórico distinto según la teoría elegida.',
});

export function getHorizonVisual(id) {
  return HORIZON_THEORIES[id]?.horizonVisual ?? DEFAULT_HORIZON_VISUAL;
}

/**
 * Teorías sobre qué ocurre al cruzar el horizonte de sucesos.
 * Cada entrada define metadatos y parámetros visuales.
 */
export const HORIZON_THEORIES = {
  singularity: {
    id: 'singularity',
    name: 'Singularidad (GR clásica)',
    short: 'La relatividad general predice un punto de densidad infinita en r = 0.',
    description:
      'Según la Relatividad General de Einstein, toda la masa colapsa en un punto matemático de densidad y curvatura infinitas. Las leyes de la física dejan de tener sentido. Las fuerzas de marea divergen y cualquier objeto es destruido antes de llegar al centro.',
    status: 'Predicción clásica',
    color: 0xff2200,
    horizonVisual: hv({
      membraneColor: 0xff2200,
      membraneRipple: 1.4,
      interiorScale: 3.2,
      crossingFlash: 'red_heat',
      exteriorTint: [1.2, 0.25, 0.05],
      probeTrailColor: 0xff4422,
      crossingDescription:
        'Un núcleo rojo infinito que pulsa mientras anillos y espinas colapsan violentamente hacia r = 0.',
    }),
  },
  white_hole: {
    id: 'white_hole',
    name: 'Agujero blanco',
    short: 'Inverso temporal de un agujero negro: solo expulsa materia.',
    description:
      'Solución matemática de las ecuaciones de Einstein donde el tiempo se invierte. Nada puede entrar, solo salir. Podría ser el "otro lado" de un agujero negro en un diagrama de Penrose extendido, aunque ningún agujero blanco se ha observado.',
    status: 'Solución matemática',
    color: 0xffffff,
    horizonVisual: hv({
      membraneColor: 0xffffff,
      membraneRipple: 0.8,
      interiorScale: 2.8,
      crossingFlash: 'white_burst',
      exteriorTint: [1.4, 1.4, 1.5],
      probeTrailColor: 0xccddff,
      crossingDescription:
        'Un estallido blanco cegador: chorros de materia y partículas que solo salen, nunca entran.',
    }),
  },
  wormhole: {
    id: 'wormhole',
    name: 'Puente Einstein-Rosen',
    short: 'Un túnel que conecta dos regiones del espaciotiempo.',
    description:
      'Un "agujero de gusano" podría conectar el interior del agujero negro con otra región del universo o un universo paralelo. Requiere materia exótica con energía negativa para mantenerse estable; sin ella, el puente colapsa en microsegundos.',
    status: 'Hipotético',
    color: 0x44aaff,
    horizonVisual: hv({
      membraneColor: 0x44aaff,
      membraneRipple: 1.1,
      interiorScale: 2.4,
      crossingFlash: 'wormhole_blue',
      exteriorTint: [0.5, 0.7, 1.3],
      probeTrailColor: 0x66bbff,
      crossingDescription:
        'Un túnel azul wireframe se abre hacia un cuello de gusano y un cielo estrellado al otro lado.',
    }),
  },
  baby_universe: {
    id: 'baby_universe',
    name: 'Universo hijo',
    short: 'El colapso da origen a un nuevo universo en expansión.',
    description:
      'Propuesta de Lee Smolin y otros: el interior del agujero negro podría "rebotar" en un Big Bang local, creando un universo hijo con constantes físicas ligeramente diferentes. Nuestro universo podría ser el hijo de un agujero negro anterior.',
    status: 'Especulativo',
    color: 0xaa66ff,
    horizonVisual: hv({
      membraneColor: 0xaa66ff,
      interiorScale: 2.6,
      crossingFlash: 'baby_expand',
      exteriorTint: [0.9, 0.5, 1.3],
      probeTrailColor: 0xcc99ff,
      crossingDescription:
        'Una burbuja púrpura que se infla con mini-estrellas: un Big Bang local naciendo dentro del agujero.',
    }),
  },
  firewall: {
    id: 'firewall',
    name: 'Firewall (paradoja de la información)',
    short: 'Una pared de energía incandescente destruye todo en el horizonte.',
    description:
      'Para resolver la paradoja de la información (¿qué pasa con los datos que caen?), AMPS propuso que el horizonte no es un paso tranquilo: es una pared de partículas de altísima energía que incinera cualquier cosa que lo cruce, violando el principio de equivalencia.',
    status: 'Debate activo',
    color: 0xff8800,
    horizonVisual: hv({
      membraneColor: 0xff8800,
      membraneRipple: 1.6,
      interiorScale: 2.5,
      crossingFlash: 'red_heat',
      exteriorTint: [1.4, 0.4, 0.05],
      probeTrailColor: 0xffaa00,
      crossingDescription:
        'Una pared de fuego naranja-incandescente: ondas de calor extremo que destruyen todo al cruzar.',
    }),
  },
  holographic: {
    id: 'holographic',
    name: 'Principio holográfico',
    short: 'La información se codifica en la superficie del horizonte.',
    description:
      'La información de todo lo que cae al agujero negro queda codificada en el horizonte de sucesos como un holograma 2D. El interior sería una descripción equivalente pero no hay "otro lado" físico: la información persiste en la superficie y eventualmente se libera como radiación de Hawking.',
    status: 'Marco teórico (AdS/CFT)',
    color: 0x00ffaa,
    horizonVisual: hv({
      membraneColor: 0x00ffaa,
      membraneRipple: 0.9,
      interiorScale: 2.7,
      crossingFlash: 'blue_scan',
      exteriorTint: [0.3, 1.1, 0.85],
      probeTrailColor: 0x00ffcc,
      crossingDescription:
        'La membrana se convierte en scanlines cian: el interior es una malla de bits codificados en 2D.',
    }),
  },
  quantum_foam: {
    id: 'quantum_foam',
    name: 'Espuma cuántica (gravedad cuántica)',
    short: 'A escala de Planck, el espaciotiempo deja de ser continuo.',
    description:
      'La gravedad cuántica (loops, cuerdas, etc.) sugiere que la singularidad no existe: el espaciotiempo se vuelve "espumoso" a la escala de Planck (~10⁻³⁵ m). El colapso podría detenerse y rebotar, o conectarse a otra región sin singularidad.',
    status: 'Investigación activa',
    color: 0x88ff44,
    horizonVisual: hv({
      membraneColor: 0x88ff44,
      membraneRipple: 1.3,
      interiorScale: 2.8,
      crossingFlash: 'green_foam',
      exteriorTint: [0.6, 1.2, 0.4],
      probeTrailColor: 0x99ff55,
      crossingDescription:
        'Espuma de burbujas poliédricas verdes que vibran: el espaciotiempo deja de ser continuo.',
    }),
  },
  friedmann_echo: {
    id: 'friedmann_echo',
    name: 'Eco de Friedmann (teoría propia)',
    short: 'El interior es el universo en expansión visto desde coordenadas congeladas.',
    description:
      'Derivado de los cálculos de a(t) y H(t): al cruzar el horizonte, el factor de escala cosmológico domina sobre la gravedad local. El "otro lado" no es un lugar, sino el tiempo cósmico futuro expandiéndose a velocidad H(t), mientras tu reloj local tiende a cero. Las estrellas de fondo no se alejan: tú quedas fijo mientras a(t) las estira.',
    status: 'Conclusión del motor híbrido',
    color: 0xff66cc,
    original: true,
    horizonVisual: hv({
      membraneColor: 0xff66cc,
      interiorScale: 2.4,
      crossingFlash: 'friedmann_shells',
      exteriorTint: [1.2, 0.4, 0.9],
      probeTrailColor: 0xff88dd,
      crossingDescription:
        'Capas esféricas rosas que se expanden como ecos del factor de escala a(t) del cosmos exterior.',
    }),
  },
  hybrid_regime: {
    id: 'hybrid_regime',
    name: 'Zona de transición híbrida (teoría propia)',
    short: 'Tres regímenes físicos coexisten y compiten en el horizonte.',
    description:
      'Basada en el umbral del simulador: por debajo de 100·rₛ rigen las geodésicas de Schwarzschild, entre 100·rₛ y 80 u.vis la gravedad N-cuerpos, y más allá la expansión de Friedmann. El horizonte es la frontera donde los tres regímenes se solapan: ninguna teoría sola describe lo que ocurre; el interior es un estado cuántico indeterminado entre colapso local y expansión global.',
    status: 'Conclusión del motor híbrido',
    color: 0x66ccff,
    original: true,
    horizonVisual: hv({
      membraneColor: 0x66ccff,
      membraneRipple: 1.2,
      interiorScale: 1.8,
      crossingFlash: 'tri_regime',
      exteriorTint: [0.5, 0.9, 1.3],
      probeTrailColor: 0x66ddff,
      crossingDescription:
        'Tres esferas superpuestas (Schwarzschild, N-cuerpos, Friedmann) compitiendo en el mismo horizonte.',
    }),
  },
  temporal_fracture: {
    id: 'temporal_fracture',
    name: 'Fractura temporal (teoría propia)',
    short: 'El tiempo local se congela; el tiempo cosmológico continúa.',
    description:
      'De la fórmula √(1−rₛ/r): cuando r→rₛ, la dilatación temporal → 0. Conclusión: el horizonte es una fractura entre dos relojes. Un observador externo te ve congelado para siempre; tú, en coordenadas propias, cruzas en tiempo finito y encuentras un universo que envejeció infinitamente. El "otro lado" es el mismo cosmos, pero en un instante cosmológico futuro donde a(t) ≫ 1.',
    status: 'Conclusión del motor híbrido',
    color: 0xffcc00,
    original: true,
    horizonVisual: hv({
      membraneColor: 0xffcc00,
      interiorScale: 2.3,
      crossingFlash: 'gold_fracture',
      exteriorTint: [1.2, 1.0, 0.3],
      probeTrailColor: 0xffdd44,
      crossingDescription:
        'Una grieta dorada divide tiempo congelado (izquierda) de un cosmos que envejeció infinitamente (derecha).',
    }),
  },
  information_loop: {
    id: 'information_loop',
    name: 'Bucle de información (teoría propia)',
    short: 'La información circula entre regímenes sin destruirse.',
    description:
      'Combinando N-cuerpos, geodésicas y holografía: la información de las partículas que caen se distribuye en el horizonte (superficie 2D), se mezcla con la expansión cosmológica (redshift z), y reaparece como radiación de baja energía. No hay "otro lado" material: hay un bucle donde datos locales se convierten en datos cosmológicos y viceversa, resolviendo la paradoja sin firewall.',
    status: 'Conclusión del motor híbrido',
    color: 0x99ff66,
    original: true,
    horizonVisual: hv({
      membraneColor: 0x99ff66,
      interiorScale: 2.5,
      crossingFlash: 'loop_spin',
      exteriorTint: [0.7, 1.2, 0.4],
      probeTrailColor: 0xbbff77,
      crossingDescription:
        'Un anillo verde de bits que circula sin destruirse: la información rebota entre superficie y cosmos.',
    }),
  },
  planck_threshold: {
    id: 'planck_threshold',
    name: 'Umbral de Planck dinámico (teoría propia)',
    short: 'Al acercarse a rₛ, el espacio se vuelve espuma cuántica escalada por la masa.',
    description:
      'Cuando r → rₛ, la escala de curvatura alcanza l_P ∝ √(ℏG/c³). El interior no es un punto: es una red de burbujas de Planck cuyo tamaño efectivo crece con M (rₛ/l_P ∝ M). La singularidad clásica se disuelve en fluctuaciones; lo que ves es el límite donde la gravedad de Schwarzschild y la gravedad cuántica compiten.',
    status: 'Conclusión del motor híbrido',
    color: 0xcc88ff,
    original: true,
    horizonVisual: hv({
      membraneColor: 0xcc88ff,
      membraneRipple: 1.5,
      interiorScale: 3.0,
      crossingFlash: 'planck_lattice',
      exteriorTint: [0.9, 0.6, 1.3],
      probeTrailColor: 0xddaaff,
      crossingDescription:
        'Red de burbujas de Planck violetas sobre una rejilla: la singularidad se disuelve en fluctuaciones.',
    }),
    physicsBasis:
      'rₛ = 2GM/c² (schwarzschild_rs), longitud de Planck l_P = √(ℏG/c³), ratio rₛ/l_P desde masa simulada, dilatación √(1−rₛ/r) al acercarse.',
    computeReadouts(simContext) {
      const { universe, horizonSim } = simContext;
      const readouts = universe.getReadouts();
      const rsM = readouts.rsMeters;
      const ratio = rsM / L_PLANCK;
      const rOverRs = horizonSim.probeRadius / horizonSim.rs;
      const dilation = horizonSim.effectiveTimeDilation;
      return {
        rows: [
          { label: 'rₛ', value: rsM.toExponential(2), unit: 'm' },
          { label: 'l_P', value: L_PLANCK.toExponential(2), unit: 'm' },
          { label: 'rₛ / l_P', value: ratio.toExponential(2), unit: 'adim' },
          { label: 'r / rₛ (sonda)', value: rOverRs.toFixed(3), unit: '× rₛ' },
          { label: 'Dilatación temporal', value: (dilation * 100).toFixed(2), unit: '%' },
        ],
      };
    },
  },
  cosmic_resonance: {
    id: 'cosmic_resonance',
    name: 'Resonancia cosmológica (teoría propia)',
    short: 'H(z) en el horizonte excita un eco interior con frecuencia cosmológica.',
    description:
      'La tasa de expansión H(a) = H₀√(Ωₘa⁻³ + ΩΛ) define un período cósmico τ_H ∼ 1/H. Al cruzar el horizonte, ese ritmo se acopla con el redshift z = 1/a − 1: el interior pulsa como un resonador cuyo modo fundamental es la frecuencia de Hubble actual. Las capas del "otro lado" son armónicos de a(t) medido en vivo.',
    status: 'Conclusión del motor híbrido',
    color: 0xff5599,
    original: true,
    horizonVisual: hv({
      membraneColor: 0xff5599,
      interiorScale: 2.4,
      crossingFlash: 'resonance_wave',
      exteriorTint: [1.2, 0.4, 0.7],
      probeTrailColor: 0xff88bb,
      crossingDescription:
        'Anillos armónicos rosas que pulsan al ritmo de H(z): resonancia con la frecuencia de Hubble.',
    }),
    physicsBasis:
      'Friedmann H(a) y H(z) del solver cosmológico, factor de escala a(t), redshift z, comparación H simulado vs H₀√(Ωₘ/a³ + ΩΛ).',
    computeReadouts(simContext) {
      const { universe } = simContext;
      const readouts = universe.getReadouts();
      const { H0, OmegaM, OmegaLambda } = universe.cosmology;
      const a = readouts.a;
      const Htheory = H0 * Math.sqrt(OmegaM / a ** 3 + OmegaLambda);
      const H0si = (H0 * 1000) / MPC;
      const tauHubble = 1 / H0si;
      const resonance = readouts.H / H0;
      return {
        rows: [
          { label: 'H(t) simulado', value: readouts.H.toFixed(2), unit: 'km/s/Mpc' },
          { label: 'H(a) teórico', value: Htheory.toFixed(2), unit: 'km/s/Mpc' },
          { label: 'a(t)', value: a.toFixed(6), unit: '' },
          { label: 'z', value: readouts.z.toFixed(4), unit: '' },
          { label: 'τ_H (escala)', value: (tauHubble / 3.156e7 / 1e9).toFixed(2), unit: 'Gyr' },
          { label: 'Índice resonancia H/H₀', value: resonance.toFixed(4), unit: 'adim' },
        ],
      };
    },
  },
  accretion_inverted: {
    id: 'accretion_inverted',
    name: 'Membrana de acreción invertida (teoría propia)',
    short: 'La energía del disco refluye a través del horizonte según límites de Eddington.',
    description:
      'El disco exterior acumula energía hasta el límite de Eddington L_Edd = 4πGMc/κ. En esta teoría, el horizonte invierte el flujo: la materia que "cae" desde fuera reaparece en el interior como un disco que expulsa hacia el centro, modulado por la tasa ṁ_Edd y el acoplamiento Bondi con la densidad local. El otro lado es un acrecedor invertido cuya luminosidad está acotada por los cálculos del motor.',
    status: 'Conclusión del motor híbrido',
    color: 0xff7744,
    original: true,
    horizonVisual: hv({
      membraneColor: 0xff7744,
      interiorScale: 2.2,
      crossingFlash: 'orange_invert',
      exteriorTint: [1.3, 0.5, 0.15],
      probeTrailColor: 0xff8844,
      crossingDescription:
        'Un disco de acreción invertido: materia que cae desde fuera reaparece expulsándose hacia el centro.',
    }),
    physicsBasis:
      'Límite de Eddington (ṁ_Edd ∝ M), flujo Bondi ∝ ρ/(c_s³), masa M y rₛ del agujero simulado, fuerza de marea a r de la sonda.',
    computeReadouts(simContext) {
      const { universe, horizonSim } = simContext;
      const massKg = universe.massKg;
      const kappa = 0.34;
      const eta = 0.1;
      const Ledd = (4 * Math.PI * G * massKg * C) / kappa;
      const mdotEdd = Ledd / (eta * C ** 2);
      const r = horizonSim.probeRadius;
      const rM = r * 1e10;
      const dr = 2;
      const tidal = (2 * G * massKg * dr) / rM ** 3;
      const rhoBondi = 1e-21;
      const cs = 1e4;
      const rb = (2 * G * massKg) / (cs ** 2);
      const mdotBondi = (4 * Math.PI * rhoBondi * cs * rb ** 2);
      return {
        rows: [
          { label: 'L_Edd', value: Ledd.toExponential(2), unit: 'W' },
          { label: 'ṁ_Edd', value: mdotEdd.toExponential(2), unit: 'kg/s' },
          { label: 'ṁ_Bondi (ρ local)', value: mdotBondi.toExponential(2), unit: 'kg/s' },
          { label: 'Ratio ṁ/ṁ_Edd', value: (mdotBondi / mdotEdd).toExponential(2), unit: 'adim' },
          { label: 'Marea en sonda', value: tidal.toExponential(2), unit: 'm/s²' },
        ],
      };
    },
  },
  eternal_geodesic: {
    id: 'eternal_geodesic',
    name: 'Geodésica eterna (teoría propia)',
    short: 'Fotones atrapados en r = 1,5 rₛ orbitan un interior de luz pura.',
    description:
      'La esfera de fotones a r = 3GM/c² = 1,5 rₛ es una superficie de órbitas nulas inestables. Al cruzar el horizonte, entras a una red de geodésicas cerradas: luz atrapada que nunca alcanza r = 0 ni escapa. El ISCO a 3 rₛ marca la frontera entre órbitas materiales estables y este régimen fotónico eterno.',
    status: 'Conclusión del motor híbrido',
    color: 0xeedd66,
    original: true,
    horizonVisual: hv({
      membraneColor: 0xeedd66,
      interiorScale: 2.6,
      crossingFlash: 'photon_ring',
      exteriorTint: [1.1, 1.0, 0.4],
      probeTrailColor: 0xffee88,
      crossingDescription:
        'La esfera de fotones a 1,5 rₛ: luz amarilla atrapada en órbitas eternas sin escapar ni caer.',
    }),
    physicsBasis:
      'Esfera de fotones r = 1,5 rₛ (photon_sphere), ISCO a 3 rₛ (isco), geodésicas del simulador, dilatación en r de la cámara/sonda.',
    computeReadouts(simContext) {
      const { universe, horizonSim } = simContext;
      const rs = universe.rsVis;
      const rsM = schwarzschildRadius(universe.massKg);
      const rPhoton = 1.5 * rs;
      const rIsco = 3 * rs;
      const rPhotonM = 1.5 * rsM;
      const probeR = horizonSim.probeRadius;
      const camR = horizonSim.cameraRadius;
      const trapped = probeR <= rPhoton * 1.05 || camR <= rPhoton * 1.05;
      return {
        rows: [
          { label: 'r_fotón', value: rPhoton.toFixed(2), unit: 'u.vis (1,5 rₛ)' },
          { label: 'r_ISCO', value: rIsco.toFixed(2), unit: 'u.vis (3 rₛ)' },
          { label: 'r_fotón (SI)', value: rPhotonM.toExponential(2), unit: 'm' },
          { label: 'r sonda / rₛ', value: (probeR / rs).toFixed(3), unit: '× rₛ' },
          { label: 'Zona fotónica', value: trapped ? 'Activa' : 'Exterior', unit: '' },
        ],
      };
    },
  },
  max_entropy: {
    id: 'max_entropy',
    name: 'Entropía máxima (teoría propia)',
    short: 'El interior es el estado de máxima entropía Bekenstein-Hawking del horizonte.',
    description:
      'La entropía S = k_B c³ A / (4Gℏ) con A = 4πrₛ² fija el contenido informacional del interior. No hay geometría clásica: solo el microestado de máxima entropía compatible con M, temperatura T_H de Hawking y radiación de baja energía. Cada bit en la superficie corresponde a un grado de libertad interior en equilibrio térmico.',
    status: 'Conclusión del motor híbrido',
    color: 0x66ffcc,
    original: true,
    horizonVisual: hv({
      membraneColor: 0x66ffcc,
      interiorScale: 2.5,
      crossingFlash: 'entropy_noise',
      exteriorTint: [0.4, 1.1, 0.9],
      probeTrailColor: 0x88ffdd,
      crossingDescription:
        'Ruido térmico verde-azul: el microestado de máxima entropía de Bekenstein-Hawking en equilibrio.',
    }),
    physicsBasis:
      'Entropía Bekenstein-Hawking (bekenstein_entropy), temperatura de Hawking T_H, área del horizonte A = 4πrₛ², masa M simulada.',
    computeReadouts(simContext) {
      const { universe } = simContext;
      const massKg = universe.massKg;
      const rs = schwarzschildRadius(massKg);
      const A = 4 * Math.PI * rs * rs;
      const S = (K_B * C ** 3 * A) / (4 * G * HBAR);
      const T = (HBAR * C ** 3) / (8 * Math.PI * G * massKg * K_B);
      const bits = S / (K_B * Math.LN2);
      return {
        rows: [
          { label: 'Entropía S', value: (S / K_B).toExponential(2), unit: '× k_B' },
          { label: 'Bits (S/k_B ln2)', value: bits.toExponential(2), unit: 'bits' },
          { label: 'T_Hawking', value: T.toExponential(2), unit: 'K' },
          { label: 'Área horizonte', value: A.toExponential(2), unit: 'm²' },
          { label: 'Densidad info.', value: (S / A / K_B).toExponential(2), unit: 'k_B/m²' },
        ],
      };
    },
  },
  hawking_islands: {
    id: 'hawking_islands',
    name: 'Islas de Hawking (paradoja resuelta)',
    short: 'La información reaparece en islas cuánticas fuera del horizonte.',
    description:
      'Propuesta de Page y colaboradores: la paradoja de la información se resuelve porque los estados puros del colapso se codifican en "islas" de entropía de Hawking — regiones cuánticas desconectadas del interior clásico pero entrelazadas con la radiación emitida. El interior sigue siendo un espacio-tiempo efectivo, pero los datos nunca se destruyen: migran a la superficie y a islas térmicas detectables en el espectro de Hawking.',
    status: 'Especulativa ★',
    color: 0x66aaff,
    speculative: true,
    horizonVisual: hv({
      membraneColor: 0x66aaff,
      interiorScale: 2.4,
      crossingFlash: 'island_pulse',
      exteriorTint: [0.5, 0.8, 1.3],
      probeTrailColor: 0x88ccff,
      crossingDescription:
        'Islas cuánticas azules orbitando el horizonte: la información reaparece fuera del interior clásico.',
    }),
    physicsBasis:
      'Entropía Bekenstein-Hawking S = k_B c³A/(4Gℏ), temperatura T_H, área A = 4πrₛ², Page time τ_Page ∝ M³, comparación con radiación de Hawking del agujero simulado.',
    computeReadouts(simContext) {
      const { universe, engine } = simContext;
      const massKg = universe.massKg;
      const rs = schwarzschildRadius(massKg);
      const A = 4 * Math.PI * rs * rs;
      const S = (K_B * C ** 3 * A) / (4 * G * HBAR);
      const T = (HBAR * C ** 3) / (8 * Math.PI * G * massKg * K_B);
      const tauPage = (512 * Math.PI * G ** 2 * massKg ** 3) / (HBAR * C ** 4);
      const tEvap = (5120 * Math.PI * G ** 2 * massKg ** 3) / (HBAR * C ** 4);
      const simAge = engine?.clock ?? 0;
      const pageFraction = Math.min(1, simAge / tauPage);
      return {
        rows: [
          { label: 'S_BH', value: (S / K_B).toExponential(2), unit: '× k_B' },
          { label: 'T_Hawking', value: T.toExponential(2), unit: 'K' },
          { label: 'τ_Page (escala)', value: (tauPage / 3.156e7 / 1e9).toExponential(2), unit: 'Gyr' },
          { label: 't_evap (orden)', value: (tEvap / 3.156e7 / 1e9).toExponential(2), unit: 'Gyr' },
          { label: 'Fracción Page', value: (pageFraction * 100).toFixed(1), unit: '%' },
        ],
      };
    },
  },
  er_epr_bridge: {
    id: 'er_epr_bridge',
    name: 'ER = EPR (puente cuántico)',
    short: 'El entrelazamiento es un túnel de Einstein-Rosen a escala de Planck.',
    description:
      'Conjetura de Maldacena y Susskind: dos partículas entrelazadas están conectadas por un agujero de gusano microscópico (ER). Al cruzar el horizonte macroscópico, entras a una red de puentes ER que codifican el entrelazamiento entre el interior y la radiación de Hawking exterior. El "otro lado" no es un lugar lejano: es el par EPR del agujero negro.',
    status: 'Especulativa ★',
    color: 0x4488ff,
    speculative: true,
    horizonVisual: hv({
      membraneColor: 0x4488ff,
      interiorScale: 2.5,
      crossingFlash: 'bridge_er',
      exteriorTint: [0.4, 0.7, 1.3],
      probeTrailColor: 0x66aaff,
      crossingDescription:
        'Puentes ER curvos conectando pares entrelazados cian y magenta: el entrelazamiento es geometría.',
    }),
    physicsBasis:
      'Longitud de Planck l_P, ratio rₛ/l_P, entropía S y bits informacionales, dilatación √(1−rₛ/r) en la sonda, geodésicas del simulador.',
    computeReadouts(simContext) {
      const { universe, horizonSim } = simContext;
      const rsM = schwarzschildRadius(universe.massKg);
      const ratio = rsM / L_PLANCK;
      const A = 4 * Math.PI * rsM * rsM;
      const S = (K_B * C ** 3 * A) / (4 * G * HBAR);
      const bits = S / (K_B * Math.LN2);
      const rOverRs = horizonSim.probeRadius / horizonSim.rs;
      const bridgeScale = Math.sqrt(ratio);
      return {
        rows: [
          { label: 'rₛ / l_P', value: ratio.toExponential(2), unit: 'adim' },
          { label: 'Escala puente (√)', value: bridgeScale.toExponential(2), unit: '× l_P' },
          { label: 'Pares EPR (bits)', value: bits.toExponential(2), unit: 'pares' },
          { label: 'r / rₛ', value: rOverRs.toFixed(3), unit: '× rₛ' },
          { label: 'Dilatación', value: (horizonSim.effectiveTimeDilation * 100).toFixed(2), unit: '%' },
        ],
      };
    },
  },
  planck_star: {
    id: 'planck_star',
    name: 'Estrella de Planck',
    short: 'El colapso rebota en densidad de Planck antes de la singularidad.',
    description:
      'Propuesta de Rovelli y Vidotto: la materia no alcanza r = 0. La presión cuántica de degeneración (ecuación de estado w ≈ −1/3 a escala de Planck) detiene el colapso y forma una "estrella de Planck" — un objeto ultra-denso del tamaño de rₛ pero sin horizonte clásico interno. Lo que cruzas es una capa dura cuántica que rebota la gravedad.',
    status: 'Especulativa ★',
    color: 0xffaa44,
    speculative: true,
    horizonVisual: hv({
      membraneColor: 0xffaa44,
      interiorScale: 2.6,
      crossingFlash: 'orange_invert',
      exteriorTint: [1.2, 0.7, 0.2],
      probeTrailColor: 0xffcc66,
      crossingDescription:
        'Un núcleo naranja denso con ondas de rebote: el colapso se detiene en densidad de Planck.',
    }),
    physicsBasis:
      'Densidad de Planck ρ_P = c⁵/(ℏG²), radio rₛ, masa M, ratio M/rₛ³ vs ρ_P, dilatación temporal en la sonda.',
    computeReadouts(simContext) {
      const { universe, horizonSim } = simContext;
      const massKg = universe.massKg;
      const rs = schwarzschildRadius(massKg);
      const rhoP = (C ** 5) / (HBAR * G ** 2);
      const rhoBh = massKg / ((4 / 3) * Math.PI * rs ** 3);
      const compression = rhoBh / rhoP;
      const bounceRadius = rs * Math.cbrt(compression);
      return {
        rows: [
          { label: 'ρ_Planck', value: rhoP.toExponential(2), unit: 'kg/m³' },
          { label: 'ρ_BH (media)', value: rhoBh.toExponential(2), unit: 'kg/m³' },
          { label: 'ρ/ρ_P', value: compression.toExponential(2), unit: 'adim' },
          { label: 'Radio rebote (est.)', value: bounceRadius.toExponential(2), unit: 'm' },
          { label: 'Dilatación sonda', value: (horizonSim.effectiveTimeDilation * 100).toFixed(2), unit: '%' },
        ],
      };
    },
  },
  string_theory: {
    id: 'string_theory',
    name: 'Teoría de cuerdas (★ especulativa)',
    short: 'El interior es un paisaje de dimensiones extra: cuerdas vibrantes, branas y el gravitón como estado cerrado.',
    description:
      'La teoría de cuerdas postula que las partículas fundamentales no son puntos sino filamentos unidimensionales — cuerdas abiertas y cerradas — cuya vibración determina la masa y la carga. Para reconciliar cuántica y gravedad, el espacio-tiempo necesita dimensiones adicionales compactificadas (a menudo en variedades tipo Calabi-Yau del tamaño de la escala de Planck). El gravitón emerge como modo de vibración de una cuerda cerrada sin extremos.\n\n' +
      'En el contexto del agujero negro, la correspondencia AdS/CFT sugiere que el interior volumétrico es dual a una teoría de campos conforme en el horizonte 2D; la propuesta fuzzball de Mathur es un límite concreto donde micro-estados de cuerdas extendidas reemplazan el horizonte clásico. La entropía de Bekenstein-Hawking S = k_B c³A/(4Gℏ) se interpreta como conteo de modos vibracionales y configuraciones de cuerdas a escala l_P, con acoplamiento g_s y radio de compactificación R que dependen simbólicamente de la masa M.\n\n' +
      'Al cruzar el horizonte en esta visualización, entras a un bulk con branas D translúcidas, planos de dimensiones extra ortogonales y cuerdas que oscilan a distintas frecuencias — un modelo pedagógico, no una predicción observacional directa.',
    status: 'Especulativa ★',
    color: 0xbb66ff,
    original: true,
    speculative: true,
    horizonVisual: hv({
      membraneColor: 0xbb66ff,
      membraneRipple: 1.4,
      interiorScale: 2.8,
      crossingFlash: 'string_resonance',
      exteriorTint: [0.7, 0.5, 1.3],
      probeTrailColor: 0xcc88ff,
      crossingDescription:
        'La membrana vibra como una cuerda tensa: resonancia armónica al cruzar hacia el bulk de dimensiones extra.',
    }),
    physicsBasis:
      'Dimensiones extra compactificadas (radio R simbólico ∝ l_P√(rₛ/l_P)), gravitón como cuerda cerrada, conexión AdS/CFT con entropía del horizonte, relación fuzzball–micro-estados, escala de Planck l_P = √(ℏG/c³), rₛ y ratio rₛ/l_P desde masa simulada, entropía Hawking como conteo de modos.',
    computeReadouts(simContext) {
      const { universe } = simContext;
      const massKg = universe.massKg;
      const rs = schwarzschildRadius(massKg);
      const ratio = rs / L_PLANCK;
      const A = 4 * Math.PI * rs * rs;
      const S = (K_B * C ** 3 * A) / (4 * G * HBAR);
      const alphaPrime = L_PLANCK ** 2;
      const ls = L_PLANCK;
      const gs = Math.min(1, 1 / Math.cbrt(ratio));
      const Rcompact = L_PLANCK * Math.sqrt(Math.max(1, ratio));
      const nModes = Math.floor(Math.sqrt(ratio));
      const Tstring = 1 / (2 * Math.PI * alphaPrime * ls ** 2);
      const microStates = S / K_B;
      const bekensteinBound = (2 * Math.PI * rs * massKg * C) / HBAR;
      return {
        rows: [
          { label: 'rₛ', value: rs.toExponential(2), unit: 'm' },
          { label: 'l_P', value: L_PLANCK.toExponential(2), unit: 'm' },
          { label: 'g_s (simb.)', value: gs.toExponential(2), unit: 'adim' },
          { label: 'R compact.', value: Rcompact.toExponential(2), unit: 'm' },
          { label: 'Modos n', value: String(nModes), unit: 'vibración' },
          { label: 'S (cuerdas)', value: (S / K_B).toExponential(2), unit: '× k_B' },
          { label: 'Límite Bekenstein', value: bekensteinBound.toExponential(2), unit: 'adim' },
          { label: 'T cuerda (simb.)', value: Tstring.toExponential(2), unit: 'N' },
        ],
      };
    },
  },
  fuzzball: {
    id: 'fuzzball',
    name: 'Fuzzball (cuerdas)',
    short: 'Superposición de micro-estados sin horizonte clásico.',
    description:
      'Propuesta de la teoría de cuerdas (Mathur): el agujero negro no tiene un horizonte liso. Es una "pelota borrosa" (fuzzball) — superposición de estados de cuerdas extendidas del tamaño de rₛ. No hay interior vacío: cada micro-estado es una configuración distinta de cuerdas que reproduce la entropía de Bekenstein-Hawking sin paradoja.',
    status: 'Especulativa ★',
    color: 0x88ffaa,
    speculative: true,
    horizonVisual: hv({
      membraneColor: 0x88ffaa,
      membraneRipple: 1.3,
      interiorScale: 3.0,
      crossingFlash: 'fuzz_strings',
      exteriorTint: [0.5, 1.2, 0.7],
      probeTrailColor: 0x99ffbb,
      crossingDescription:
        'Nudos de cuerdas verdes en superposición: no hay interior vacío, solo micro-estados borrosos.',
    }),
    physicsBasis:
      'Entropía S = k_B c³A/(4Gℏ), número de micro-estados N ~ e^(S/k_B), área A = 4πrₛ², temperatura T_H.',
    computeReadouts(simContext) {
      const { universe } = simContext;
      const massKg = universe.massKg;
      const rs = schwarzschildRadius(massKg);
      const A = 4 * Math.PI * rs * rs;
      const S = (K_B * C ** 3 * A) / (4 * G * HBAR);
      const microStates = S / K_B;
      const T = (HBAR * C ** 3) / (8 * Math.PI * G * massKg * K_B);
      const fuzzRadius = rs / L_PLANCK;
      return {
        rows: [
          { label: 'Micro-estados (ln)', value: microStates.toExponential(2), unit: '× k_B' },
          { label: 'T_Hawking', value: T.toExponential(2), unit: 'K' },
          { label: 'Radio fuzzball', value: rs.toExponential(2), unit: 'm' },
          { label: 'rₛ / l_P', value: fuzzRadius.toExponential(2), unit: 'cuerdas' },
          { label: 'Área A', value: A.toExponential(2), unit: 'm²' },
        ],
      };
    },
  },
  cpt_mirror: {
    id: 'cpt_mirror',
    name: 'Universo espejo (CPT)',
    short: 'El interior es el universo CPT-simétrico reflejado.',
    description:
      'Inspirado en la simetría CPT de la física de partículas: al cruzar el horizonte, entras a un universo espejo donde carga (C), paridad (P) y flecha temporal (T) se invierten. La materia que cae reaparece como antimateria en expansión; el tiempo cosmológico corre hacia atrás desde tu perspectiva exterior, pero es futuro propio en el espejo.',
    status: 'Especulativa ★',
    color: 0xcc66ff,
    speculative: true,
    horizonVisual: hv({
      membraneColor: 0xcc66ff,
      interiorScale: 2.3,
      crossingFlash: 'mirror_flip',
      exteriorTint: [1.0, 0.5, 1.3],
      probeTrailColor: 0xdd88ff,
      crossingDescription:
        'Un espejo púrpura invierte materia y antimateria: el cosmos reflejado corre el tiempo al revés.',
    }),
    physicsBasis:
      'Inversión temporal vinculada a dilatación √(1−rₛ/r), factor de escala a(t) y redshift z, H(z) del solver Friedmann, régimen cosmológico simulado.',
    computeReadouts(simContext) {
      const { universe, horizonSim } = simContext;
      const readouts = universe.getReadouts();
      const dilation = horizonSim.effectiveTimeDilation;
      const mirrorA = 1 / readouts.a;
      const mirrorZ = mirrorA - 1;
      const { H0, OmegaM, OmegaLambda } = universe.cosmology;
      const Hmirror = H0 * Math.sqrt(OmegaM / mirrorA ** 3 + OmegaLambda);
      return {
        rows: [
          { label: 'a(t) exterior', value: readouts.a.toFixed(6), unit: '' },
          { label: 'a espejo (1/a)', value: mirrorA.toExponential(2), unit: '' },
          { label: 'z espejo', value: mirrorZ.toExponential(2), unit: '' },
          { label: 'H espejo', value: Hmirror.toFixed(2), unit: 'km/s/Mpc' },
          { label: 'Dilatación', value: (dilation * 100).toFixed(2), unit: '%' },
        ],
      };
    },
  },
  ads_cft_dynamic: {
    id: 'ads_cft_dynamic',
    name: 'Horizonte holográfico dinámico',
    short: 'Modelo juguete AdS/CFT: el interior es el dual conforme del horizonte.',
    description:
      'Basado en la correspondencia AdS/CFT (Maldacena): el volumen interior (Anti-de Sitter) es dual a una teoría de campo conforme (CFT) viviente en el horizonte 2D. Las lecturas en vivo del simulador alimentan el "acoplamiento" entre ambos: H(z) modula la dimensión efectiva del bulk, y la entropía del horizonte cuenta los grados de libertad del CFT.',
    status: 'Marco teórico (AdS/CFT)',
    color: 0x00ddbb,
    original: true,
    horizonVisual: hv({
      membraneColor: 0x00ddbb,
      interiorScale: 2.5,
      crossingFlash: 'ads_bulk',
      exteriorTint: [0.3, 1.1, 0.85],
      probeTrailColor: 0x44ffcc,
      crossingDescription:
        'Bulk AdS ondulante con frontera CFT: el volumen interior es el dual holográfico de la superficie.',
    }),
    physicsBasis:
      'Entropía S = k_B c³A/(4Gℏ) como conteo CFT, rₛ y área del horizonte, H(a) y a(t) modulan curvatura AdS efectiva, dilatación en la sonda.',
    computeReadouts(simContext) {
      const { universe, horizonSim } = simContext;
      const readouts = universe.getReadouts();
      const massKg = universe.massKg;
      const rs = schwarzschildRadius(massKg);
      const A = 4 * Math.PI * rs * rs;
      const S = (K_B * C ** 3 * A) / (4 * G * HBAR);
      const cftDof = S / K_B;
      const adsRadius = rs * Math.sqrt(readouts.a);
      const coupling = readouts.H / universe.cosmology.H0;
      return {
        rows: [
          { label: 'DOF CFT (S/k_B)', value: cftDof.toExponential(2), unit: 'adim' },
          { label: 'Radio AdS eff.', value: adsRadius.toExponential(2), unit: 'm' },
          { label: 'Acoplamiento H/H₀', value: coupling.toFixed(4), unit: 'adim' },
          { label: 'a(t)', value: readouts.a.toFixed(6), unit: '' },
          { label: 'Dilatación', value: (horizonSim.effectiveTimeDilation * 100).toFixed(2), unit: '%' },
        ],
      };
    },
  },
  babel_library: {
    id: 'babel_library',
    name: 'Biblioteca de Babel interior',
    short: 'Información infinita comprimida en cada punto del horizonte.',
    description:
      'Ficción científica inspirada en Borges: el interior del agujero negro es una biblioteca infinita donde cada "libro" es un microestado posible del universo. La entropía de Bekenstein-Hawking es el índice: cada bit en el horizonte abre un volumen nuevo. Cruzar el horizonte es entrar al catálogo de todas las configuraciones que la física permite — y algunas imposibles.',
    status: 'Ficción científica ★★',
    color: 0xffcc88,
    fiction: true,
    horizonVisual: hv({
      membraneColor: 0xffcc88,
      interiorScale: 2.8,
      crossingFlash: 'babel_text',
      exteriorTint: [1.1, 0.85, 0.5],
      probeTrailColor: 0xffddaa,
      crossingDescription:
        'Estantes infinitos de libros y partículas de texto ámbar: cada bit del horizonte abre un volumen nuevo.',
    }),
    physicsBasis:
      'Metáfora sobre entropía S y bits informacionales del horizonte simulado; usa rₛ, T_H y Page time como "índice de catalogación".',
    computeReadouts(simContext) {
      const { universe } = simContext;
      const massKg = universe.massKg;
      const rs = schwarzschildRadius(massKg);
      const A = 4 * Math.PI * rs * rs;
      const S = (K_B * C ** 3 * A) / (4 * G * HBAR);
      const books = S / (K_B * Math.LN2);
      const T = (HBAR * C ** 3) / (8 * Math.PI * G * massKg * K_B);
      return {
        rows: [
          { label: 'Volúmenes (bits)', value: books.toExponential(2), unit: 'libros' },
          { label: 'T_H (índice)', value: T.toExponential(2), unit: 'K' },
          { label: 'Estanterías (m²)', value: A.toExponential(2), unit: 'm²' },
          { label: 'Páginas/volumen', value: (books / 1e10).toExponential(2), unit: '×10¹⁰' },
          { label: 'Modo', value: 'Ficción ★★', unit: '' },
        ],
      };
    },
  },
  friedmann_gate: {
    id: 'friedmann_gate',
    name: 'Puerta a otro Friedmann',
    short: 'El horizonte abre un Big Bang alternativo con otros Ω.',
    description:
      'Ficción científica cosmológica: cruzar el horizonte no te lleva a r = 0 sino a otro universo de Friedmann con parámetros cosmológicos distintos — como si cada agujero negro fuera una puerta a un cosmos alternativo. El motor híbrido calcula en vivo qué universo "gemelo" sería compatible con la entropía que llevas.',
    status: 'Ficción científica ★★',
    color: 0xff66ff,
    fiction: true,
    horizonVisual: hv({
      membraneColor: 0xff66ff,
      interiorScale: 2.4,
      crossingFlash: 'portal_spiral',
      exteriorTint: [1.2, 0.4, 1.3],
      probeTrailColor: 0xff88ff,
      crossingDescription:
        'Un portal espiral magenta hacia un universo gemelo en expansión con Ω invertidos.',
    }),
    physicsBasis:
      'Juguete cosmológico: H₀, Ωₘ, ΩΛ del simulador generan un universo gemelo con Ω invertidos; usa a(t), z y q(a) como parámetros de la puerta.',
    computeReadouts(simContext) {
      const { universe } = simContext;
      const readouts = universe.getReadouts();
      const { H0, OmegaM, OmegaLambda } = universe.cosmology;
      const twinOm = OmegaLambda;
      const twinOl = OmegaM;
      const a = readouts.a;
      const E = Math.sqrt(twinOm / a ** 3 + twinOl);
      const qTwin = twinOm / (2 * a ** 3 * E ** 2) - twinOl;
      let fate = 'expansión eterna';
      if (twinOm > twinOl * 1.5) fate = 'colapso futuro';
      else if (Math.abs(twinOm - twinOl) < 0.05) fate = 'punto crítico';
      return {
        rows: [
          { label: 'H₀ puerta', value: H0.toFixed(1), unit: 'km/s/Mpc' },
          { label: 'Ωₘ gemelo', value: twinOm.toFixed(3), unit: '(= ΩΛ tuyo)' },
          { label: 'ΩΛ gemelo', value: twinOl.toFixed(3), unit: '(= Ωₘ tuyo)' },
          { label: 'q gemelo', value: qTwin.toFixed(4), unit: 'adim' },
          { label: 'Destino', value: fate, unit: '' },
        ],
      };
    },
  },
  cosmic_inflation: {
    id: 'cosmic_inflation',
    name: 'Inflación cósmica',
    short: 'El interior es el campo inflatón en expansión exponencial.',
    description:
      'La teoría de la inflación propone que el universo temprano experimentó una expansión exponencial impulsada por un campo escalar (inflatón). El horizonte del agujero negro, en esta lectura cosmológica, sería una región donde la energía de vacío domina y el espacio se estira más rápido que la luz localmente. El interior no es materia colapsada sino el mismo mecanismo que expandió el cosmos a escala microscópica.',
    status: 'Marco cosmológico',
    color: 0xff44ff,
    speculative: true,
    horizonVisual: hv({
      membraneColor: 0xff44ff,
      membraneRipple: 1.5,
      interiorScale: 3.0,
      crossingFlash: 'baby_expand',
      exteriorTint: [1.3, 0.4, 1.2],
      probeTrailColor: 0xff88ff,
      crossingDescription:
        'Un campo inflatón violeta que estira el espacio exponencialmente: burbujas cuánticas en expansión ultra-rápida.',
    }),
    physicsBasis:
      'Escala de Hubble de inflación H_inf ~ 10¹³ GeV, comparación con H₀ actual, factor de escala a(t) y redshift z del solver Friedmann.',
    computeReadouts(simContext) {
      const { universe } = simContext;
      const readouts = universe.getReadouts();
      const H0si = (universe.cosmology.H0 * 1000) / 3.086e22;
      const eFoldings = 60;
      const HinfRatio = 1e26;
      return {
        rows: [
          { label: 'H₀ actual', value: readouts.H.toFixed(2), unit: 'km/s/Mpc' },
          { label: 'H_inf / H₀ (orden)', value: HinfRatio.toExponential(0), unit: 'adim' },
          { label: 'e-folds típicos', value: String(eFoldings), unit: 'N' },
          { label: 'a(t) simulado', value: readouts.a.toFixed(6), unit: '' },
          { label: 'z', value: readouts.z.toFixed(4), unit: '' },
          { label: 'Edad cósmica', value: universe.cosmology.universeAgeGyr().toFixed(2), unit: 'Gyr' },
        ],
      };
    },
  },
  dark_matter: {
    id: 'dark_matter',
    name: 'Materia oscura',
    short: 'Un halo invisible distorsiona la luz y la dinámica interior.',
    description:
      'La materia oscura constituye ~27% del universo pero no emite luz. En el interior del horizonte, esta lectura postula un halo de materia oscura no bariónica (WIMPs, axiones) que distorsiona geodésicas y produce lensing gravitacional sin contrapartida luminosa. Las galaxias y estrellas visibles orbitan en un potencial dominado por masa invisible.',
    status: 'Observación cosmológica',
    color: 0x4466aa,
    horizonVisual: hv({
      membraneColor: 0x4466aa,
      membraneRipple: 0.9,
      interiorScale: 2.6,
      crossingFlash: 'blue_scan',
      exteriorTint: [0.4, 0.55, 1.2],
      probeTrailColor: 0x6688cc,
      crossingDescription:
        'Un halo azul oscuro invisible al ojo pero detectable por lensing: curvas de luz sin fuente luminosa.',
    }),
    physicsBasis:
      'Ωₘ del cosmology simulado, fracción de materia oscura ~0.85·Ωₘ, lensing θ_E ~ 2rₛ/d, masa dinámica vs luminosa.',
    computeReadouts(simContext) {
      const { universe } = simContext;
      const { OmegaM, OmegaLambda } = universe.cosmology;
      const omegaDm = OmegaM * 0.85;
      const omegaBaryon = OmegaM * 0.15;
      const rs = universe.rsVis;
      const dLens = 80;
      const thetaE = (2 * rs / dLens) * (180 / Math.PI) * 3600;
      return {
        rows: [
          { label: 'Ω_DM (est.)', value: omegaDm.toFixed(3), unit: '' },
          { label: 'Ω_baryón', value: omegaBaryon.toFixed(3), unit: '' },
          { label: 'Ω_Λ', value: OmegaLambda.toFixed(3), unit: '' },
          { label: 'θ_E hint', value: thetaE.toFixed(2), unit: 'arcsec (vis)' },
          { label: 'Masa BH', value: universe.blackHoleMassSolar.toFixed(1), unit: 'M☉' },
          { label: 'Ratio DM/BH', value: (omegaDm / 0.01).toExponential(1), unit: 'cosmo/BH' },
        ],
      };
    },
  },
  dark_energy: {
    id: 'dark_energy',
    name: 'Energía oscura (Λ)',
    short: 'La constante cosmológica acelera el interior como el universo.',
    description:
      'La energía oscura (~70% del universo) impulsa la aceleración cósmica actual. Al cruzar el horizonte bajo esta teoría, el interior no colapsa sino que hereda la expansión acelerada dominada por Λ: el espacio se estira exponencialmente a largo plazo, diluyendo cualquier materia que cruce. Es el mismo destino térmico que el cosmos exterior en un universo ΛCDM.',
    status: 'Observación cosmológica',
    color: 0xaa44ff,
    horizonVisual: hv({
      membraneColor: 0xaa44ff,
      membraneRipple: 1.1,
      interiorScale: 2.8,
      crossingFlash: 'friedmann_shells',
      exteriorTint: [0.9, 0.4, 1.3],
      probeTrailColor: 0xcc77ff,
      crossingDescription:
        'Capas púrpuras que se aceleran hacia afuera: la constante cosmológica estira el interior sin fin.',
    }),
    physicsBasis:
      'Ω_Λ, parámetro de desaceleración q(a), H(a) = H₀√(Ωₘ/a³ + Ω_Λ), w = −1 para Λ pura.',
    computeReadouts(simContext) {
      const { universe } = simContext;
      const readouts = universe.getReadouts();
      const { OmegaM, OmegaLambda, H0 } = universe.cosmology;
      const a = readouts.a;
      const E = Math.sqrt(OmegaM / a ** 3 + OmegaLambda);
      const q = OmegaM / (2 * a ** 3 * E ** 2) - OmegaLambda;
      const w = -1;
      return {
        rows: [
          { label: 'Ω_Λ', value: OmegaLambda.toFixed(3), unit: '' },
          { label: 'q(a)', value: q.toFixed(4), unit: 'adim' },
          { label: 'w (Λ)', value: w.toFixed(2), unit: 'adim' },
          { label: 'H(t)', value: readouts.H.toFixed(2), unit: 'km/s/Mpc' },
          { label: 'Aceleración', value: q < 0 ? 'Sí (Λ dom.)' : 'No', unit: '' },
          { label: 'Destino', value: 'expansión eterna', unit: '' },
        ],
      };
    },
  },
  cosmic_strings: {
    id: 'cosmic_strings',
    name: 'Cuerdas cósmicas',
    short: 'Defectos topológicos de 1D cruzan el horizonte.',
    description:
      'Las cuerdas cósmicas son defectos topológicos unidimensionales formados en transiciones de fase del universo temprano. Tensión μ ~ 10²² g/cm las hace supermasivas: curvan el espacio en ángulos cónicos sin masa local. El interior del agujero negro, en este modelo, estaría atravesado por redes de cuerdas que conectan regiones del espacio-tiempo como cicatrices del Big Bang.',
    status: 'Hipotético',
    color: 0x44ff88,
    speculative: true,
    horizonVisual: hv({
      membraneColor: 0x44ff88,
      membraneRipple: 1.2,
      interiorScale: 2.5,
      crossingFlash: 'green_foam',
      exteriorTint: [0.4, 1.1, 0.6],
      probeTrailColor: 0x66ffaa,
      crossingDescription:
        'Filamentos verdes luminosos: defectos topológicos 1D que cortan el espacio como cicatrices.',
    }),
    physicsBasis:
      'Tensión de cuerda μ, ángulo de déficit δ = 8πGμ/c², escala GUT ~ 10¹⁶ GeV, redshift z del cosmos simulado.',
    computeReadouts(simContext) {
      const { universe } = simContext;
      const G = 6.674e-11;
      const C = 2.998e8;
      const mu = 1e-3;
      const delta = (8 * Math.PI * G * mu) / (C * C);
      const deltaArcsec = delta * (180 / Math.PI) * 3600;
      return {
        rows: [
          { label: 'μ (GUT escala)', value: mu.toExponential(1), unit: 'kg/m' },
          { label: 'δ déficit', value: delta.toExponential(2), unit: 'rad' },
          { label: 'δ', value: deltaArcsec.toExponential(1), unit: 'arcsec' },
          { label: 'z cósmico', value: universe.cosmology.redshift.toFixed(4), unit: '' },
          { label: 'Red de cuerdas', value: 'topológica 1D', unit: '' },
        ],
      };
    },
  },
  lqg_bounce: {
    id: 'lqg_bounce',
    name: 'Rebote (gravedad cuántica de bucles)',
    short: 'La singularidad se reemplaza por un rebote cuántico.',
    description:
      'La gravedad cuántica de bucles (LQG) predice que la densidad máxima es finita (~ρ_Planck): el colapso se detiene y rebota. No hay r = 0. El interior del agujero negro sería una región de espaciotiempo que emerge de un "Big Bounce" cuántico, conectada al exterior por el horizonte como frontera térmica. Es la alternativa más estudiada a la singularidad clásica.',
    status: 'Investigación activa',
    color: 0x66ffcc,
    speculative: true,
    horizonVisual: hv({
      membraneColor: 0x66ffcc,
      membraneRipple: 1.4,
      interiorScale: 2.7,
      crossingFlash: 'planck_lattice',
      exteriorTint: [0.4, 1.2, 0.9],
      probeTrailColor: 0x88ffdd,
      crossingDescription:
        'Una esfera cian que rebota: la densidad de Planck detiene el colapso y el espacio repunta hacia afuera.',
    }),
    physicsBasis:
      'Densidad de Planck ρ_P, radio de rebote r_b ~ rₛ·(ρ_BH/ρ_P)^(1/3), área mínima cuantizada en LQG, masa M simulada.',
    computeReadouts(simContext) {
      const { universe, horizonSim } = simContext;
      const massKg = universe.massKg;
      const rs = schwarzschildRadius(massKg);
      const rhoP = (C ** 5) / (HBAR * G ** 2);
      const rhoBh = massKg / ((4 / 3) * Math.PI * rs ** 3);
      const bounceR = rs * Math.cbrt(rhoBh / rhoP);
      const aMin = Math.sqrt(4 * Math.PI * G * HBAR / (C ** 3 * rs ** 2));
      return {
        rows: [
          { label: 'ρ_Planck', value: rhoP.toExponential(2), unit: 'kg/m³' },
          { label: 'ρ_BH', value: rhoBh.toExponential(2), unit: 'kg/m³' },
          { label: 'Radio rebote', value: bounceR.toExponential(2), unit: 'm' },
          { label: 'Área mín. LQG', value: aMin.toExponential(2), unit: 'm²' },
          { label: 'Dilatación sonda', value: (horizonSim.effectiveTimeDilation * 100).toFixed(2), unit: '%' },
        ],
      };
    },
  },
  time_loop: {
    id: 'time_loop',
    name: 'Cerradura temporal (CTC)',
    short: 'Curvas cerradas de tipo tiempo: el interior es el exterior en bucle.',
    description:
      'Ficción de ruptura física: el espaciotiempo se enrolla como una banda de Möbius. Cruzar el horizonte no te lleva «adelante» sino a una región donde el futuro es pasado y el exterior es interior. Los relojes giran al revés; la causalidad local se cierra en un bucle perfecto — algo que la Relatividad General solo tolera bajo materia exótica imposible y que aquí se asume a propósito.',
    status: 'Ruptura física ★★',
    color: 0xff44aa,
    fiction: true,
    physicsBreak: true,
    horizonVisual: hv({
      membraneColor: 0xff44aa,
      membraneRipple: 2.2,
      membraneGlitch: true,
      interiorScale: 2.6,
      crossingFlash: 'time_reverse',
      exteriorTint: [1.3, 0.3, 0.9],
      probeTrailColor: 0xff66cc,
      crossingDescription:
        'La membrana se retuerce en Möbius: relojes invertidos y el exterior reaparece dentro del bucle temporal.',
    }),
    physicsBasis:
      'La GR permite CTC solo con condiciones de energía violadas (condición de energía débil). Aquí se viola a propósito: dilatación √(1−rₛ/r) invertida simbólicamente, flecha temporal Δt < 0 en la sonda.',
    computeReadouts(simContext) {
      const { horizonSim } = simContext;
      const dilation = horizonSim.effectiveTimeDilation;
      const loopIndex = 1 / Math.max(dilation, 1e-6);
      const paradox = Math.min(1, loopIndex * dilation);
      return {
        rows: [
          { label: 'Índice de bucle', value: loopIndex.toFixed(3), unit: 'adim' },
          { label: 'Δt sonda (simb.)', value: (-dilation * 100).toFixed(2), unit: '% (rev)' },
          { label: 'Paradoja CTC', value: (paradox * 100).toFixed(1), unit: '%' },
          { label: 'Causalidad', value: 'Cerrada', unit: '⚠' },
          { label: 'Modo', value: 'Ruptura ★★', unit: '' },
        ],
      };
    },
  },
  gravity_off: {
    id: 'gravity_off',
    name: 'Gravedad desactivada',
    short: 'G → 0 dentro del horizonte: nada atrae, todo flota.',
    description:
      'Ruptura física deliberada: al cruzar el horizonte la constante gravitacional local cae a cero. Las ecuaciones de Einstein dejan de acoplar masa y curvatura; el disco de acreción se invierte y los escombros flotan en lugar de caer. Es el opuesto pedagógico de Schwarzschild: un interior sin peso donde la gravedad fue «apagada» como un interruptor.',
    status: 'Ruptura física ★★',
    color: 0x88ddff,
    fiction: true,
    physicsBreak: true,
    horizonVisual: hv({
      membraneColor: 0x88ddff,
      membraneRipple: 1.8,
      membraneGlitch: true,
      interiorScale: 2.4,
      crossingFlash: 'gravity_invert',
      exteriorTint: [0.5, 1.2, 1.4],
      probeTrailColor: 0xaaeeff,
      crossingDescription:
        'Un chasquido de gravedad invertida: escombros flotando y el disco de acreción boca arriba sin atraer nada.',
    }),
    physicsBasis:
      'Newton: F = Gm₁m₂/r² con G_eff = 0 dentro de rₛ. Viola el principio de equivalencia y la curvatura de Einstein (G_μν = 8πG T_μν → plano con T ≠ 0).',
    computeReadouts(simContext) {
      const { universe, horizonSim } = simContext;
      const massKg = universe.massKg;
      const r = horizonSim.probeRadius;
      const rM = r * 1e10;
      const gNewton = (6.674e-11 * massKg) / (rM * rM);
      return {
        rows: [
          { label: 'G exterior', value: '6.674e-11', unit: 'm³/kg/s²' },
          { label: 'G interior', value: '0', unit: '⚠ apagado' },
          { label: 'g Newton (ref.)', value: gNewton.toExponential(2), unit: 'm/s²' },
          { label: 'g interior', value: '0', unit: 'm/s²' },
          { label: 'Equivalencia', value: 'Violada', unit: '' },
        ],
      };
    },
  },
  negative_mass: {
    id: 'negative_mass',
    name: 'Materia de masa negativa',
    short: 'Repulsión gravitatoria: el horizonte se expande hacia afuera.',
    description:
      'Si existiera materia con m < 0, la gravedad sería repulsiva. En esta ficción el interior del agujero negro está lleno de ella: las partículas huyen del centro, el horizonte parece crecer hacia el exterior y el colapso se invierte. La física real no permite masa negativa estable sin violar las condiciones de energía; aquí es el punto.',
    status: 'Ruptura física ★★',
    color: 0xff6688,
    fiction: true,
    physicsBreak: true,
    horizonVisual: hv({
      membraneColor: 0xff6688,
      membraneRipple: 2.0,
      membraneGlitch: true,
      interiorScale: 2.8,
      crossingFlash: 'gravity_invert',
      exteriorTint: [1.4, 0.4, 0.6],
      probeTrailColor: 0xff88aa,
      crossingDescription:
        'Partículas de masa negativa huyen del centro mientras el horizonte se hincha hacia afuera como un globo repulsivo.',
    }),
    physicsBasis:
      'F = G m₁m₂/r² con m₂ < 0 invierte la fuerza. Viola condiciones de energía (WEC/NEC). Radio de horizonte simbólico rₛ_eff = rₛ·(1 + |m_neg|/M).',
    computeReadouts(simContext) {
      const { universe, horizonSim } = simContext;
      const rs = universe.rsVis;
      const negFraction = 0.35;
      const rEff = rs * (1 + negFraction);
      const repulsion = negFraction * (horizonSim.probeRadius / rs);
      return {
        rows: [
          { label: 'Masa BH', value: universe.blackHoleMassSolar.toFixed(1), unit: 'M☉' },
          { label: 'Masa neg. (simb.)', value: (-universe.blackHoleMassSolar * negFraction).toFixed(2), unit: 'M☉' },
          { label: 'rₛ efectivo', value: rEff.toFixed(2), unit: 'u.vis' },
          { label: 'Fuerza (signo)', value: '+ (repulsiva)', unit: '⚠' },
          { label: 'Índice expansión', value: (repulsion * 100).toFixed(1), unit: '%' },
        ],
      };
    },
  },
  causality_shatter: {
    id: 'causality_shatter',
    name: 'Causa-efecto invertido',
    short: 'Los efectos preceden a las causas; la flecha temporal se rompe.',
    description:
      'Interior donde la correlación temporal se invierte: ves el resultado antes del origen. Fragmentos de línea temporal flotan como esquirlas de cristal; eventos se rebobinan. Viola el principio de causalidad de la relatividad (conos de luz) y la termodinámica de flecha temporal. Etiquetado explícitamente como ficción de ruptura.',
    status: 'Ruptura física ★★',
    color: 0xffaa33,
    fiction: true,
    physicsBreak: true,
    horizonVisual: hv({
      membraneColor: 0xffaa33,
      membraneRipple: 2.1,
      membraneGlitch: true,
      interiorScale: 2.5,
      crossingFlash: 'time_reverse',
      exteriorTint: [1.3, 0.9, 0.2],
      probeTrailColor: 0xffcc55,
      crossingDescription:
        'Esquirlas de línea temporal rotas: los eventos se deshacen hacia atrás mientras los efectos brillan antes que sus causas.',
    }),
    physicsBasis:
      'Causalidad: intervalo tipo tiempo exige que efectos sigan causas. Aquí Δt_causal < 0 simbólico; entropía local decrece (violación 2.ª ley etiquetada).',
    computeReadouts(simContext) {
      const { universe, engine } = simContext;
      const tSim = engine?.clock ?? 0;
      const reversed = -tSim;
      const shards = Math.floor(Math.abs(Math.sin(tSim * 0.5)) * 12) + 3;
      const entropySign = -1;
      return {
        rows: [
          { label: 't simulado', value: tSim.toFixed(2), unit: 's' },
          { label: 't causal (inv.)', value: reversed.toFixed(2), unit: 's ⚠' },
          { label: 'Esquirlas activas', value: String(shards), unit: 'eventos' },
          { label: 'ΔS (signo)', value: String(entropySign), unit: '⚠ 2.ª ley' },
          { label: 'Causalidad', value: 'Rota', unit: '' },
        ],
      };
    },
  },
  infinite_density_bounce: {
    id: 'infinite_density_bounce',
    name: 'Rebote de densidad infinita',
    short: 'ρ → ∞ sin singularidad: rebote con G negativo efectivo.',
    description:
      'Un núcleo alcanza densidad infinita pero, en lugar de r = 0, rebota con gravedad efectiva negativa. Oscila eternamente entre colapso y expansión. Combina dos imposibilidades: singularidad sin tragar información y G < 0 local. Visual: núcleo pulsante que nunca se detiene.',
    status: 'Ruptura física ★★',
    color: 0xff5522,
    fiction: true,
    physicsBreak: true,
    horizonVisual: hv({
      membraneColor: 0xff5522,
      membraneRipple: 1.9,
      membraneGlitch: true,
      interiorScale: 2.7,
      crossingFlash: 'gravity_invert',
      exteriorTint: [1.4, 0.35, 0.1],
      probeTrailColor: 0xff7744,
      crossingDescription:
        'Un núcleo naranja oscila entre colapso infinito y rebote repulsivo: densidad ∞ sin punto, G efectivo negativo.',
    }),
    physicsBasis:
      'ρ → ∞ pero V → 0 sin métrica singular; rebote con G_eff < 0. Viola teorema de Penrose (condiciones de energía) y positividad de G.',
    computeReadouts(simContext) {
      const { universe, horizonSim } = simContext;
      const massKg = universe.massKg;
      const rs = schwarzschildRadius(massKg);
      const rho = massKg / ((4 / 3) * Math.PI * (rs * 0.01) ** 3);
      const phase = Math.sin((horizonSim.probeRadius / horizonSim.rs) * Math.PI);
      return {
        rows: [
          { label: 'ρ core (simb.)', value: '∞', unit: 'kg/m³ ⚠' },
          { label: 'ρ finita ref.', value: rho.toExponential(2), unit: 'kg/m³' },
          { label: 'G_eff', value: (phase < 0 ? -1 : 1).toFixed(0), unit: '× G ⚠' },
          { label: 'Fase rebote', value: (phase * 100).toFixed(0), unit: '%' },
          { label: 'r singular', value: '0 (evitado)', unit: '' },
        ],
      };
    },
  },
  chronology_horizon: {
    id: 'chronology_horizon',
    name: 'Horizonte cronológico',
    short: 'Frontera temporal, no espacial: el tiempo se derrite al cruzar.',
    description:
      'El horizonte no es una superficie en r = cte sino una frontera entre eras temporales. Relojes se derriten literalmente; vectores de tiempo apuntan en direcciones imposibles. Inspirado en la conjetura de protección cronológica de Hawking — pero aquí la violamos a propósito para explorar paradojas.',
    status: 'Ruptura física ★★',
    color: 0xffdd55,
    fiction: true,
    physicsBreak: true,
    horizonVisual: hv({
      membraneColor: 0xffdd55,
      membraneRipple: 2.3,
      membraneGlitch: true,
      interiorScale: 2.4,
      crossingFlash: 'time_reverse',
      exteriorTint: [1.2, 1.0, 0.3],
      probeTrailColor: 0xffee66,
      crossingDescription:
        'Relojes derretidos y flechas de tiempo que apuntan en todas las direcciones: el horizonte es una frontera temporal.',
    }),
    physicsBasis:
      'Hawking: protección cronológica sugiere que la física impide CTC. Aquí el horizonte es τ = cte, no r = rₛ; dilatación √(1−rₛ/r) reemplazada por flujo temporal arbitrario.',
    computeReadouts(simContext) {
      const { horizonSim } = simContext;
      const dilation = horizonSim.effectiveTimeDilation;
      const chronology = 1 - dilation;
      const vectors = Math.floor(chronology * 8) + 1;
      return {
        rows: [
          { label: 'Tipo horizonte', value: 'Temporal', unit: '⚠ no espacial' },
          { label: 'Dilatación', value: (dilation * 100).toFixed(2), unit: '%' },
          { label: 'Flujo τ', value: chronology.toFixed(3), unit: 'adim' },
          { label: 'Vectores tiempo', value: String(vectors), unit: 'direcciones' },
          { label: 'Protección Hawking', value: 'Violada', unit: '' },
        ],
      };
    },
  },
  antigravity_core: {
    id: 'antigravity_core',
    name: 'Núcleo antigravitatorio',
    short: 'Un vacío central repele toda la materia (torsión fantástica).',
    description:
      'Fantasía inspirada en Einstein-Cartan con torsión extrema: el centro no atrae sino que repele. Una burbuja de vacío antigravitatorio empuja disco, partículas y luz hacia el horizonte interior. Viola el teorema de energía positiva y cualquier forma razonable de la ecuación de campo.',
    status: 'Ruptura física ★★',
    color: 0x66ffdd,
    fiction: true,
    physicsBreak: true,
    horizonVisual: hv({
      membraneColor: 0x66ffdd,
      membraneRipple: 1.7,
      membraneGlitch: true,
      interiorScale: 2.6,
      crossingFlash: 'gravity_invert',
      exteriorTint: [0.4, 1.3, 1.1],
      probeTrailColor: 0x88ffee,
      crossingDescription:
        'Una burbuja de vacío cian repele todo hacia fuera: el núcleo es ausencia que empuja en lugar de atraer.',
    }),
    physicsBasis:
      'Einstein-Cartan real añade torsión a la conexión; aquí la torsión genera repulsión central imposible. Viola teorema de energía positivo (ADM) y condición de energía.',
    computeReadouts(simContext) {
      const { universe, horizonSim } = simContext;
      const rs = universe.rsVis;
      const bubbleR = rs * 0.25;
      const push = (bubbleR / Math.max(horizonSim.probeRadius, 0.1)) ** 2;
      return {
        rows: [
          { label: 'Radio burbuja', value: bubbleR.toFixed(2), unit: 'u.vis' },
          { label: 'Presión vacío', value: (-push * 1e12).toExponential(2), unit: 'Pa ⚠' },
          { label: 'Torsión (simb.)', value: '∞', unit: 'Cartan' },
          { label: 'E total', value: '< 0', unit: '⚠' },
          { label: 'Atracción core', value: 'Repulsiva', unit: '' },
        ],
      };
    },
  },
  paradox_engine: {
    id: 'paradox_engine',
    name: 'Máquina de paradojas',
    short: 'La información crea y destruye masa; la entropía puede decrecer.',
    description:
      'El interior es un motor que convierte bits en gramos y viceversa. Cada paradoja lógica (bootstrap, abuelo, información sin origen) alimenta el núcleo. La entropía decrece visiblemente — violación flagrante de la segunda ley, etiquetada en pantalla. Puramente ficción para explorar límites conceptuales.',
    status: 'Ruptura física ★★',
    color: 0xcc44ff,
    fiction: true,
    physicsBreak: true,
    horizonVisual: hv({
      membraneColor: 0xcc44ff,
      membraneRipple: 2.4,
      membraneGlitch: true,
      interiorScale: 2.9,
      crossingFlash: 'time_reverse',
      exteriorTint: [1.1, 0.3, 1.4],
      probeTrailColor: 0xdd66ff,
      crossingDescription:
        'Engranajes de paradoja violetas: información se condensa en masa y la entropía baja con cada vuelta del motor.',
    }),
    physicsBasis:
      'E = mc² + k_B T ln(2)·I (Landauer extendido ficticio). Aquí Δm = f(paradoja) y ΔS < 0 permitido. Viola conservación de energía, información y segunda ley.',
    computeReadouts(simContext) {
      const { universe, engine } = simContext;
      const massKg = universe.massKg;
      const rs = schwarzschildRadius(massKg);
      const A = 4 * Math.PI * rs * rs;
      const S = (K_B * C ** 3 * A) / (4 * G * HBAR);
      const tSim = engine?.clock ?? 0;
      const paradoxIndex = Math.min(1, (Math.sin(tSim * 0.3) + 1) * 0.5);
      const entropyDelta = -paradoxIndex * (S / K_B) * 0.001;
      const massDelta = paradoxIndex * massKg * 1e-30;
      return {
        rows: [
          { label: 'Índice paradoja', value: paradoxIndex.toFixed(3), unit: 'adim' },
          { label: 'ΔS', value: entropyDelta.toExponential(2), unit: '× k_B ⚠' },
          { label: 'Δm (bits→masa)', value: massDelta.toExponential(2), unit: 'kg' },
          { label: '2.ª ley', value: 'Violada', unit: '⚠' },
          { label: 'E total', value: 'E < 0 posible', unit: '⚠' },
        ],
      };
    },
  },
  omega_multiverse: {
    id: 'omega_multiverse',
    name: 'Multiverso por Ω (teoría propia)',
    short: 'El interior ramifica según la razón Ωₘ/ΩΛ del cosmos simulado.',
    description:
      'El destino cosmológico (colapso, equilibrio o expansión eterna) depende de Ωₘ y ΩΛ. Al cruzar el horizonte, el interior se bifurca: ramas dominadas por materia (Ωₘ > ΩΛ), por energía oscura (ΩΛ ≫ Ωₘ) o en punto crítico. Cada rama es un universo hijo con el mismo H₀ pero distinto parámetro de desaceleración q(a) calculado en vivo.',
    status: 'Conclusión del motor híbrido',
    color: 0xaa77ff,
    original: true,
    horizonVisual: hv({
      membraneColor: 0xaa77ff,
      interiorScale: 2.0,
      crossingFlash: 'multiverse_fork',
      exteriorTint: [0.8, 0.5, 1.3],
      probeTrailColor: 0xcc99ff,
      crossingDescription:
        'Tres ramas cosmológicas bifurcándose según Ωₘ/ΩΛ: materia, equilibrio o energía oscura dominante.',
    }),
    physicsBasis:
      'Ωₘ, ΩΛ del solver Friedmann, parámetro q(a), classifyRegime en umbrales 100·rₛ y 80 u.vis, H(z) y a(t) actuales.',
    computeReadouts(simContext) {
      const { universe, horizonSim } = simContext;
      const readouts = universe.getReadouts();
      const { OmegaM, OmegaLambda, H0 } = universe.cosmology;
      const a = readouts.a;
      const E = Math.sqrt(OmegaM / a ** 3 + OmegaLambda);
      const q = OmegaM / (2 * a ** 3 * E ** 2) - OmegaLambda;
      const ratio = OmegaLambda > 0 ? OmegaM / OmegaLambda : Infinity;
      const regime = universe.classifyRegime(horizonSim.cameraRadius);
      let branch = 'equilibrio';
      if (ratio > 1.2) branch = 'materia dominante';
      else if (ratio < 0.5) branch = 'Λ dominante';
      return {
        rows: [
          { label: 'Ωₘ / ΩΛ', value: Number.isFinite(ratio) ? ratio.toFixed(3) : '∞', unit: 'adim' },
          { label: 'Rama interior', value: branch, unit: '' },
          { label: 'q(a) actual', value: q.toFixed(4), unit: 'adim' },
          { label: 'Régimen local', value: regimeLabel(regime), unit: '' },
          { label: 'Umbral híbrido', value: `${REGIME_THRESHOLDS.schwarzschildFactor}·rₛ`, unit: '' },
        ],
      };
    },
  },
};

export const THEORY_IDS = Object.keys(HORIZON_THEORIES);
export const DEFAULT_THEORY = 'hybrid_regime';

/** Teorías que violan física conocida a propósito (ficción ★★ Ruptura). */
export const PHYSICS_BREAK_THEORY_IDS = THEORY_IDS.filter((id) => HORIZON_THEORIES[id].physicsBreak);

export const PROBE_STATE = {
  IDLE: 'idle',
  APPROACHING: 'approaching',
  CROSSING: 'crossing',
  INSIDE: 'inside',
};
