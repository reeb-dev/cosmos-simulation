const SECTIONS = [
  {
    id: 'motor',
    icon: '⚙️',
    title: 'Motor híbrido de física',
    body: `Combina <strong>tres regímenes</strong> que en la física real rara vez se estudian juntos:

<strong>1. Friedmann (cosmológico):</strong> gobierna la expansión del universo entero. El factor de escala <strong>a(t)</strong> crece según <strong>H(a) = H₀√(Ωₘ/a³ + ΩΛ)</strong>. Aplica cuando la distancia al agujero negro supera el umbral local.

<strong>2. Schwarzschild/Kerr (relativista):</strong> describe la gravedad fuerte cerca del horizonte. Radio <strong>rₛ = 2GM/c²</strong>, dilatación temporal <strong>√(1−rₛ/r)</strong>, ISCO a <strong>3 rₛ</strong>, esfera de fotones a <strong>1,5 rₛ</strong>. Órbitas, caída libre y captura de partículas.

<strong>3. N-cuerpos (newtoniano):</strong> partículas que interactúan gravitacionalmente entre sí y con el agujero. Útil en la zona intermedia donde ni la relatividad pura ni la cosmología dominan solas.

<strong>Umbrales del motor</strong> (constantes en <code>REGIME_THRESHOLDS</code>):
<ul>
<li><strong>&lt; 100·rₛ</strong> → régimen Schwarzschild: geodésicas relativistas, marea, horizonte.</li>
<li><strong>100·rₛ … 80 u.vis</strong> → régimen N-cuerpos: interacciones múltiples, órbitas keplerianas perturbadas.</li>
<li><strong>&gt; 80 u.vis</strong> → régimen Friedmann: expansión cósmica, redshift, H(t).</li>
</ul>
El simulador clasifica cada objeto según su distancia al horizonte y aplica el modelo adecuado. La teoría propia «Zona de transición híbrida» visualiza exactamente esta superposición en el cruce del horizonte.`,
  },
  {
    id: 'mode_bh',
    icon: '⚫',
    title: 'Modo: Agujero negro',
    body: `<strong>Qué simula:</strong> el modo completo con BH + cosmos + teorías del horizonte + partículas + lensing.

<strong>Física:</strong> rₛ = 2GM/c², spin Kerr 0–0,998, motor híbrido con umbrales 100·rₛ y 80 u.vis.

<strong>Controles:</strong> masa, spin, cosmología, teoría del horizonte, sonda, universo vivo, geodésicas, lensing.

<strong>En pantalla:</strong> disco de acreción → acercamiento → lensing de estrellas → membrana ondulante → cruce → interior según teoría.

<strong>FAQ:</strong> ¿Sin sonda? Haz zoom. ¿Tiempo congelado? Dilatación → 0. ¿Teorías reales? Mezcla de física establecida, especulación ★ y ficción ★★.`,
  },
  {
    id: 'mode_multi',
    icon: '🫧',
    title: 'Modo: Multiverso',
    body: `<strong>Qué simula:</strong> ~70 burbujas-universo con distintos Ωₘ/ΩΛ, portal central, ramas bifurcadas.

<strong>Física:</strong> Friedmann por burbuja; q(a) = Ωₘ/(2a³E²) − ΩΛ; teoría auto «Multiverso por Ω».

<strong>Controles:</strong> Ωₘ, ΩΛ, H₀ en cosmología; vuela al portal central.

<strong>En pantalla:</strong> burbujas pulsantes → colores por destino cosmológico → portal espiral → panel Ω activos.

<strong>FAQ:</strong> No es prueba experimental. El BH se oculta a propósito. Relacionado con teoría omega_multiverse.`,
  },
  {
    id: 'mode_higgs',
    icon: '✨',
    title: 'Modo: Higgs',
    body: `<strong>Qué simula:</strong> mecanismo de Higgs abstracto — campo φ, vacío ⟨φ⟩, acoplamiento de masa a fermiones.

<strong>Física:</strong> V(φ) = μ²φ² + λφ⁴; v ≈ 246 GeV; Yukawa m_f = y_f·v/√2. Valores en pantalla son simbólicos.

<strong>Controles:</strong> solo navegación (rotar, zoom). Sin BH ni cosmología.

<strong>En pantalla:</strong> núcleo dorado → fermiones que ganan masa al acercarse → anillos tipo LHC.

<strong>FAQ:</strong> No replica ATLAS/CMS. El bosón da masa vía acoplamiento al campo, no solo por existir.`,
  },
  {
    id: 'mode_cosmo',
    icon: '🌌',
    title: 'Modo: Cosmología ΛCDM',
    body: `<strong>Qué simula:</strong> expansión del universo entero; BH minimizado (35% escala, 25% opacidad).

<strong>Física:</strong> H(a) = H₀√(Ωₘ/a³ + ΩΛ), z = 1/a−1, d_c integrada, presets Planck/WMAP.

<strong>Controles:</strong> H₀, Ωₘ, ΩΛ, presets; universo vivo; laboratorio de eras.

<strong>En pantalla:</strong> estrellas que se separan → grid cósmico expandiéndose → HUD a(t), z, H, d_c.

<strong>FAQ:</strong> BH tenue a propósito. Presets ≈ datos reales. Era cósmica en panel Laboratorio.`,
  },
  {
    id: 'mode_theory',
    icon: '🌀',
    title: 'Modo: Teoría del horizonte',
    body: `<strong>Qué simula:</strong> exploración de 30+ teorías del interior; cámara cerca del horizonte.

<strong>Física:</strong> cada teoría con interior 3D, lecturas S, T_H, dilatación, H(z), rₛ/l_P según corresponda.

<strong>Controles:</strong> selector de teoría, destacadas, zoom al horizonte, sonda, ℹ️ Más info en panel.

<strong>En pantalla:</strong> membrana coloreada → panel con lecturas → cruce → interior teórico → resumen expandible.

<strong>FAQ:</strong> Igual escena que BH pero enfoque en teorías. ★ especulativa, ★★ ficción. Lecturas con constantes SI reales.`,
  },
  {
    id: 'mode_binary',
    icon: '💥',
    title: 'Modo: Choque binario',
    body: `<strong>Qué simula:</strong> inspiral → fusión → ringdown → evaporación Hawking (opcional).

<strong>Física:</strong> pérdida energía Peters dE/dt ∝ r⁻⁵; strain h; f_GW chirp; ~5% masa radiada; t_evap ∝ M³.

<strong>Controles:</strong> M₁, M₂, spins, Iniciar colisión, muerte Hawking, escala temporal.

<strong>En pantalla:</strong> espiral → anillos GW → destello fusión → ringdown → evaporación → vacío.

<strong>FAQ:</strong> Inspiral realista en orden de magnitud. Ringdown = oscilación del remanente. Evaporación acelerada visualmente.`,
  },
  {
    id: 'mode_strings',
    icon: '🎻',
    title: 'Modo: Teoría de cuerdas',
    body: `<strong>Qué simula:</strong> vuelo por cuerda cósmica, branas colisionando, modos vibracionales.

<strong>Física:</strong> cuerdas 1D, compactificación Calabi-Yau, g_s, R ~ l_P, entropía como conteo de modos.

<strong>Controles:</strong> cámara automática + orbit manual ligero. Teoría auto «string_theory».

<strong>En pantalla:</strong> cuerda serpenteante → branas D → ondas en la cuerda → lecturas g_s, modos n.

<strong>FAQ:</strong> Pedagógico, no confirmación experimental. Distinto del interior «cuerdas» del horizonte.`,
  },
  {
    id: 'cosmo',
    icon: '📐',
    title: 'Cosmología (parámetros)',
    body: `El universo se expande según Friedmann. Parámetros clave:
<ul>
<li><strong>H₀</strong> — velocidad de expansión hoy (km/s/Mpc). Default 70.</li>
<li><strong>Ωₘ</strong> — fracción de densidad en materia (bariones + oscura). Default 0,3.</li>
<li><strong>ΩΛ</strong> — fracción en energía oscura. Default 0,7.</li>
</ul>
El factor <strong>a(t)</strong> y el redshift <strong>z = 1/a − 1</strong> aparecen en el HUD. La distancia comóvil <strong>d_c</strong> se calcula integrando c·dt/a. Presets (ΛCDM, Planck 2018, WMAP, etc.) cargan combinaciones basadas en observaciones. El parámetro de desaceleración <strong>q(a)</strong> indica si el universo frena o acelera.`,
  },
  {
    id: 'bh',
    icon: '⚫',
    title: 'Agujero negro (parámetros)',
    body: `La <strong>masa</strong> (en M☉) determina rₛ = 2GM/c². A 10 M☉, rₛ ≈ 30 km. El <strong>spin Kerr</strong> (0–0,998) deforma el espacio-tiempo, arrastra el espacio (efecto Lense-Thirring) y acelera el disco de acreción hacia el horizonte.

Visualmente: horizonte negro absoluto, membrana shader ondulante, disco caliente (temperaturas ~10⁶–10⁷ K en la simulación visual), esfera de fotones tenue a 1,5 rₛ. Con universo vivo activo, el BH crece por acreción (+0,05 M☉ por evento) hasta 100 M☉ máximo.`,
  },
  {
    id: 'horizon',
    icon: '🌀',
    title: 'Horizonte y el «otro lado»',
    body: `El horizonte de sucesos es la frontera de no retorno: la velocidad de escape supera c.

<strong>Clásicas:</strong> singularidad, agujero blanco, gusano, universo hijo, firewall, holografía, espuma cuántica.

<strong>Especulativas ★:</strong> cuerdas, islas Hawking, ER=EPR, estrella de Planck, fuzzball, espejo CPT, inflación, materia/energía oscura, cuerdas cósmicas, LQG rebote.

<strong>Ficción ★★:</strong> Biblioteca de Babel, puerta a otro Friedmann.

<strong>Ruptura física ★★:</strong> cerradura temporal (CTC), gravedad off, masa negativa, causa-efecto roto, rebote ρ=∞, horizonte cronológico, núcleo antigravitatorio, máquina de paradojas. Violan física conocida a propósito.

<strong>Propias del motor:</strong> eco Friedmann, zona híbrida, fractura temporal, bucle información, umbral Planck, resonancia cosmológica, acreción invertida, geodésica eterna, entropía máxima, multiverso Ω, horizonte holográfico dinámico.

Al acercarte: panel inferior izquierdo con teoría, lecturas en vivo, dilatación, % interior visible. <strong>Tour 60s</strong> para recorrido guiado. <strong>ℹ️ Más info</strong> expande resumen de cada teoría.`,
  },
  {
    id: 'physics_break',
    icon: '💥',
    title: 'Teorías de ruptura física (ficción)',
    body: `<strong>Advertencia:</strong> estas 8 teorías violan la física conocida <em>a propósito</em>. Etiquetadas <strong>★★ Ruptura</strong>, distintas de las especulativas ★ y la ficción cosmológica ★★ clásica.

<ul>
<li><strong>Cerradura temporal (CTC):</strong> bucles de tipo tiempo; interior = exterior.</li>
<li><strong>Gravedad off:</strong> G → 0 dentro del horizonte.</li>
<li><strong>Masa negativa:</strong> repulsión gravitatoria; horizonte expansivo.</li>
<li><strong>Causa-efecto roto:</strong> efectos antes que causas; ΔS &lt; 0.</li>
<li><strong>Rebote ρ=∞:</strong> densidad infinita sin singularidad; G negativo efectivo.</li>
<li><strong>Horizonte cronológico:</strong> frontera temporal, no espacial.</li>
<li><strong>Núcleo antigravitatorio:</strong> vacío que repele todo.</li>
<li><strong>Máquina de paradojas:</strong> bits ↔ masa; índice de paradoja en vivo.</li>
</ul>

<strong>GUI:</strong> carpeta «★★ Ruptura física» en Horizonte. <strong>Lab:</strong> experimentos «Violación de energía (E&lt;0)» y «Paradoja de bootstrap». Membrana con glitches shader intencionales; destellos <code>time_reverse</code> y <code>gravity_invert</code>.`,
  },
  {
    id: 'probe',
    icon: '🛰️',
    title: 'Sonda y zoom inmersivo',
    body: `Dos formas de cruzar el horizonte:
<ol>
<li><strong>Sonda:</strong> botón «▶ Enviar sonda» en Horizonte de sucesos. Estados: En espera → Aproximándose → ¡Cruzando! → En el interior. Deja estela coloreada según la teoría.</li>
<li><strong>Zoom de cámara:</strong> rueda del ratón hacia el BH. Al superar ~80% de inmersión, el cruce se activa sin sonda.</li>
</ol>
La dilatación temporal hace que el tiempo externo parezca congelarse (√(1−rₛ/r) → 0). El destello al cruzar depende de la teoría (fuego, scanlines, resonancia de cuerdas…).`,
  },
  {
    id: 'life',
    icon: '💫',
    title: 'Universo vivo',
    body: `El <strong>LifeEngine</strong> da comportamiento emergente al cosmos. Panel inferior derecho: fase, vitalidad, pulso, eventos.

<strong>Fases de vida</strong> (según edad y redshift z):
<ul>
<li><strong>Nacimiento</strong> — primeros 30 s de simulación: cosmos joven, eventos frecuentes.</li>
<li><strong>Infancia</strong> — z &lt; 0,01: universo localmente «actual».</li>
<li><strong>Madurez</strong> — 0,01 ≤ z &lt; 0,5: expansión moderada.</li>
<li><strong>Vejez cósmica</strong> — z ≥ 0,5: universo temprano, mayor redshift.</li>
</ul>
<strong>Eventos emergentes:</strong> nacimiento/muerte de estrellas, partículas capturadas o generadas, geodésicas renacidas, acreción (+masa al BH), erupciones en el disco, sondas autónomas, deriva de teoría (cambio aleatorio), pulsos gravitacionales, respiración cósmica. Activa/desactiva en Simulación → Universo vivo.`,
  },
  {
    id: 'lab',
    icon: '🔬',
    title: 'Laboratorio de fórmulas',
    body: `Calcula ecuaciones en tiempo real y las compara con la simulación.

<strong>Cómo leer el panel</strong> (izquierda, bajo HUD):
<ul>
<li><strong>Era cósmica</strong> — color según z: inflación, nucleosíntesis, recombinación, edad oscura, estrellas, hoy.</li>
<li><strong>Timeline</strong> — barra con marcadores de eras; posición = redshift actual.</li>
<li><strong>Fórmulas por categoría</strong> — relatividad, cosmología, mecánica celeste. Cada línea: <code>valor teórico</code> <span style="color:#66ccaa">↔ valor sim</span>.</li>
<li><strong>Validación</strong> — ✓ si Δ &lt; 2%, ~ si &lt; 10%, ✗ si mayor. Compara H simulado vs H₀√(Ωₘ/a³+ΩΛ), rₛ, etc.</li>
</ul>
<strong>Experimentos</strong> desde controles (caída al horizonte, comparar eras…). <strong>Fórmulas personalizadas</strong> con variables G, M, c, r, a, H0. El laboratorio se actualiza cada frame con TheoryLab.`,
  },
  {
    id: 'gw',
    icon: '🌊',
    title: 'Ondas gravitacionales',
    body: `Visibles en modo <strong>Choque binario</strong>. Tres fases:

<strong>1. Inspiral:</strong> dos BH en espiral. Pierden energía orbital por emisión GW (Peters). La separación decrece, la frecuencia aumenta («chirp»). Anillos azul-blancos expansivos desde el baricentro distorsionan estrellas y grid.

<strong>2. Merger (fusión):</strong> los horizontes se unen. ~5% de la masa se irradia como GW. Destello dorado + pulso de memoria gravitacional (efecto permanente en el espacio).

<strong>3. Ringdown:</strong> el remanente oscila como un tambor y se amortigua (cuasi-modos normales). Ondas de amplitud decreciente hasta estabilización.

Opcional: <strong>evaporación Hawking</strong> del remanente (acelerada visualmente). Lecturas: strain h, f_GW (Hz), E_rad (J), T_Hawking (K).`,
  },
  {
    id: 'visual',
    icon: '✨',
    title: 'Galaxias, lensing y campo estelar',
    body: `<strong>Campo galáctico</strong> — espirales, elípticas e irregulares con redshift (más lejos = más rojas), flujo de Hubble v ∝ H₀·d, cúmulos y banda de la Vía Láctea. Mejor en modo Cosmología ΛCDM.

<strong>Lensing gravitacional</strong> — shader con anillo de Einstein θ_E ∝ rₛ/d. Actívalo en Simulación.

<strong>Campo estelar</strong> — colores OBAFGKM (más enanas M), nebulosas de emisión, ~5000 estrellas con parpadeo y expansión.

<strong>CMB</strong> — resplandor tenue del universo primordial (z ~ 1100).

<strong>Realismo</strong> — toggle Estándar / Cinemático (más galaxias, nebulosas y partículas).

<strong>Grid cósmico</strong> — malla de referencia que se distorsiona con expansión y pulsos.`,
  },
  {
    id: 'controls',
    icon: '🎛️',
    title: 'Controles y reset',
    body: `<kbd>?</kbd> abre la guía completa. <kbd>ℹ️</kbd> en la barra superior → explicación del modo activo (panel central).

<kbd>R</kbd> reinicia todo. <kbd>Espacio</kbd> pausa/reanuda. Arrastra = rotar, rueda = zoom.

Panel derecho (lil-gui): Escena, Agujero negro, Cosmología, Horizonte, Simulación, Laboratorio, Binario, Reset.

<strong>Reset simulación</strong> — parámetros y estado. <strong>Reset TOTAL</strong> — también cámara, sonda, eventos del universo vivo.

<strong>Paneles colapsables:</strong> ▼/▲ en Laboratorio y Teoría del horizonte. <strong>Explainer de modo</strong> — panel superior central, primera visita auto-expandido 5 s.`,
  },
];

function renderSections(openId) {
  return SECTIONS.map((s) => {
    const open = s.id === openId;
    return `
      <details class="guide-section" ${open ? 'open' : ''} data-id="${s.id}">
        <summary class="guide-section-title">
          <span class="guide-icon">${s.icon}</span>
          ${s.title}
        </summary>
        <div class="guide-section-body">${s.body}</div>
      </details>
    `;
  }).join('');
}

export function createGuidePanel() {
  const btn = document.getElementById('guide-toggle');
  const panel = document.getElementById('guide-panel');
  const content = document.getElementById('guide-content');
  const backdrop = document.getElementById('guide-backdrop');
  if (!btn || !panel || !content) return;

  let openId = 'motor';
  content.innerHTML = renderSections(openId);

  content.addEventListener('toggle', (e) => {
    const details = e.target;
    if (details.tagName !== 'DETAILS' || !details.open) return;
    openId = details.dataset.id;
    for (const el of content.querySelectorAll('.guide-section')) {
      if (el !== details) el.open = false;
    }
  }, true);

  function setOpen(open) {
    panel.classList.toggle('open', open);
    backdrop?.classList.toggle('visible', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? '✕ Cerrar' : '¿Cómo funciona?';
  }

  btn.addEventListener('click', () => setOpen(!panel.classList.contains('open')));
  backdrop?.addEventListener('click', () => setOpen(false));

  return {
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle: () => setOpen(!panel.classList.contains('open')),
  };
}
