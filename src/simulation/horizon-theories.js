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
  },
  white_hole: {
    id: 'white_hole',
    name: 'Agujero blanco',
    short: 'Inverso temporal de un agujero negro: solo expulsa materia.',
    description:
      'Solución matemática de las ecuaciones de Einstein donde el tiempo se invierte. Nada puede entrar, solo salir. Podría ser el "otro lado" de un agujero negro en un diagrama de Penrose extendido, aunque ningún agujero blanco se ha observado.',
    status: 'Solución matemática',
    color: 0xffffff,
  },
  wormhole: {
    id: 'wormhole',
    name: 'Puente Einstein-Rosen',
    short: 'Un túnel que conecta dos regiones del espaciotiempo.',
    description:
      'Un "agujero de gusano" podría conectar el interior del agujero negro con otra región del universo o un universo paralelo. Requiere materia exótica con energía negativa para mantenerse estable; sin ella, el puente colapsa en microsegundos.',
    status: 'Hipotético',
    color: 0x44aaff,
  },
  baby_universe: {
    id: 'baby_universe',
    name: 'Universo hijo',
    short: 'El colapso da origen a un nuevo universo en expansión.',
    description:
      'Propuesta de Lee Smolin y otros: el interior del agujero negro podría "rebotar" en un Big Bang local, creando un universo hijo con constantes físicas ligeramente diferentes. Nuestro universo podría ser el hijo de un agujero negro anterior.',
    status: 'Especulativo',
    color: 0xaa66ff,
  },
  firewall: {
    id: 'firewall',
    name: 'Firewall (paradoja de la información)',
    short: 'Una pared de energía incandescente destruye todo en el horizonte.',
    description:
      'Para resolver la paradoja de la información (¿qué pasa con los datos que caen?), AMPS propuso que el horizonte no es un paso tranquilo: es una pared de partículas de altísima energía que incinera cualquier cosa que lo cruce, violando el principio de equivalencia.',
    status: 'Debate activo',
    color: 0xff8800,
  },
  holographic: {
    id: 'holographic',
    name: 'Principio holográfico',
    short: 'La información se codifica en la superficie del horizonte.',
    description:
      'La información de todo lo que cae al agujero negro queda codificada en el horizonte de sucesos como un holograma 2D. El interior sería una descripción equivalente pero no hay "otro lado" físico: la información persiste en la superficie y eventualmente se libera como radiación de Hawking.',
    status: 'Marco teórico (AdS/CFT)',
    color: 0x00ffaa,
  },
  quantum_foam: {
    id: 'quantum_foam',
    name: 'Espuma cuántica (gravedad cuántica)',
    short: 'A escala de Planck, el espaciotiempo deja de ser continuo.',
    description:
      'La gravedad cuántica (loops, cuerdas, etc.) sugiere que la singularidad no existe: el espaciotiempo se vuelve "espumoso" a la escala de Planck (~10⁻³⁵ m). El colapso podría detenerse y rebotar, o conectarse a otra región sin singularidad.',
    status: 'Investigación activa',
    color: 0x88ff44,
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
  fuzzball: {
    id: 'fuzzball',
    name: 'Fuzzball (cuerdas)',
    short: 'Superposición de micro-estados sin horizonte clásico.',
    description:
      'Propuesta de la teoría de cuerdas (Mathur): el agujero negro no tiene un horizonte liso. Es una "pelota borrosa" (fuzzball) — superposición de estados de cuerdas extendidas del tamaño de rₛ. No hay interior vacío: cada micro-estado es una configuración distinta de cuerdas que reproduce la entropía de Bekenstein-Hawking sin paradoja.',
    status: 'Especulativa ★',
    color: 0x88ffaa,
    speculative: true,
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
  omega_multiverse: {
    id: 'omega_multiverse',
    name: 'Multiverso por Ω (teoría propia)',
    short: 'El interior ramifica según la razón Ωₘ/ΩΛ del cosmos simulado.',
    description:
      'El destino cosmológico (colapso, equilibrio o expansión eterna) depende de Ωₘ y ΩΛ. Al cruzar el horizonte, el interior se bifurca: ramas dominadas por materia (Ωₘ > ΩΛ), por energía oscura (ΩΛ ≫ Ωₘ) o en punto crítico. Cada rama es un universo hijo con el mismo H₀ pero distinto parámetro de desaceleración q(a) calculado en vivo.',
    status: 'Conclusión del motor híbrido',
    color: 0xaa77ff,
    original: true,
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

export const PROBE_STATE = {
  IDLE: 'idle',
  APPROACHING: 'approaching',
  CROSSING: 'crossing',
  INSIDE: 'inside',
};
