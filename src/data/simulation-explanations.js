/**
 * Textos pedagógicos en español: explicaciones por modo y resúmenes de teorías.
 */

export const MODE_EXPLANATIONS = {
  black_hole: {
    id: 'black_hole',
    icon: '⚫',
    title: 'Agujero negro',
    intro: `El modo principal de la simulación: un agujero negro de Schwarzschild/Kerr en un universo en expansión. Aquí conviven el disco de acreción caliente, la membrana del horizonte, las teorías del interior, partículas N-cuerpos, lensing gravitacional y el motor híbrido completo. Es la experiencia más rica: puedes acercarte con la cámara, lanzar una sonda, cambiar la teoría del «otro lado» y ver cómo el cosmos exterior sigue expandiéndose mientras la gravedad local domina cerca del horizonte.`,
    physics: `<strong>Ecuaciones clave:</strong> radio de Schwarzschild <strong>rₛ = 2GM/c²</strong> (con G = 6,674×10⁻¹¹ m³ kg⁻¹ s⁻², c = 2,998×10⁸ m/s); dilatación temporal <strong>√(1 − rₛ/r)</strong>; ISCO a <strong>3 rₛ</strong> y esfera de fotones a <strong>1,5 rₛ</strong>. El motor híbrido clasifica cada distancia: por debajo de <strong>100·rₛ</strong> rige Schwarzschild, entre <strong>100·rₛ</strong> y <strong>80 u.vis</strong> el régimen N-cuerpos, y más allá Friedmann con <strong>H(a) = H₀√(Ωₘ/a³ + ΩΛ)</strong>. La masa por defecto es 10 M☉; el spin Kerr (0–0,998) deforma el disco.`,
    controls: `Panel derecho → <strong>Escena</strong>: este modo se selecciona como «Agujero negro». Ajusta <strong>masa</strong> y <strong>spin</strong> en Agujero negro; <strong>H₀, Ωₘ, ΩΛ</strong> en Cosmología; elige <strong>teoría del horizonte</strong> en Horizonte de sucesos. Activa <strong>lensing</strong>, <strong>geodésicas</strong> y <strong>universo vivo</strong> en Simulación. Usa <strong>▶ Enviar sonda</strong> o simplemente haz zoom con la rueda. <kbd>R</kbd> reinicia; <kbd>Espacio</kbd> pausa.`,
    whatToWatch: `<ol>
<li><strong>Vista inicial:</strong> agujero oscuro al centro, disco naranja-rojo, estrellas de fondo que parpadean y grid cósmico tenue.</li>
<li><strong>Acércate:</strong> el lensing curva las estrellas (efecto Einstein); la membrana del horizonte ondula con el pulso del universo vivo.</li>
<li><strong>Panel inferior izquierdo:</strong> teoría activa, lecturas físicas en vivo (entropía, dilatación, etc.) y progreso de inmersión.</li>
<li><strong>Cruce del horizonte:</strong> destello según la teoría; el interior 3D aparece (firewall, cuerdas, eco de Friedmann…).</li>
<li><strong>HUD superior izquierdo:</strong> a(t), z, H(t), rₛ y distancia comóvil d_c actualizados en tiempo real.</li>
</ol>`,
    faq: [
      { q: '¿Por qué el tiempo parece congelarse cerca del horizonte?', a: 'La dilatación temporal √(1−rₛ/r) → 0 para un observador externo. En la simulación verás «≈ 0%» en el panel de teoría cuando la cámara está muy cerca.' },
      { q: '¿Las teorías del interior son reales?', a: 'Algunas son predicciones o marcos aceptados (singularidad, holografía); otras son especulativas ★ o ficción ★★. Las marcadas como «teoría propia» derivan directamente del motor híbrido de esta app.' },
      { q: '¿Puedo ver el interior sin la sonda?', a: 'Sí: haz zoom con la rueda hasta que la inmersión de cámara supere ~80% del horizonte. La simulación activa el cruce automáticamente.' },
    ],
  },

  multiverse: {
    id: 'multiverse',
    icon: '🫧',
    title: 'Multiverso',
    intro: `Escena dedicada al multiverso cosmológico: decenas de burbujas-universo que se expanden según distintas combinaciones de Ωₘ y ΩΛ, con un portal central que conecta ramas bifurcadas. El agujero negro principal desaparece; el foco es la interpretación de muchos mundos y cómo tu cosmología activa (H₀, Ωₘ, ΩΛ del panel) colorea y modula las burbujas. Al entrar, la teoría del horizonte se fija automáticamente en «Multiverso por Ω».`,
    physics: `<strong>Base:</strong> cada burbuja obedece Friedmann con parámetros ligeramente distintos. El destino cosmológico depende de la razón <strong>Ωₘ/ΩΛ</strong>: si Ωₘ ≫ ΩΛ → colapso futuro; si ΩΛ domina → expansión acelerada eterna; cerca del equilibrio → universo crítico. El parámetro de desaceleración <strong>q(a) = Ωₘ/(2a³E²) − ΩΛ</strong> con <strong>E = √(Ωₘ/a³ + ΩΛ)</strong> clasifica cada rama. La teoría «Multiverso por Ω» calcula en vivo qué rama interior correspondería a tu cosmología.`,
    controls: `Selector de escena → <strong>Multiverso</strong>. Ajusta <strong>Ωₘ y ΩΛ</strong> en Cosmología y observa cómo cambian los colores y tamaños de las burbujas. Rota con arrastre, acerca al <strong>portal central</strong> para atravesar ramas. El panel inferior izquierdo muestra Ω activos y la razón Ωₘ/ΩΛ. Puedes volver al agujero negro desde el mismo selector.`,
    whatToWatch: `<ol>
<li><strong>Burbujas:</strong> esferas semitransparentes que pulsan y crecen; cada una representa un universo-hijo con distinto balance materia/energía oscura.</li>
<li><strong>Ramas coloreadas:</strong> tonos azules (materia dominante), violetas (Λ dominante), blancos (punto crítico).</li>
<li><strong>Portal central:</strong> espiral o túnel hacia el interior bifurcado; vuela hacia él para la experiencia inmersiva.</li>
<li><strong>Panel cosmología:</strong> lecturas Ωₘ, ΩΛ, Ωₘ/ΩΛ y conteo de burbujas activas (~70+).</li>
<li><strong>Sincronización:</strong> al cambiar H₀ o los Ω, las burbujas se recalculan con la cosmología del motor.</li>
</ol>`,
    faq: [
      { q: '¿Esto prueba que existen otros universos?', a: 'No. Es una visualización pedagógica de la interpretación cosmológica: cada burbuja ilustra qué pasaría con distintos parámetros de Friedmann, no una observación directa.' },
      { q: '¿Por qué no veo el agujero negro?', a: 'Este modo oculta el BH (bhScale = 0) para centrar la escena en el paisaje multiversal. Vuelve a «Agujero negro» para recuperarlo.' },
      { q: '¿Cómo se relaciona con la teoría del horizonte?', a: 'La teoría «Multiverso por Ω» postula que cruzar un horizonte te bifurca en ramas según tu cosmología. Este modo muestra esa idea a escala cósmica.' },
    ],
  },

  higgs: {
    id: 'higgs',
    icon: '✨',
    title: 'Partícula de Dios (Higgs)',
    intro: `Visualización abstracta del mecanismo de Higgs: un campo escalar φ en el vacío cuya expectativa ⟨φ⟩ ≠ 0 rompe la simetría electrodébil y da masa a fermiones y bosones W/Z. La estética evoca el LHC (anillos, chorros de partículas, núcleo dorado) pero no replica datos exactos del detector ATLAS/CMS: es un modelo pedagógico del concepto «la masa no es intrínseca, se acopla al campo».`,
    physics: `<strong>Potencial de Higgs:</strong> V(φ) = μ²φ² + λφ⁴ con mínimo en ⟨φ⟩ = v ≈ 246 GeV (constante de Fermi). El bosón de Higgs es la excitación cuántica alrededor del vacío. <strong>Acoplamiento de Yukawa:</strong> m_f = y_f · v/√2 para cada fermión. En pantalla verás lecturas simbólicas de ⟨φ⟩, λ, masas de electron/muón/tau y energía del vacío. No se simula QCD ni el lagrangiano completo del Modelo Estándar.`,
    controls: `Selector → <strong>Partícula de Dios (Higgs)</strong>. No hay agujero negro ni cosmología visible: solo la escena Higgs. Rota y acércate al <strong>núcleo dorado</strong> (el vacío del campo). El panel inferior izquierdo muestra lecturas simbólicas del campo. Pausa con <kbd>Espacio</kbd> para examinar fermiones que ganan masa al acercarse.`,
    whatToWatch: `<ol>
<li><strong>Núcleo dorado:</strong> representa el valor esperado del vacío ⟨φ⟩; pulsa suavemente.</li>
<li><strong>Fermiones coloridos:</strong> partículas que orbitan y, al acercarse al núcleo, «adquieren masa» (se vuelven más pesadas visualmente).</li>
<li><strong>Anillos tipo acelerador:</strong> estructura circular abstracta que evoca el LHC.</li>
<li><strong>Chorros y bosones W/Z:</strong> partículas de gauge que también se acoplan al campo.</li>
<li><strong>Panel de lecturas:</strong> ⟨φ⟩, λ, masas simbólicas y energía del vacío actualizadas.</li>
</ol>`,
    faq: [
      { q: '¿Es una réplica del experimento del CERN?', a: 'No. Es una metáfora visual del mecanismo de Higgs. Los valores numéricos son pedagógicos, no mediciones del LHC.' },
      { q: '¿Por qué se llama «Partícula de Dios»?', a: 'Apodo mediático del bosón de Higgs (descubierto en 2012). El campo, no la partícula sola, es lo que da masa a través del acoplamiento.' },
      { q: '¿Puedo combinar esto con el agujero negro?', a: 'No en este modo: la escena Higgs reemplaza el exterior. Cambia de modo en el selector de escena.' },
    ],
  },

  cosmology: {
    id: 'cosmology',
    icon: '🌌',
    title: 'Cosmología ΛCDM',
    intro: `Modo centrado en la expansión cósmica del modelo ΛCDM (Lambda-Cold Dark Matter). El agujero negro aparece minimizado (35% de escala, 25% de opacidad) como referencia local, pero el protagonista es el universo entero: factor de escala a(t), redshift z, parámetro de Hubble H(t) y campo estelar que se estira con la expansión. Ideal para entender Friedmann sin distracciones del horizonte.`,
    physics: `<strong>Ecuación de Friedmann:</strong> H² = (ȧ/a)² = (8πG/3)ρ − k/a² + Λ/3. En unidades adimensionales: <strong>H(a) = H₀√(Ωₘ/a³ + ΩΛ)</strong>. El factor de escala crece con el tiempo cósmico; <strong>z = 1/a − 1</strong>. Presets (ΛCDM, Planck 2018…) cargan H₀ ≈ 67–70 km/s/Mpc, Ωₘ ≈ 0,3, ΩΛ ≈ 0,7. La distancia comóvil d_c se integra numéricamente y aparece en el HUD.`,
    controls: `Selector → <strong>Cosmología ΛCDM</strong>. Panel Cosmología: ajusta <strong>H₀</strong>, <strong>Ωₘ</strong>, <strong>ΩΛ</strong> o elige un preset. Observa el HUD (a, z, H, d_c) y el laboratorio (era cósmica, timeline). La cámara empieza más alejada (z=200) para abarcar más universo. Activa universo vivo para ver estrellas nacer y el grid distorsionarse.`,
    whatToWatch: `<ol>
<li><strong>Campo estelar:</strong> miles de puntos que parpadean y se separan con a(t).</li>
<li><strong>Grid cósmico:</strong> malla que se expande y ondula con los pulsos del LifeEngine.</li>
<li><strong>Agujero negro tenue:</strong> referencia de escala local, casi transparente.</li>
<li><strong>HUD:</strong> a(t) crece lentamente; z decrece hacia 0 (universo actual).</li>
<li><strong>Panel laboratorio:</strong> era cósmica (recombinación, edad de las estrellas…) según z actual.</li>
</ol>`,
    faq: [
      { q: '¿Por qué el agujero negro casi no se ve?', a: 'Este modo reduce bhScale a 0,35 y opacidad al 25% para no robar atención a la expansión global. Sigue interactuando con partículas si las activas.' },
      { q: '¿Los presets son datos reales?', a: 'Sí, aproximaciones basadas en observaciones (Planck 2018, WMAP, etc.). Puedes modificarlos libremente después.' },
      { q: '¿Cómo sé en qué era estoy?', a: 'El panel Laboratorio (izquierda, debajo del HUD) muestra la era según z: inflación, nucleosíntesis, recombinación, edad oscura, estrellas, hoy.' },
    ],
  },

  theory_picker: {
    id: 'theory_picker',
    icon: '🌀',
    title: 'Teoría del horizonte',
    intro: `Modo optimizado para explorar las 30+ teorías del interior del agujero negro. La cámara arranca cerca del horizonte (z≈55) y el panel inferior muestra la teoría activa con lecturas físicas en vivo. Incluye un selector rápido de teorías destacadas (Singularidad, Firewall, ER=EPR, Cuerdas, Multiverso Ω, Islas Hawking, Agujero blanco, Fuzzball). Ideal para comparar predicciones sin navegar todo el menú.`,
    physics: `Cada teoría define un <strong>interior 3D</strong> distinto y lecturas calculadas con las fórmulas del motor: entropía de Bekenstein-Hawking <strong>S = k_B c³ A / (4Gℏ)</strong>, temperatura de Hawking, dilatación temporal, H(z), ratio rₛ/l_P, etc. Las teorías propias (★) derivan de los umbrales híbridos <strong>100·rₛ</strong> y <strong>80 u.vis</strong>. Al cruzar, la membrana cambia de color y el interior aparece con opacidad proporcional a la inmersión.`,
    controls: `Selector → <strong>Teoría del horizonte</strong>. En Horizonte de sucesos elige la teoría del menú desplegable o usa <strong>teorías destacadas</strong>. Botón <strong>Zoom al horizonte</strong> recentra la cámara. <strong>▶ Enviar sonda</strong> para cruce automático. Expande <strong>ℹ️ Más info</strong> en el panel inferior para el resumen extendido de cada teoría. Tour 60s en controles para recorrido guiado.`,
    whatToWatch: `<ol>
<li><strong>Membrana del horizonte:</strong> color y ripple según teoría (naranja firewall, cian holográfico, violeta cuerdas…).</li>
<li><strong>Panel teoría:</strong> nombre, estado, descripción, «Qué verás al cruzar», lecturas en vivo.</li>
<li><strong>ℹ️ Más info:</strong> párrafo resumen de la teoría seleccionada (referencia rápida).</li>
<li><strong>Cruce:</strong> destello visual + interior 3D (túnel, fuzzball, biblioteca de Babel…).</li>
<li><strong>Explainer superior:</strong> al entrar por primera vez, se expande 5 s con la guía de este modo.</li>
</ol>`,
    faq: [
      { q: '¿Cuál es la diferencia con el modo Agujero negro?', a: 'Misma escena física, pero cámara más cerca del horizonte y enfoque en el selector de teorías. Pensado para comparar interiores rápidamente.' },
      { q: '¿Qué significan ★ y ★★?', a: '★ = especulativa (cuerdas, islas Hawking, fuzzball…). ★★ = ficción (Biblioteca de Babel) o ruptura física ★★ (CTC, G=0, masa negativa…) que viola leyes conocidas a propósito.' },
      { q: '¿Las lecturas en vivo son exactas?', a: 'Usan constantes SI reales (G, c, ℏ) con la masa y cosmología del simulador. Algunas escalas son simbólicas en teorías especulativas.' },
    ],
    showTheorySummaries: true,
  },

  binary_merger: {
    id: 'binary_merger',
    icon: '💥',
    title: 'Choque de agujeros negros',
    intro: `Simulación de un sistema binario de agujeros negros: inspiral por pérdida de energía orbital vía ondas gravitacionales (fórmula de Peters), fusión de horizontes, ringdown del remanente y —opcionalmente— evaporación de Hawking acelerada visualmente. Incluye ondas GW visibles como anillos expansivos que distorsionan el campo estelar. Inspirado en eventos como GW150914 (LIGO/Virgo).`,
    physics: `<strong>Pérdida de energía GW (Peters):</strong> dE/dt = −(32/5)(G⁴μ²M³)/(c⁵r⁵) con μ = m₁m₂/(m₁+m₂). La frecuencia del chirp aumenta al acercarse: <strong>f_GW ≈ 2×f_orbital</strong>. En la fusión ~5% de la masa se irradia; el remanente oscila en <strong>ringdown</strong> (cuasi-normal modes). <strong>Evaporación:</strong> t_evap ∝ M³; temperatura T_H = ℏc³/(8πGMk_B). El strain h y la energía radiada E_rad aparecen en el HUD y panel.`,
    controls: `Selector → <strong>Choque de agujeros negros</strong>. En controles Binario: ajusta <strong>M₁, M₂</strong> (masas solares), spins, <strong>Iniciar colisión</strong>, escala temporal y toggle <strong>muerte Hawking</strong>. La cámara orbita automáticamente el baricentro. <kbd>Espacio</kbd> pausa la fase actual (inspiral, merger, ringdown, evaporación).`,
    whatToWatch: `<ol>
<li><strong>Inspiral:</strong> dos BH orbitan, espiralan hacia dentro; anillos GW azul-blancos se expanden desde el centro.</li>
<li><strong>Fusión:</strong> destello dorado + pulso de memoria gravitacional; los horizontes se unen.</li>
<li><strong>Ringdown:</strong> el remanente oscila y se estabiliza; ondas de amplitud decreciente.</li>
<li><strong>Evaporación (opcional):</strong> el BH pierde masa por Hawking hasta desaparecer.</li>
<li><strong>Paneles:</strong> fase, M₁/M₂, separación, strain h, f_GW, E_rad, T_Hawking; eventos en tiempo real.</li>
</ol>`,
    faq: [
      { q: '¿Las ondas gravitacionales son realistas?', a: 'La tasa de inspiral sigue Peters en orden de magnitud; la visualización de anillos es pedagógica, no una solución numérica de Einstein completa.' },
      { q: '¿Qué es el ringdown?', a: 'Oscilaciones del horizonte del remanente tras la fusión, como un tambor que vibra y se amortigua. Dura milisegundos en sistemas estelares.' },
      { q: '¿Por qué la evaporación es tan rápida?', a: 'Está acelerada visualmente: un BH estelar tardaría ~10⁶⁷ años en evaporarse. Aquí puedes ver el proceso completo en minutos.' },
    ],
  },

  string_theory: {
    id: 'string_theory',
    icon: '🎻',
    title: 'Teoría de cuerdas',
    intro: `Vuelo cinematográfico a lo largo de una cuerda cósmica gigante en un vacío con branas D colisionando — modelo pedagógico del escenario ekpyrótico (Big Bang como choque de branas). También puedes ver el interior «cuerdas» del agujero negro si eliges esa teoría en el modo horizonte. Aquí no hay BH: solo el paisaje de cuerdas, dimensiones extra compactificadas y modos vibracionales.`,
    physics: `<strong>Cuerdas:</strong> objetos 1D con tensión T ≈ 1/(2πα′); modos vibracionales determinan la «partícula» (gravitón = modo cerrado). <strong>Dimensiones extra:</strong> compactificadas en variedades Calabi-Yau con radio R ~ l_P√(rₛ/l_P) (simbólico). <strong>Acoplamiento g_s</strong> y entropía de Bekenstein como conteo de micro-estados. La cámara sigue una trayectoria sinusoidal a lo largo de la cuerda principal. Colisión de branas → pulso de energía visual (no cálculo M-theory completo).`,
    controls: `Selector → <strong>Teoría de cuerdas</strong>. La cámara se mueve automáticamente; puedes rotar ligeramente con arrastre. Panel inferior: lecturas de g_s, R compact., modos n, entropía. Para ver cuerdas <em>dentro</em> de un agujero negro, usa modo Agujero negro o Teoría del horizonte y elige «Teoría de cuerdas ★».`,
    whatToWatch: `<ol>
<li><strong>Cuerda principal:</strong> filamento luminoso que serpentea; la cámara lo recorre.</li>
<li><strong>Branas D:</strong> planos translúcidos que se acercan y colisionan periódicamente.</li>
<li><strong>Modos vibracionales:</strong> ondas que recorren la cuerda a distintas frecuencias.</li>
<li><strong>Dimensiones extra:</strong> rejillas ortogonales que sugieren compactificación.</li>
<li><strong>Panel:</strong> g_s, radio de compactificación, número de modos, entropía simbólica.</li>
</ol>`,
    faq: [
      { q: '¿Esto confirma la teoría de cuerdas?', a: 'No. Es una visualización educativa de conceptos (cuerdas, branas, compactificación). No hay predicciones testables directas aquí.' },
      { q: '¿En qué se diferencia del interior «cuerdas» del horizonte?', a: 'Este modo es un vuelo por el vacío cósmico; el interior del horizonte muestra Calabi-Yau, branas y lecturas acopladas a la masa del BH simulado.' },
      { q: '¿Puedo controlar la cámara libremente?', a: 'Parcialmente: hay seguimiento automático de la cuerda con suavizado. OrbitControls permiten ajustes, pero el modo está diseñado para el vuelo guiado.' },
    ],
  },
};

/** Resumen de una frase/párrafo por teoría del horizonte */
export const THEORY_SUMMARIES = {
  singularity: 'La Relatividad General clásica predice que toda la masa colapsa en r = 0 con densidad infinita. Es la predicción estándar, pero se cree que la gravedad cuántica reemplaza la singularidad.',
  white_hole: 'Solución matemática inversa al agujero negro: solo expulsa materia, nada entra. Podría ser el otro extremo de un diagrama de Penrose, aunque ninguno se ha observado.',
  wormhole: 'Un túnel (puente Einstein-Rosen) que conectaría dos regiones del espaciotiempo. Requiere materia exótica con energía negativa para permanecer abierto; sin ella colapsa en microsegundos.',
  baby_universe: 'El colapso podría «rebotar» en un Big Bang local, creando un universo hijo con constantes físicas ligeramente distintas (propuesta de Lee Smolin y otros).',
  firewall: 'Para resolver la paradoja de la información, AMPS propuso una pared de radiación ultraluminosa en el horizonte que destruiría cualquier cruzador, violando el principio de equivalencia.',
  holographic: 'La información de todo lo que cae queda codificada en la superficie 2D del horizonte (principio holográfico, AdS/CFT). El interior sería una descripción equivalente, no un lugar físico separado.',
  quantum_foam: 'A la escala de Planck (~10⁻³⁵ m) el espaciotiempo deja de ser liso y se vuelve «espumoso». La gravedad cuántica podría eliminar la singularidad clásica.',
  friedmann_echo: 'Teoría propia del motor: el interior no es otro lugar sino el universo en expansión visto desde coordenadas congeladas cerca del horizonte, dominado por el factor de escala a(t).',
  hybrid_regime: 'Teoría propia: en el horizonte coexisten Schwarzschild (< 100·rₛ), N-cuerpos (hasta 80 u.vis) y Friedmann (más allá). Ningún régimen solo describe el cruce.',
  temporal_fracture: 'Teoría propia: el horizonte fractura dos relojes — el externo te ve congelado; en coordenadas propias cruzas en tiempo finito y encuentras un cosmos futuro.',
  information_loop: 'Teoría propia: la información de partículas caídas se distribuye en el horizonte, se mezcla con el redshift cosmológico y reaparece como radiación de baja energía sin destruirse.',
  planck_threshold: 'Teoría propia: al acercarse a rₛ la curvatura alcanza la escala de Planck; la singularidad se disuelve en una red de burbujas cuánticas cuyo tamaño crece con la masa.',
  cosmic_resonance: 'Teoría propia: la frecuencia de Hubble H(z) excita un resonador interior; las capas del otro lado pulsan como armónicos de a(t) medido en vivo.',
  accretion_inverted: 'Teoría propia: el horizonte invierte el flujo del disco de acreción según límites de Eddington; la materia que cae reaparece expulsándose hacia el centro.',
  eternal_geodesic: 'Teoría propia: el interior es una red de geodésicas lumínicas atrapadas en la esfera de fotones (r = 1,5 rₛ), luz que nunca cae ni escapa.',
  max_entropy: 'Teoría propia: el interior es el microestado de máxima entropía Bekenstein-Hawking compatible con la masa; solo equilibrio térmico, sin geometría clásica.',
  hawking_islands: 'La paradoja de la información se resuelve con «islas» cuánticas de entropía fuera del horizonte, entrelazadas con la radiación de Hawking (propuesta Page et al.).',
  er_epr_bridge: 'Conjetura Maldacena-Susskind: el entrelazamiento cuántico (EPR) es equivalente a un puente Einstein-Rosen (ER) microscópico. Cruzar el horizonte revela esta red de puentes.',
  planck_star: 'Propuesta de Rovelli-Vidotto: el colapso rebota en densidad de Planck formando una estrella ultra-densa del tamaño de rₛ, sin singularidad en r = 0.',
  string_theory: 'El interior sería un bulk con dimensiones extra compactificadas (Calabi-Yau), cuerdas vibrantes y branas D; la entropía del horizonte cuenta modos de cuerdas (AdS/CFT, fuzzballs).',
  fuzzball: 'Propuesta de Mathur: no hay horizonte liso sino una superposición de micro-estados de cuerdas extendidas («pelota borrosa») que reproduce la entropía sin paradoja.',
  cpt_mirror: 'El interior sería un universo CPT-espejo donde carga, paridad y flecha temporal se invierten; la materia caída reaparece como antimateria en expansión.',
  ads_cft_dynamic: 'Modelo AdS/CFT dinámico: el volumen interior (Anti-de Sitter) es dual a una teoría de campos conforme en el horizonte 2D; H(z) modula el acoplamiento.',
  babel_library: 'Ficción científica (Borges): el interior es una biblioteca infinita donde cada bit del horizonte abre un volumen de micro-estados posibles del universo.',
  friedmann_gate: 'Ficción cosmológica: cruzar el horizonte abre un universo Friedmann gemelo con Ωₘ y ΩΛ intercambiados, calculado en vivo por el motor.',
  cosmic_inflation: 'El interior sería el campo inflatón en expansión exponencial temprana, el mismo mecanismo que estiró el cosmos en la fracción de segundo posterior al Big Bang.',
  dark_matter: 'Un halo invisible de materia oscura (~85% de Ωₘ) distorsiona geodésicas y produce lensing sin emisión luminosa, dominando la dinámica interior.',
  dark_energy: 'La energía oscura (Λ, ~70% del universo) acelera la expansión del interior igual que el cosmos exterior, diluyendo cualquier materia que cruce.',
  cosmic_strings: 'Defectos topológicos unidimensionales del universo temprano atraviesan el interior, curvando el espacio con ángulos de déficit sin masa local.',
  lqg_bounce: 'La gravedad cuántica de bucles predice un rebote en densidad de Planck: no hay r = 0, el colapso se detiene y el espaciotiempo repunta.',
  omega_multiverse: 'Teoría propia: el interior se bifurca en ramas según Ωₘ/ΩΛ — materia dominante, equilibrio o Λ dominante — cada una un universo hijo con distinto destino.',
  time_loop: 'Ruptura física ★★: curvas cerradas de tipo tiempo — el interior es el exterior en un bucle de Möbius; relojes invertidos y causalidad cerrada (imposible sin materia exótica).',
  gravity_off: 'Ruptura física ★★: G → 0 dentro del horizonte; escombros flotan y el disco se invierte. Viola el principio de equivalencia y Einstein.',
  negative_mass: 'Ruptura física ★★: materia de masa negativa repele gravitatoriamente; el horizonte se expande hacia afuera. Viola condiciones de energía.',
  causality_shatter: 'Ruptura física ★★: efectos preceden causas; esquirlas de línea temporal y entropía que decrece localmente.',
  infinite_density_bounce: 'Ruptura física ★★: densidad infinita sin singularidad, rebote con G efectivo negativo; núcleo que oscila eternamente.',
  chronology_horizon: 'Ruptura física ★★: el horizonte es frontera temporal, no espacial; relojes derretidos y protección cronológica de Hawking violada.',
  antigravity_core: 'Ruptura física ★★: núcleo de vacío antigravitatorio que repele todo (fantasía Einstein-Cartan). Viola energía positiva.',
  paradox_engine: 'Ruptura física ★★: información crea/destruye masa; índice de paradoja y ΔS < 0 etiquetado — viola conservación y 2.ª ley.',
};
