export default {
  "meta": {
    "title": "What's inside the black hole?",
    "description": "Interactive 3D simulation: black holes, event horizon, and interior theories.",
    "ogTitle": "What's inside the black hole?",
    "ogDescription": "Hybrid Schwarzschild + cosmology engine: explore horizon theories in your browser."
  },
  "lang": {
    "toggle": "EN | ES",
    "switchHint": "Switch language / Cambiar idioma"
  },
  "hud": {
    "title": "What's inside the black hole?",
    "tagline": "Hybrid Schwarzschild + Friedmann + N-body engine · Horizon theories",
    "modeLabel": "Mode:",
    "seed": "Seed"
  },
  "helpBar": "<kbd>?</kbd> guide · <kbd>I</kbd> mode · <kbd>📊</kbd> research · <kbd>V</kbd> view · <kbd>G</kbd> controls · <kbd>R</kbd> reset · <kbd>Space</kbd> pause",
  "ux": {
    "guide": "Guide (?)",
    "info": "Mode explainer (I)",
    "tour": "60-second tour",
    "pause": "Pause (Space)",
    "play": "Resume (Space)",
    "reset": "Full reset (R)",
    "research": "Research panel",
    "controls": "Show/hide controls (G)",
    "lang": "Switch language ES ↔ EN",
    "clean": "Clean view / panels (V)",
    "cleanViewOn": "Clean view — press V to show panels",
    "cleanViewOff": "Panels visible — press V for clean view",
    "realisticHint": "Realistic mode — disk, stars and lensing calibrated (Planck 2018)"
  },
  "exportHelp": {
    "intro": "Export simulation data for external analysis. Each button downloads a different file.",
    "csv": "CSV — time series (t, a, z, H, rₛ, mode, theory). Open in Excel or Google Sheets.",
    "jsonSeries": "JSON series — same data as CSV in structured format for Python/R scripts.",
    "validation": "Validation report — theory vs simulation table with error % per quantity.",
    "publication": "HTML report — full report with maturity scores, citations and reproducible URL.",
    "sweepH0": "H₀ sweep — 15 H₀ values (60–80) vs universe age and comoving distance.",
    "sweepMass": "M_BH sweep — mass vs rₛ, Hawking temperature and evaporation time.",
    "copyUrl": "Copies the current URL with seed and parameters to reproduce this run.",
    "copyUrlDone": "🔗 URL copied to clipboard"
  },
  "guide": {
    "toggle": "How it works",
    "close": "✕ Close",
    "headerTitle": "How it works",
    "headerDesc": "Guide to the hybrid engine and horizon theories. Tap a section to expand.",
    "sections": [
      {
        "id": "motor",
        "icon": "⚙️",
        "title": "Hybrid physics engine",
        "body": "Combina <strong>tres regímenes</strong> que en la física real rara vez se estudian juntos:\n\n<strong>1. Friedmann (cosmológico):</strong> gobierna la expansión del universo entero. El factor de escala <strong>a(t)</strong> crece según <strong>H(a) = H₀√(Ωₘ/a³ + ΩΛ)</strong>. Aplica cuando la distancia al agujero negro supera el umbral local.\n\n<strong>2. Schwarzschild/Kerr (relativista):</strong> describe la gravedad fuerte cerca del horizonte. Radio <strong>rₛ = 2GM/c²</strong>, dilatación temporal <strong>√(1−rₛ/r)</strong>, ISCO a <strong>3 rₛ</strong>, esfera de fotones a <strong>1,5 rₛ</strong>. Órbitas, caída libre y captura de partículas.\n\n<strong>3. N-cuerpos (newtoniano):</strong> partículas que interactúan gravitacionalmente entre sí y con el agujero. Útil en la zona intermedia donde ni la relatividad pura ni la cosmología dominan solas.\n\n<strong>Umbrales del motor</strong> (constantes en <code>REGIME_THRESHOLDS</code>):\n<ul>\n<li><strong>&lt; 100·rₛ</strong> → régimen Schwarzschild: geodésicas relativistas, marea, horizonte.</li>\n<li><strong>100·rₛ … 80 u.vis</strong> → régimen N-cuerpos: interacciones múltiples, órbitas keplerianas perturbadas.</li>\n<li><strong>&gt; 80 u.vis</strong> → régimen Friedmann: expansión cósmica, redshift, H(t).</li>\n</ul>\nEl simulador clasifica cada objeto según su distancia al horizonte y aplica el modelo adecuado. La teoría propia «Zona de transición híbrida» visualiza exactamente esta superposición en el cruce del horizonte."
      },
      {
        "id": "mode_bh",
        "icon": "⚫",
        "title": "Mode: Black hole",
        "body": "<strong>Qué simula:</strong> el modo completo con BH + cosmos + teorías del horizonte + partículas + lensing.\n\n<strong>Física:</strong> rₛ = 2GM/c², spin Kerr 0–0,998, motor híbrido con umbrales 100·rₛ y 80 u.vis.\n\n<strong>Controles:</strong> masa, spin, cosmología, teoría del horizonte, sonda, universo vivo, geodésicas, lensing.\n\n<strong>En pantalla:</strong> disco de acreción → acercamiento → lensing de estrellas → membrana ondulante → cruce → interior según teoría.\n\n<strong>FAQ:</strong> ¿Sin sonda? Haz zoom. ¿Tiempo congelado? Dilatación → 0. ¿Teorías reales? Mezcla de física establecida, especulación ★ y ficción ★★."
      },
      {
        "id": "mode_multi",
        "icon": "🫧",
        "title": "Mode: Multiverse",
        "body": "<strong>Qué simula:</strong> ~70 burbujas-universo con distintos Ωₘ/ΩΛ, portal central, ramas bifurcadas.\n\n<strong>Física:</strong> Friedmann por burbuja; q(a) = Ωₘ/(2a³E²) − ΩΛ; teoría auto «Multiverso por Ω».\n\n<strong>Controles:</strong> Ωₘ, ΩΛ, H₀ en cosmología; vuela al portal central.\n\n<strong>En pantalla:</strong> burbujas pulsantes → colores por destino cosmológico → portal espiral → panel Ω activos.\n\n<strong>FAQ:</strong> No es prueba experimental. El BH se oculta a propósito. Relacionado con teoría omega_multiverse."
      },
      {
        "id": "mode_higgs",
        "icon": "✨",
        "title": "Mode: Higgs",
        "body": "<strong>Qué simula:</strong> mecanismo de Higgs abstracto — campo φ, vacío ⟨φ⟩, acoplamiento de masa a fermiones.\n\n<strong>Física:</strong> V(φ) = μ²φ² + λφ⁴; v ≈ 246 GeV; Yukawa m_f = y_f·v/√2. Valores en pantalla son simbólicos.\n\n<strong>Controles:</strong> solo navegación (rotar, zoom). Sin BH ni cosmología.\n\n<strong>En pantalla:</strong> núcleo dorado → fermiones que ganan masa al acercarse → anillos tipo LHC.\n\n<strong>FAQ:</strong> No replica ATLAS/CMS. El bosón da masa vía acoplamiento al campo, no solo por existir."
      },
      {
        "id": "mode_cosmo",
        "icon": "🌌",
        "title": "Mode: ΛCDM Cosmology",
        "body": "<strong>Qué simula:</strong> expansión del universo entero; BH minimizado (35% escala, 25% opacidad).\n\n<strong>Física:</strong> H(a) = H₀√(Ωₘ/a³ + ΩΛ), z = 1/a−1, d_c integrada, presets Planck/WMAP.\n\n<strong>Controles:</strong> H₀, Ωₘ, ΩΛ, presets; universo vivo; laboratorio de eras.\n\n<strong>En pantalla:</strong> estrellas que se separan → grid cósmico expandiéndose → HUD a(t), z, H, d_c.\n\n<strong>FAQ:</strong> BH tenue a propósito. Presets ≈ datos reales. Era cósmica en panel Laboratorio."
      },
      {
        "id": "mode_theory",
        "icon": "🌀",
        "title": "Mode: Horizon theory",
        "body": "<strong>Qué simula:</strong> exploración de 30+ teorías del interior; cámara cerca del horizonte.\n\n<strong>Física:</strong> cada teoría con interior 3D, lecturas S, T_H, dilatación, H(z), rₛ/l_P según corresponda.\n\n<strong>Controles:</strong> selector de teoría, destacadas, zoom al horizonte, sonda, ℹ️ Más info en panel.\n\n<strong>En pantalla:</strong> membrana coloreada → panel con lecturas → cruce → interior teórico → resumen expandible.\n\n<strong>FAQ:</strong> Igual escena que BH pero enfoque en teorías. ★ especulativa, ★★ ficción. Lecturas con constantes SI reales."
      },
      {
        "id": "mode_binary",
        "icon": "💥",
        "title": "Mode: Binary merger",
        "body": "<strong>Qué simula:</strong> inspiral → fusión → ringdown → evaporación Hawking (opcional).\n\n<strong>Física:</strong> pérdida energía Peters dE/dt ∝ r⁻⁵; strain h; f_GW chirp; ~5% masa radiada; t_evap ∝ M³.\n\n<strong>Controles:</strong> M₁, M₂, spins, Iniciar colisión, muerte Hawking, escala temporal.\n\n<strong>En pantalla:</strong> espiral → anillos GW → destello fusión → ringdown → evaporación → vacío.\n\n<strong>FAQ:</strong> Inspiral realista en orden de magnitud. Ringdown = oscilación del remanente. Evaporación acelerada visualmente."
      },
      {
        "id": "mode_strings",
        "icon": "🎻",
        "title": "Mode: String theory",
        "body": "<strong>Qué simula:</strong> vuelo por cuerda cósmica, branas colisionando, modos vibracionales.\n\n<strong>Física:</strong> cuerdas 1D, compactificación Calabi-Yau, g_s, R ~ l_P, entropía como conteo de modos.\n\n<strong>Controles:</strong> cámara automática + orbit manual ligero. Teoría auto «string_theory».\n\n<strong>En pantalla:</strong> cuerda serpenteante → branas D → ondas en la cuerda → lecturas g_s, modos n.\n\n<strong>FAQ:</strong> Pedagógico, no confirmación experimental. Distinto del interior «cuerdas» del horizonte."
      },
      {
        "id": "cosmo",
        "icon": "📐",
        "title": "Cosmology (parameters)",
        "body": "El universo se expande según Friedmann. Parámetros clave:\n<ul>\n<li><strong>H₀</strong> — velocidad de expansión hoy (km/s/Mpc). Default 70.</li>\n<li><strong>Ωₘ</strong> — fracción de densidad en materia (bariones + oscura). Default 0,3.</li>\n<li><strong>ΩΛ</strong> — fracción en energía oscura. Default 0,7.</li>\n</ul>\nEl factor <strong>a(t)</strong> y el redshift <strong>z = 1/a − 1</strong> aparecen en el HUD. La distancia comóvil <strong>d_c</strong> se calcula integrando c·dt/a. Presets (ΛCDM, Planck 2018, WMAP, etc.) cargan combinaciones basadas en observaciones. El parámetro de desaceleración <strong>q(a)</strong> indica si el universo frena o acelera."
      },
      {
        "id": "bh",
        "icon": "⚫",
        "title": "Black hole (parameters)",
        "body": "La <strong>masa</strong> (en M☉) determina rₛ = 2GM/c². A 10 M☉, rₛ ≈ 30 km. El <strong>spin Kerr</strong> (0–0,998) deforma el espacio-tiempo, arrastra el espacio (efecto Lense-Thirring) y acelera el disco de acreción hacia el horizonte.\n\nVisualmente: horizonte negro absoluto, membrana shader ondulante, disco caliente (temperaturas ~10⁶–10⁷ K en la simulación visual), esfera de fotones tenue a 1,5 rₛ. Con universo vivo activo, el BH crece por acreción (+0,05 M☉ por evento) hasta 100 M☉ máximo."
      },
      {
        "id": "horizon",
        "icon": "🌀",
        "title": "Horizon and the «other side»",
        "body": "El horizonte de sucesos es la frontera de no retorno: la velocidad de escape supera c.\n\n<strong>Clásicas:</strong> singularidad, agujero blanco, gusano, universo hijo, firewall, holografía, espuma cuántica.\n\n<strong>Especulativas ★:</strong> cuerdas, islas Hawking, ER=EPR, estrella de Planck, fuzzball, espejo CPT, inflación, materia/energía oscura, cuerdas cósmicas, LQG rebote.\n\n<strong>Ficción ★★:</strong> Biblioteca de Babel, puerta a otro Friedmann.\n\n<strong>Ruptura física ★★:</strong> cerradura temporal (CTC), gravedad off, masa negativa, causa-efecto roto, rebote ρ=∞, horizonte cronológico, núcleo antigravitatorio, máquina de paradojas. Violan física conocida a propósito.\n\n<strong>Propias del motor:</strong> eco Friedmann, zona híbrida, fractura temporal, bucle información, umbral Planck, resonancia cosmológica, acreción invertida, geodésica eterna, entropía máxima, multiverso Ω, horizonte holográfico dinámico.\n\nAl acercarte: panel inferior izquierdo con teoría, lecturas en vivo, dilatación, % interior visible. <strong>Tour 60s</strong> para recorrido guiado. <strong>ℹ️ Más info</strong> expande resumen de cada teoría."
      },
      {
        "id": "physics_break",
        "icon": "💥",
        "title": "Physics-break theories (fiction)",
        "body": "<strong>Advertencia:</strong> estas 8 teorías violan la física conocida <em>a propósito</em>. Etiquetadas <strong>★★ Ruptura</strong>, distintas de las especulativas ★ y la ficción cosmológica ★★ clásica.\n\n<ul>\n<li><strong>Cerradura temporal (CTC):</strong> bucles de tipo tiempo; interior = exterior.</li>\n<li><strong>Gravedad off:</strong> G → 0 dentro del horizonte.</li>\n<li><strong>Masa negativa:</strong> repulsión gravitatoria; horizonte expansivo.</li>\n<li><strong>Causa-efecto roto:</strong> efectos antes que causas; ΔS &lt; 0.</li>\n<li><strong>Rebote ρ=∞:</strong> densidad infinita sin singularidad; G negativo efectivo.</li>\n<li><strong>Horizonte cronológico:</strong> frontera temporal, no espacial.</li>\n<li><strong>Núcleo antigravitatorio:</strong> vacío que repele todo.</li>\n<li><strong>Máquina de paradojas:</strong> bits ↔ masa; índice de paradoja en vivo.</li>\n</ul>\n\n<strong>GUI:</strong> carpeta «★★ Ruptura física» en Horizonte. <strong>Lab:</strong> experimentos «Violación de energía (E&lt;0)» y «Paradoja de bootstrap». Membrana con glitches shader intencionales; destellos <code>time_reverse</code> y <code>gravity_invert</code>."
      },
      {
        "id": "probe",
        "icon": "🛰️",
        "title": "Probe and immersive zoom",
        "body": "Dos formas de cruzar el horizonte:\n<ol>\n<li><strong>Sonda:</strong> botón «▶ Enviar sonda» en Horizonte de sucesos. Estados: En espera → Aproximándose → ¡Cruzando! → En el interior. Deja estela coloreada según la teoría.</li>\n<li><strong>Zoom de cámara:</strong> rueda del ratón hacia el BH. Al superar ~80% de inmersión, el cruce se activa sin sonda.</li>\n</ol>\nLa dilatación temporal hace que el tiempo externo parezca congelarse (√(1−rₛ/r) → 0). El destello al cruzar depende de la teoría (fuego, scanlines, resonancia de cuerdas…)."
      },
      {
        "id": "life",
        "icon": "💫",
        "title": "Living universe",
        "body": "El <strong>LifeEngine</strong> da comportamiento emergente al cosmos. Panel inferior derecho: fase, vitalidad, pulso, eventos.\n\n<strong>Fases de vida</strong> (según edad y redshift z):\n<ul>\n<li><strong>Nacimiento</strong> — primeros 30 s de simulación: cosmos joven, eventos frecuentes.</li>\n<li><strong>Infancia</strong> — z &lt; 0,01: universo localmente «actual».</li>\n<li><strong>Madurez</strong> — 0,01 ≤ z &lt; 0,5: expansión moderada.</li>\n<li><strong>Vejez cósmica</strong> — z ≥ 0,5: universo temprano, mayor redshift.</li>\n</ul>\n<strong>Eventos emergentes:</strong> nacimiento/muerte de estrellas, partículas capturadas o generadas, geodésicas renacidas, acreción (+masa al BH), erupciones en el disco, sondas autónomas, deriva de teoría (cambio aleatorio), pulsos gravitacionales, respiración cósmica. Activa/desactiva en Simulación → Universo vivo."
      },
      {
        "id": "lab",
        "icon": "🔬",
        "title": "Formula laboratory",
        "body": "Calcula ecuaciones en tiempo real y las compara con la simulación.\n\n<strong>Cómo leer el panel</strong> (izquierda, bajo HUD):\n<ul>\n<li><strong>Era cósmica</strong> — color según z: inflación, nucleosíntesis, recombinación, edad oscura, estrellas, hoy.</li>\n<li><strong>Timeline</strong> — barra con marcadores de eras; posición = redshift actual.</li>\n<li><strong>Fórmulas por categoría</strong> — relatividad, cosmología, mecánica celeste. Cada línea: <code>valor teórico</code> <span style=\"color:#66ccaa\">↔ valor sim</span>.</li>\n<li><strong>Validación</strong> — ✓ si Δ &lt; 2%, ~ si &lt; 10%, ✗ si mayor. Compara H simulado vs H₀√(Ωₘ/a³+ΩΛ), rₛ, etc.</li>\n</ul>\n<strong>Experimentos</strong> desde controles (caída al horizonte, comparar eras…). <strong>Fórmulas personalizadas</strong> con variables G, M, c, r, a, H0. El laboratorio se actualiza cada frame con TheoryLab."
      },
      {
        "id": "gw",
        "icon": "🌊",
        "title": "Gravitational waves",
        "body": "Visibles en modo <strong>Choque binario</strong>. Tres fases:\n\n<strong>1. Inspiral:</strong> dos BH en espiral. Pierden energía orbital por emisión GW (Peters). La separación decrece, la frecuencia aumenta («chirp»). Anillos azul-blancos expansivos desde el baricentro distorsionan estrellas y grid.\n\n<strong>2. Merger (fusión):</strong> los horizontes se unen. ~5% de la masa se irradia como GW. Destello dorado + pulso de memoria gravitacional (efecto permanente en el espacio).\n\n<strong>3. Ringdown:</strong> el remanente oscila como un tambor y se amortigua (cuasi-modos normales). Ondas de amplitud decreciente hasta estabilización.\n\nOpcional: <strong>evaporación Hawking</strong> del remanente (acelerada visualmente). Lecturas: strain h, f_GW (Hz), E_rad (J), T_Hawking (K)."
      },
      {
        "id": "visual",
        "icon": "✨",
        "title": "Galaxies, lensing and starfield",
        "body": "<strong>Campo galáctico</strong> — espirales, elípticas e irregulares con redshift (más lejos = más rojas), flujo de Hubble v ∝ H₀·d, cúmulos y banda de la Vía Láctea. Mejor en modo Cosmología ΛCDM.\n\n<strong>Lensing gravitacional</strong> — shader con anillo de Einstein θ_E ∝ rₛ/d. Actívalo en Simulación.\n\n<strong>Campo estelar</strong> — colores OBAFGKM (más enanas M), nebulosas de emisión, ~5000 estrellas con parpadeo y expansión.\n\n<strong>CMB</strong> — resplandor tenue del universo primordial (z ~ 1100).\n\n<strong>Realismo</strong> — toggle Estándar / Cinemático (más galaxias, nebulosas y partículas).\n\n<strong>Grid cósmico</strong> — malla de referencia que se distorsiona con expansión y pulsos."
      },
      {
        "id": "research",
        "icon": "📊",
        "title": "Research and reproducibility",
        "body": "<strong>Research panel</strong> (bottom-right, 📊 in the dock):\n<ol>\n<li><strong>Configure</strong> mode and parameters (right GUI, Cosmology / Black hole folders).</li>\n<li><strong>Run</strong> the simulation for a few seconds — the <strong>sample</strong> counter increases each frame.</li>\n<li><strong>Compare</strong> theory vs simulation (H, rₛ, z, d_c, time dilation…). ✓ &lt;2% error, ~ &lt;10%, ✗ higher.</li>\n<li><strong>Maturity N2–N4</strong> — rigor score: exports, validation, observational data (LIGO, SDSS, Planck).</li>\n<li><strong>Export</strong> from GUI → Research: CSV, JSON series, validation report, HTML publication report, parameter sweeps.</li>\n<li><strong>Reproducible URL</strong> — copy link with seed; anyone can repeat the same state.</li>\n</ol>\n<strong>Console API:</strong> <code>CosmosSim.getSnapshot()</code>, <code>CosmosSim.getValidations()</code>.\n\n<strong>Modes with most real data:</strong> Cosmology (Planck CMB, SDSS), Binary merger (GW150914 vs simulated strain), Realistic by default."
      },
      {
        "id": "controls",
        "icon": "🎛️",
        "title": "Controls and reset",
        "body": "<kbd>?</kbd> opens the full guide. <kbd>ℹ️</kbd> active mode explainer. <kbd>📊</kbd> Research panel.\n\n<kbd>R</kbd> full reset. <kbd>Space</kbd> pause/resume. <kbd>V</kbd> clean view (3D only). Drag = rotate, wheel = zoom.\n\nRight panel (lil-gui): Scene, Black hole, Cosmology, Horizon, Simulation, Lab, <strong>Research</strong>, Binary, Reset.\n\n<strong>Left column:</strong> HUD + Lab + Theory (stacked, scroll if needed). <strong>Research</strong> bottom-right. <strong>Living universe</strong> bottom-center (collapsed by default)."
      }
    ]
  },
  "explainer": {
    "activeMode": "Active mode",
    "close": "Close",
    "expand": "Expand/collapse",
    "empty": "No explanation for this mode.",
    "adaptiveHint": "💡 The <strong>Controls</strong> panel (right) shows only settings relevant to this scene.",
    "sections": {
      "physics": "⚛️ Physics behind",
      "controls": "🎛️ Controls",
      "watch": "👁️ What to watch",
      "faq": "FAQ",
      "activeTheory": "ℹ️ Active theory"
    },
    "moreInfo": "ℹ️ More info",
    "modes": {
      "black_hole": {
        "id": "black_hole",
        "icon": "⚫",
        "title": "Black hole",
        "intro": "El modo principal de la simulación: un agujero negro de Schwarzschild/Kerr en un universo en expansión. Aquí conviven el disco de acreción caliente, la membrana del horizonte, las teorías del interior, partículas N-cuerpos, lensing gravitacional y el motor híbrido completo. Es la experiencia más rica: puedes acercarte con la cámara, lanzar una sonda, cambiar la teoría del «otro lado» y ver cómo el cosmos exterior sigue expandiéndose mientras la gravedad local domina cerca del horizonte.",
        "physics": "<strong>Ecuaciones clave:</strong> radio de Schwarzschild <strong>rₛ = 2GM/c²</strong> (con G = 6,674×10⁻¹¹ m³ kg⁻¹ s⁻², c = 2,998×10⁸ m/s); dilatación temporal <strong>√(1 − rₛ/r)</strong>; ISCO a <strong>3 rₛ</strong> y esfera de fotones a <strong>1,5 rₛ</strong>. El motor híbrido clasifica cada distancia: por debajo de <strong>100·rₛ</strong> rige Schwarzschild, entre <strong>100·rₛ</strong> y <strong>80 u.vis</strong> el régimen N-cuerpos, y más allá Friedmann con <strong>H(a) = H₀√(Ωₘ/a³ + ΩΛ)</strong>. La masa por defecto es 10 M☉; el spin Kerr (0–0,998) deforma el disco.",
        "controls": "Panel derecho → <strong>Escena</strong>: este modo se selecciona como «Agujero negro». Ajusta <strong>masa</strong> y <strong>spin</strong> en Agujero negro; <strong>H₀, Ωₘ, ΩΛ</strong> en Cosmología; elige <strong>teoría del horizonte</strong> en Horizonte de sucesos. Activa <strong>lensing</strong>, <strong>geodésicas</strong> y <strong>universo vivo</strong> en Simulación. Usa <strong>▶ Enviar sonda</strong> o simplemente haz zoom con la rueda. <kbd>R</kbd> reinicia; <kbd>Espacio</kbd> pausa.",
        "whatToWatch": "<ol>\n<li><strong>Vista inicial:</strong> agujero oscuro al centro, disco naranja-rojo, estrellas de fondo que parpadean y grid cósmico tenue.</li>\n<li><strong>Acércate:</strong> el lensing curva las estrellas (efecto Einstein); la membrana del horizonte ondula con el pulso del universo vivo.</li>\n<li><strong>Panel inferior izquierdo:</strong> teoría activa, lecturas físicas en vivo (entropía, dilatación, etc.) y progreso de inmersión.</li>\n<li><strong>Cruce del horizonte:</strong> destello según la teoría; el interior 3D aparece (firewall, cuerdas, eco de Friedmann…).</li>\n<li><strong>HUD superior izquierdo:</strong> a(t), z, H(t), rₛ y distancia comóvil d_c actualizados en tiempo real.</li>\n</ol>",
        "faq": [
          {
            "q": "¿Por qué el tiempo parece congelarse cerca del horizonte?",
            "a": "La dilatación temporal √(1−rₛ/r) → 0 para un observador externo. En la simulación verás «≈ 0%» en el panel de teoría cuando la cámara está muy cerca."
          },
          {
            "q": "¿Las teorías del interior son reales?",
            "a": "Algunas son predicciones o marcos aceptados (singularidad, holografía); otras son especulativas ★ o ficción ★★. Las marcadas como «teoría propia» derivan directamente del motor híbrido de esta app."
          },
          {
            "q": "¿Puedo ver el interior sin la sonda?",
            "a": "Sí: haz zoom con la rueda hasta que la inmersión de cámara supere ~80% del horizonte. La simulación activa el cruce automáticamente."
          }
        ]
      },
      "multiverse": {
        "id": "multiverse",
        "icon": "🫧",
        "title": "Multiverse",
        "intro": "Escena dedicada al multiverso cosmológico: decenas de burbujas-universo que se expanden según distintas combinaciones de Ωₘ y ΩΛ, con un portal central que conecta ramas bifurcadas. El agujero negro principal desaparece; el foco es la interpretación de muchos mundos y cómo tu cosmología activa (H₀, Ωₘ, ΩΛ del panel) colorea y modula las burbujas. Al entrar, la teoría del horizonte se fija automáticamente en «Multiverso por Ω».",
        "physics": "<strong>Base:</strong> cada burbuja obedece Friedmann con parámetros ligeramente distintos. El destino cosmológico depende de la razón <strong>Ωₘ/ΩΛ</strong>: si Ωₘ ≫ ΩΛ → colapso futuro; si ΩΛ domina → expansión acelerada eterna; cerca del equilibrio → universo crítico. El parámetro de desaceleración <strong>q(a) = Ωₘ/(2a³E²) − ΩΛ</strong> con <strong>E = √(Ωₘ/a³ + ΩΛ)</strong> clasifica cada rama. La teoría «Multiverso por Ω» calcula en vivo qué rama interior correspondería a tu cosmología.",
        "controls": "Selector de escena → <strong>Multiverso</strong>. Ajusta <strong>Ωₘ y ΩΛ</strong> en Cosmología y observa cómo cambian los colores y tamaños de las burbujas. Rota con arrastre, acerca al <strong>portal central</strong> para atravesar ramas. El panel inferior izquierdo muestra Ω activos y la razón Ωₘ/ΩΛ. Puedes volver al agujero negro desde el mismo selector.",
        "whatToWatch": "<ol>\n<li><strong>Burbujas:</strong> esferas semitransparentes que pulsan y crecen; cada una representa un universo-hijo con distinto balance materia/energía oscura.</li>\n<li><strong>Ramas coloreadas:</strong> tonos azules (materia dominante), violetas (Λ dominante), blancos (punto crítico).</li>\n<li><strong>Portal central:</strong> espiral o túnel hacia el interior bifurcado; vuela hacia él para la experiencia inmersiva.</li>\n<li><strong>Panel cosmología:</strong> lecturas Ωₘ, ΩΛ, Ωₘ/ΩΛ y conteo de burbujas activas (~70+).</li>\n<li><strong>Sincronización:</strong> al cambiar H₀ o los Ω, las burbujas se recalculan con la cosmología del motor.</li>\n</ol>",
        "faq": [
          {
            "q": "¿Esto prueba que existen otros universos?",
            "a": "No. Es una visualización pedagógica de la interpretación cosmológica: cada burbuja ilustra qué pasaría con distintos parámetros de Friedmann, no una observación directa."
          },
          {
            "q": "¿Por qué no veo el agujero negro?",
            "a": "Este modo oculta el BH (bhScale = 0) para centrar la escena en el paisaje multiversal. Vuelve a «Agujero negro» para recuperarlo."
          },
          {
            "q": "¿Cómo se relaciona con la teoría del horizonte?",
            "a": "La teoría «Multiverso por Ω» postula que cruzar un horizonte te bifurca en ramas según tu cosmología. Este modo muestra esa idea a escala cósmica."
          }
        ]
      },
      "higgs": {
        "id": "higgs",
        "icon": "✨",
        "title": "God Particle (Higgs)",
        "intro": "Visualización abstracta del mecanismo de Higgs: un campo escalar φ en el vacío cuya expectativa ⟨φ⟩ ≠ 0 rompe la simetría electrodébil y da masa a fermiones y bosones W/Z. La estética evoca el LHC (anillos, chorros de partículas, núcleo dorado) pero no replica datos exactos del detector ATLAS/CMS: es un modelo pedagógico del concepto «la masa no es intrínseca, se acopla al campo».",
        "physics": "<strong>Potencial de Higgs:</strong> V(φ) = μ²φ² + λφ⁴ con mínimo en ⟨φ⟩ = v ≈ 246 GeV (constante de Fermi). El bosón de Higgs es la excitación cuántica alrededor del vacío. <strong>Acoplamiento de Yukawa:</strong> m_f = y_f · v/√2 para cada fermión. En pantalla verás lecturas simbólicas de ⟨φ⟩, λ, masas de electron/muón/tau y energía del vacío. No se simula QCD ni el lagrangiano completo del Modelo Estándar.",
        "controls": "Selector → <strong>Partícula de Dios (Higgs)</strong>. No hay agujero negro ni cosmología visible: solo la escena Higgs. Rota y acércate al <strong>núcleo dorado</strong> (el vacío del campo). El panel inferior izquierdo muestra lecturas simbólicas del campo. Pausa con <kbd>Espacio</kbd> para examinar fermiones que ganan masa al acercarse.",
        "whatToWatch": "<ol>\n<li><strong>Núcleo dorado:</strong> representa el valor esperado del vacío ⟨φ⟩; pulsa suavemente.</li>\n<li><strong>Fermiones coloridos:</strong> partículas que orbitan y, al acercarse al núcleo, «adquieren masa» (se vuelven más pesadas visualmente).</li>\n<li><strong>Anillos tipo acelerador:</strong> estructura circular abstracta que evoca el LHC.</li>\n<li><strong>Chorros y bosones W/Z:</strong> partículas de gauge que también se acoplan al campo.</li>\n<li><strong>Panel de lecturas:</strong> ⟨φ⟩, λ, masas simbólicas y energía del vacío actualizadas.</li>\n</ol>",
        "faq": [
          {
            "q": "¿Es una réplica del experimento del CERN?",
            "a": "No. Es una metáfora visual del mecanismo de Higgs. Los valores numéricos son pedagógicos, no mediciones del LHC."
          },
          {
            "q": "¿Por qué se llama «Partícula de Dios»?",
            "a": "Apodo mediático del bosón de Higgs (descubierto en 2012). El campo, no la partícula sola, es lo que da masa a través del acoplamiento."
          },
          {
            "q": "¿Puedo combinar esto con el agujero negro?",
            "a": "No en este modo: la escena Higgs reemplaza el exterior. Cambia de modo en el selector de escena."
          }
        ]
      },
      "cosmology": {
        "id": "cosmology",
        "icon": "🌌",
        "title": "ΛCDM Cosmology",
        "intro": "Modo centrado en la expansión cósmica del modelo ΛCDM (Lambda-Cold Dark Matter). El agujero negro aparece minimizado (35% de escala, 25% de opacidad) como referencia local, pero el protagonista es el universo entero: factor de escala a(t), redshift z, parámetro de Hubble H(t) y campo estelar que se estira con la expansión. Ideal para entender Friedmann sin distracciones del horizonte.",
        "physics": "<strong>Ecuación de Friedmann:</strong> H² = (ȧ/a)² = (8πG/3)ρ − k/a² + Λ/3. En unidades adimensionales: <strong>H(a) = H₀√(Ωₘ/a³ + ΩΛ)</strong>. El factor de escala crece con el tiempo cósmico; <strong>z = 1/a − 1</strong>. Presets (ΛCDM, Planck 2018…) cargan H₀ ≈ 67–70 km/s/Mpc, Ωₘ ≈ 0,3, ΩΛ ≈ 0,7. La distancia comóvil d_c se integra numéricamente y aparece en el HUD.",
        "controls": "Selector → <strong>Cosmología ΛCDM</strong>. Panel Cosmología: ajusta <strong>H₀</strong>, <strong>Ωₘ</strong>, <strong>ΩΛ</strong> o elige un preset. Observa el HUD (a, z, H, d_c) y el laboratorio (era cósmica, timeline). La cámara empieza más alejada (z=200) para abarcar más universo. Activa universo vivo para ver estrellas nacer y el grid distorsionarse.",
        "whatToWatch": "<ol>\n<li><strong>Campo estelar:</strong> miles de puntos que parpadean y se separan con a(t).</li>\n<li><strong>Grid cósmico:</strong> malla que se expande y ondula con los pulsos del LifeEngine.</li>\n<li><strong>Agujero negro tenue:</strong> referencia de escala local, casi transparente.</li>\n<li><strong>HUD:</strong> a(t) crece lentamente; z decrece hacia 0 (universo actual).</li>\n<li><strong>Panel laboratorio:</strong> era cósmica (recombinación, edad de las estrellas…) según z actual.</li>\n</ol>",
        "faq": [
          {
            "q": "¿Por qué el agujero negro casi no se ve?",
            "a": "Este modo reduce bhScale a 0,35 y opacidad al 25% para no robar atención a la expansión global. Sigue interactuando con partículas si las activas."
          },
          {
            "q": "¿Los presets son datos reales?",
            "a": "Sí, aproximaciones basadas en observaciones (Planck 2018, WMAP, etc.). Puedes modificarlos libremente después."
          },
          {
            "q": "¿Cómo sé en qué era estoy?",
            "a": "El panel Laboratorio (izquierda, debajo del HUD) muestra la era según z: inflación, nucleosíntesis, recombinación, edad oscura, estrellas, hoy."
          }
        ]
      },
      "theory_picker": {
        "id": "theory_picker",
        "icon": "🌀",
        "title": "Horizon theory",
        "intro": "Modo optimizado para explorar las 30+ teorías del interior del agujero negro. La cámara arranca cerca del horizonte (z≈55) y el panel inferior muestra la teoría activa con lecturas físicas en vivo. Incluye un selector rápido de teorías destacadas (Singularidad, Firewall, ER=EPR, Cuerdas, Multiverso Ω, Islas Hawking, Agujero blanco, Fuzzball). Ideal para comparar predicciones sin navegar todo el menú.",
        "physics": "Cada teoría define un <strong>interior 3D</strong> distinto y lecturas calculadas con las fórmulas del motor: entropía de Bekenstein-Hawking <strong>S = k_B c³ A / (4Gℏ)</strong>, temperatura de Hawking, dilatación temporal, H(z), ratio rₛ/l_P, etc. Las teorías propias (★) derivan de los umbrales híbridos <strong>100·rₛ</strong> y <strong>80 u.vis</strong>. Al cruzar, la membrana cambia de color y el interior aparece con opacidad proporcional a la inmersión.",
        "controls": "Selector → <strong>Teoría del horizonte</strong>. En Horizonte de sucesos elige la teoría del menú desplegable o usa <strong>teorías destacadas</strong>. Botón <strong>Zoom al horizonte</strong> recentra la cámara. <strong>▶ Enviar sonda</strong> para cruce automático. Expande <strong>ℹ️ Más info</strong> en el panel inferior para el resumen extendido de cada teoría. Tour 60s en controles para recorrido guiado.",
        "whatToWatch": "<ol>\n<li><strong>Membrana del horizonte:</strong> color y ripple según teoría (naranja firewall, cian holográfico, violeta cuerdas…).</li>\n<li><strong>Panel teoría:</strong> nombre, estado, descripción, «Qué verás al cruzar», lecturas en vivo.</li>\n<li><strong>ℹ️ Más info:</strong> párrafo resumen de la teoría seleccionada (referencia rápida).</li>\n<li><strong>Cruce:</strong> destello visual + interior 3D (túnel, fuzzball, biblioteca de Babel…).</li>\n<li><strong>Explainer superior:</strong> al entrar por primera vez, se expande 5 s con la guía de este modo.</li>\n</ol>",
        "faq": [
          {
            "q": "¿Cuál es la diferencia con el modo Agujero negro?",
            "a": "Misma escena física, pero cámara más cerca del horizonte y enfoque en el selector de teorías. Pensado para comparar interiores rápidamente."
          },
          {
            "q": "¿Qué significan ★ y ★★?",
            "a": "★ = especulativa (cuerdas, islas Hawking, fuzzball…). ★★ = ficción (Biblioteca de Babel) o ruptura física ★★ (CTC, G=0, masa negativa…) que viola leyes conocidas a propósito."
          },
          {
            "q": "¿Las lecturas en vivo son exactas?",
            "a": "Usan constantes SI reales (G, c, ℏ) con la masa y cosmología del simulador. Algunas escalas son simbólicas en teorías especulativas."
          }
        ],
        "showTheorySummaries": true
      },
      "binary_merger": {
        "id": "binary_merger",
        "icon": "💥",
        "title": "Binary black hole merger",
        "intro": "Simulación de un sistema binario de agujeros negros: inspiral por pérdida de energía orbital vía ondas gravitacionales (fórmula de Peters), fusión de horizontes, ringdown del remanente y —opcionalmente— evaporación de Hawking acelerada visualmente. Incluye ondas GW visibles como anillos expansivos que distorsionan el campo estelar. Inspirado en eventos como GW150914 (LIGO/Virgo).",
        "physics": "<strong>Pérdida de energía GW (Peters):</strong> dE/dt = −(32/5)(G⁴μ²M³)/(c⁵r⁵) con μ = m₁m₂/(m₁+m₂). La frecuencia del chirp aumenta al acercarse: <strong>f_GW ≈ 2×f_orbital</strong>. En la fusión ~5% de la masa se irradia; el remanente oscila en <strong>ringdown</strong> (cuasi-normal modes). <strong>Evaporación:</strong> t_evap ∝ M³; temperatura T_H = ℏc³/(8πGMk_B). El strain h y la energía radiada E_rad aparecen en el HUD y panel.",
        "controls": "Selector → <strong>Choque de agujeros negros</strong>. En controles Binario: ajusta <strong>M₁, M₂</strong> (masas solares), spins, <strong>Iniciar colisión</strong>, escala temporal y toggle <strong>muerte Hawking</strong>. La cámara orbita automáticamente el baricentro. <kbd>Espacio</kbd> pausa la fase actual (inspiral, merger, ringdown, evaporación).",
        "whatToWatch": "<ol>\n<li><strong>Inspiral:</strong> dos BH orbitan, espiralan hacia dentro; anillos GW azul-blancos se expanden desde el centro.</li>\n<li><strong>Fusión:</strong> destello dorado + pulso de memoria gravitacional; los horizontes se unen.</li>\n<li><strong>Ringdown:</strong> el remanente oscila y se estabiliza; ondas de amplitud decreciente.</li>\n<li><strong>Evaporación (opcional):</strong> el BH pierde masa por Hawking hasta desaparecer.</li>\n<li><strong>Paneles:</strong> fase, M₁/M₂, separación, strain h, f_GW, E_rad, T_Hawking; eventos en tiempo real.</li>\n</ol>",
        "faq": [
          {
            "q": "¿Las ondas gravitacionales son realistas?",
            "a": "La tasa de inspiral sigue Peters en orden de magnitud; la visualización de anillos es pedagógica, no una solución numérica de Einstein completa."
          },
          {
            "q": "¿Qué es el ringdown?",
            "a": "Oscilaciones del horizonte del remanente tras la fusión, como un tambor que vibra y se amortigua. Dura milisegundos en sistemas estelares."
          },
          {
            "q": "¿Por qué la evaporación es tan rápida?",
            "a": "Está acelerada visualmente: un BH estelar tardaría ~10⁶⁷ años en evaporarse. Aquí puedes ver el proceso completo en minutos."
          }
        ]
      },
      "deep_field": {
        "id": "deep_field",
        "icon": "🔭",
        "title": "Deep universe",
        "intro": "Cosmic deep field: fly through starry void with distant galaxies (SDSS sample), Planck CMB texture, and stars with diffraction halos. The black hole is nearly invisible (1.5% scale) as a local reference anchor. Ideal for exploring expansion, redshift, and cosmic scale without horizon distractions.",
        "physics": "<strong>ΛCDM basis:</strong> <strong>H(a) = H₀√(Ωₘ/a³ + ΩΛ)</strong>, <strong>z = 1/a − 1</strong>, comoving distance <strong>d_c = c∫ dz'/H(z')</strong> numerically integrated. Universe age from <strong>t₀ = ∫ da/(a H(a))</strong>. Deep-field galaxies follow angular positions from the SDSS sample; the CMB background uses the Planck 2018 temperature map as a spherical texture.",
        "controls": "Scene selector → <strong>Deep universe</strong>. Adjust <strong>H₀, Ωₘ, ΩΛ</strong> in Cosmology and watch the HUD (a, z, H, d_c, age). Rotate and fly toward distant galaxies; the Lab panel shows cosmic era and formulas. Enable living universe to see the star field expand.",
        "whatToWatch": "<ol>\n<li><strong>Diffractive star field:</strong> thousands of points with diffraction halos separating with a(t).</li>\n<li><strong>SDSS galaxies:</strong> elliptical smudges at various redshifts in cosmic void.</li>\n<li><strong>Planck CMB:</strong> background sphere with primordial temperature fluctuations.</li>\n<li><strong>Faint black hole:</strong> nearly invisible local reference at center.</li>\n<li><strong>HUD and lab:</strong> live cosmological readouts and Friedmann formula validation.</li>\n</ol>",
        "faq": [
          {
            "q": "Are the galaxy data real?",
            "a": "Yes — angular positions from an SDSS catalog subsample. Sizes and colors are representative, not exact photometry."
          },
          {
            "q": "Why is the black hole barely visible?",
            "a": "This mode sets bhScale to 0.015 to focus on the cosmic deep field. It remains as a local scale reference."
          },
          {
            "q": "How does this differ from ΛCDM Cosmology mode?",
            "a": "Cosmology minimizes the BH (35%) and emphasizes Friedmann. Deep field adds SDSS galaxies, Planck CMB, and stellar diffraction with the BH nearly hidden."
          }
        ]
      },
      "string_theory": {
        "id": "string_theory",
        "icon": "🎻",
        "title": "String theory",
        "intro": "Vuelo cinematográfico a lo largo de una cuerda cósmica gigante en un vacío con branas D colisionando — modelo pedagógico del escenario ekpyrótico (Big Bang como choque de branas). También puedes ver el interior «cuerdas» del agujero negro si eliges esa teoría en el modo horizonte. Aquí no hay BH: solo el paisaje de cuerdas, dimensiones extra compactificadas y modos vibracionales.",
        "physics": "<strong>Cuerdas:</strong> objetos 1D con tensión T ≈ 1/(2πα′); modos vibracionales determinan la «partícula» (gravitón = modo cerrado). <strong>Dimensiones extra:</strong> compactificadas en variedades Calabi-Yau con radio R ~ l_P√(rₛ/l_P) (simbólico). <strong>Acoplamiento g_s</strong> y entropía de Bekenstein como conteo de micro-estados. La cámara sigue una trayectoria sinusoidal a lo largo de la cuerda principal. Colisión de branas → pulso de energía visual (no cálculo M-theory completo).",
        "controls": "Selector → <strong>Teoría de cuerdas</strong>. La cámara se mueve automáticamente; puedes rotar ligeramente con arrastre. Panel inferior: lecturas de g_s, R compact., modos n, entropía. Para ver cuerdas <em>dentro</em> de un agujero negro, usa modo Agujero negro o Teoría del horizonte y elige «Teoría de cuerdas ★».",
        "whatToWatch": "<ol>\n<li><strong>Cuerda principal:</strong> filamento luminoso que serpentea; la cámara lo recorre.</li>\n<li><strong>Branas D:</strong> planos translúcidos que se acercan y colisionan periódicamente.</li>\n<li><strong>Modos vibracionales:</strong> ondas que recorren la cuerda a distintas frecuencias.</li>\n<li><strong>Dimensiones extra:</strong> rejillas ortogonales que sugieren compactificación.</li>\n<li><strong>Panel:</strong> g_s, radio de compactificación, número de modos, entropía simbólica.</li>\n</ol>",
        "faq": [
          {
            "q": "¿Esto confirma la teoría de cuerdas?",
            "a": "No. Es una visualización educativa de conceptos (cuerdas, branas, compactificación). No hay predicciones testables directas aquí."
          },
          {
            "q": "¿En qué se diferencia del interior «cuerdas» del horizonte?",
            "a": "Este modo es un vuelo por el vacío cósmico; el interior del horizonte muestra Calabi-Yau, branas y lecturas acopladas a la masa del BH simulado."
          },
          {
            "q": "¿Puedo controlar la cámara libremente?",
            "a": "Parcialmente: hay seguimiento automático de la cuerda con suavizado. OrbitControls permiten ajustes, pero el modo está diseñado para el vuelo guiado."
          }
        ]
      }
    },
    "theories": {
      "singularity": "La Relatividad General clásica predice que toda la masa colapsa en r = 0 con densidad infinita. Es la predicción estándar, pero se cree que la gravedad cuántica reemplaza la singularidad.",
      "white_hole": "Solución matemática inversa al agujero negro: solo expulsa materia, nada entra. Podría ser el otro extremo de un diagrama de Penrose, aunque ninguno se ha observado.",
      "wormhole": "Un túnel (puente Einstein-Rosen) que conectaría dos regiones del espaciotiempo. Requiere materia exótica con energía negativa para permanecer abierto; sin ella colapsa en microsegundos.",
      "baby_universe": "El colapso podría «rebotar» en un Big Bang local, creando un universo hijo con constantes físicas ligeramente distintas (propuesta de Lee Smolin y otros).",
      "firewall": "Para resolver la paradoja de la información, AMPS propuso una pared de radiación ultraluminosa en el horizonte que destruiría cualquier cruzador, violando el principio de equivalencia.",
      "holographic": "La información de todo lo que cae queda codificada en la superficie 2D del horizonte (principio holográfico, AdS/CFT). El interior sería una descripción equivalente, no un lugar físico separado.",
      "quantum_foam": "A la escala de Planck (~10⁻³⁵ m) el espaciotiempo deja de ser liso y se vuelve «espumoso». La gravedad cuántica podría eliminar la singularidad clásica.",
      "friedmann_echo": "Teoría propia del motor: el interior no es otro lugar sino el universo en expansión visto desde coordenadas congeladas cerca del horizonte, dominado por el factor de escala a(t).",
      "hybrid_regime": "Teoría propia: en el horizonte coexisten Schwarzschild (< 100·rₛ), N-cuerpos (hasta 80 u.vis) y Friedmann (más allá). Ningún régimen solo describe el cruce.",
      "temporal_fracture": "Teoría propia: el horizonte fractura dos relojes — el externo te ve congelado; en coordenadas propias cruzas en tiempo finito y encuentras un cosmos futuro.",
      "information_loop": "Teoría propia: la información de partículas caídas se distribuye en el horizonte, se mezcla con el redshift cosmológico y reaparece como radiación de baja energía sin destruirse.",
      "planck_threshold": "Teoría propia: al acercarse a rₛ la curvatura alcanza la escala de Planck; la singularidad se disuelve en una red de burbujas cuánticas cuyo tamaño crece con la masa.",
      "cosmic_resonance": "Teoría propia: la frecuencia de Hubble H(z) excita un resonador interior; las capas del otro lado pulsan como armónicos de a(t) medido en vivo.",
      "accretion_inverted": "Teoría propia: el horizonte invierte el flujo del disco de acreción según límites de Eddington; la materia que cae reaparece expulsándose hacia el centro.",
      "eternal_geodesic": "Teoría propia: el interior es una red de geodésicas lumínicas atrapadas en la esfera de fotones (r = 1,5 rₛ), luz que nunca cae ni escapa.",
      "max_entropy": "Teoría propia: el interior es el microestado de máxima entropía Bekenstein-Hawking compatible con la masa; solo equilibrio térmico, sin geometría clásica.",
      "hawking_islands": "La paradoja de la información se resuelve con «islas» cuánticas de entropía fuera del horizonte, entrelazadas con la radiación de Hawking (propuesta Page et al.).",
      "er_epr_bridge": "Conjetura Maldacena-Susskind: el entrelazamiento cuántico (EPR) es equivalente a un puente Einstein-Rosen (ER) microscópico. Cruzar el horizonte revela esta red de puentes.",
      "planck_star": "Propuesta de Rovelli-Vidotto: el colapso rebota en densidad de Planck formando una estrella ultra-densa del tamaño de rₛ, sin singularidad en r = 0.",
      "string_theory": "El interior sería un bulk con dimensiones extra compactificadas (Calabi-Yau), cuerdas vibrantes y branas D; la entropía del horizonte cuenta modos de cuerdas (AdS/CFT, fuzzballs).",
      "fuzzball": "Propuesta de Mathur: no hay horizonte liso sino una superposición de micro-estados de cuerdas extendidas («pelota borrosa») que reproduce la entropía sin paradoja.",
      "cpt_mirror": "El interior sería un universo CPT-espejo donde carga, paridad y flecha temporal se invierten; la materia caída reaparece como antimateria en expansión.",
      "ads_cft_dynamic": "Modelo AdS/CFT dinámico: el volumen interior (Anti-de Sitter) es dual a una teoría de campos conforme en el horizonte 2D; H(z) modula el acoplamiento.",
      "babel_library": "Ficción científica (Borges): el interior es una biblioteca infinita donde cada bit del horizonte abre un volumen de micro-estados posibles del universo.",
      "friedmann_gate": "Ficción cosmológica: cruzar el horizonte abre un universo Friedmann gemelo con Ωₘ y ΩΛ intercambiados, calculado en vivo por el motor.",
      "cosmic_inflation": "El interior sería el campo inflatón en expansión exponencial temprana, el mismo mecanismo que estiró el cosmos en la fracción de segundo posterior al Big Bang.",
      "dark_matter": "Un halo invisible de materia oscura (~85% de Ωₘ) distorsiona geodésicas y produce lensing sin emisión luminosa, dominando la dinámica interior.",
      "dark_energy": "La energía oscura (Λ, ~70% del universo) acelera la expansión del interior igual que el cosmos exterior, diluyendo cualquier materia que cruce.",
      "cosmic_strings": "Defectos topológicos unidimensionales del universo temprano atraviesan el interior, curvando el espacio con ángulos de déficit sin masa local.",
      "lqg_bounce": "La gravedad cuántica de bucles predice un rebote en densidad de Planck: no hay r = 0, el colapso se detiene y el espaciotiempo repunta.",
      "omega_multiverse": "Teoría propia: el interior se bifurca en ramas según Ωₘ/ΩΛ — materia dominante, equilibrio o Λ dominante — cada una un universo hijo con distinto destino.",
      "time_loop": "Ruptura física ★★: curvas cerradas de tipo tiempo — el interior es el exterior en un bucle de Möbius; relojes invertidos y causalidad cerrada (imposible sin materia exótica).",
      "gravity_off": "Ruptura física ★★: G → 0 dentro del horizonte; escombros flotan y el disco se invierte. Viola el principio de equivalencia y Einstein.",
      "negative_mass": "Ruptura física ★★: materia de masa negativa repele gravitatoriamente; el horizonte se expande hacia afuera. Viola condiciones de energía.",
      "causality_shatter": "Ruptura física ★★: efectos preceden causas; esquirlas de línea temporal y entropía que decrece localmente.",
      "infinite_density_bounce": "Ruptura física ★★: densidad infinita sin singularidad, rebote con G efectivo negativo; núcleo que oscila eternamente.",
      "chronology_horizon": "Ruptura física ★★: el horizonte es frontera temporal, no espacial; relojes derretidos y protección cronológica de Hawking violada.",
      "antigravity_core": "Ruptura física ★★: núcleo de vacío antigravitatorio que repele todo (fantasía Einstein-Cartan). Viola energía positiva.",
      "paradox_engine": "Ruptura física ★★: información crea/destruye masa; índice de paradoja y ΔS < 0 etiquetado — viola conservación y 2.ª ley."
    }
  },
  "modes": {
    "black_hole": {
      "name": "Black hole",
      "subtitle": "Hybrid Schwarzschild + Friedmann engine · Horizon theories"
    },
    "multiverse": {
      "name": "Multiverse",
      "subtitle": "Friedmann bubbles · Λ acceleration · Ωₘ/ΩΛ branches · portal"
    },
    "higgs": {
      "name": "God Particle (Higgs)",
      "subtitle": "Scalar field · mass coupling · abstract LHC aesthetic"
    },
    "cosmology": {
      "name": "ΛCDM Cosmology",
      "subtitle": "Galactic field · redshift · Hubble flow · CMB · minimal BH"
    },
    "theory_picker": {
      "name": "Horizon theory",
      "subtitle": "Pick a featured theory · zoom to horizon"
    },
    "string_theory": {
      "name": "String theory",
      "subtitle": "Vibrating strings · colliding branes · flight along a string"
    },
    "binary_merger": {
      "name": "Binary black hole merger",
      "subtitle": "Inspiral · merger · ringdown · Hawking evaporation"
    },
    "deep_field": {
      "name": "Deep universe",
      "subtitle": "Deep field · SDSS · Planck CMB · stellar diffraction"
    }
  },
  "featuredTheories": {
    "singularity": "Singularity",
    "dark_matter": "Dark matter",
    "dark_energy": "Dark energy",
    "lqg_bounce": "LQG bounce",
    "cosmic_inflation": "Inflation",
    "er_epr_bridge": "ER=EPR",
    "omega_multiverse": "Multiverse Ω",
    "fuzzball": "Fuzzball"
  },
  "physicsBreakTheories": {
    "time_loop": "Time loop",
    "gravity_off": "Gravity off",
    "negative_mass": "Negative mass",
    "causality_shatter": "Broken causality",
    "infinite_density_bounce": "ρ=∞ bounce",
    "chronology_horizon": "Chronology horizon",
    "antigravity_core": "Antigravity core",
    "paradox_engine": "Paradox engine"
  },
  "gui": {
    "title": "Controls",
    "modeFolder": "Simulation mode",
    "scene": "Scene",
    "modeHint": "Controls for: {mode}",
    "featuredFolder": "Featured theories",
    "bh": "Black hole",
    "mass": "Mass (M☉)",
    "spin": "Kerr spin",
    "binary": "Binary merger",
    "m1": "M₁ (M☉)",
    "m2": "M₂ (M☉)",
    "separation": "Separation",
    "spin1": "Spin M₁",
    "spin2": "Spin M₂",
    "hawkingDeath": "Hawking death",
    "startCollision": "▶ Start collision",
    "resetBinary": "↺ Reset binary",
    "gw150914": "GW150914 preset",
    "cosmo": "Cosmology",
    "cosmoMultiverse": "Multiverse parameters",
    "horizon": "Horizon",
    "horizonStrings": "String theory",
    "theory": "Theory",
    "launchProbe": "▶ Launch probe",
    "resetProbe": "↺ Reset probe",
    "ruptureFolder": "★★ Physics break",
    "ruptureWarning": "⚠ Violates physics on purpose",
    "sim": "Simulation",
    "timeScale": "Speed (10^x)",
    "pause": "Pause",
    "expansion": "Expansion",
    "geodesics": "Geodesics",
    "lensing": "Lensing",
    "life": "Living universe",
    "realism": "Realism",
    "realismRealistic": "Realistic (Planck/LIGO)",
    "realismStandard": "Standard",
    "realismCinematic": "Cinematic",
    "autoCamera": "Auto camera (8s)",
    "tour": "▶ 60s tour",
    "lab": "Laboratory",
    "formulaName": "Formula name",
    "expression": "Expression",
    "preset": "Preset",
    "addFormula": "+ Formula",
    "clearFormulas": "Clear custom formulas",
    "reset": "Reset",
    "resetSim": "↺ Simulation",
    "resetFull": "⏮ FULL reset",
    "resetFullClear": "⏮ Reset + clear formulas",
    "research": "Research",
    "exportData": "📥 Export data (CSV/JSON)",
    "exportJson": "📥 Export series (JSON)",
    "exportValidation": "📋 Validation report",
    "exportPublication": "📄 Publication report (HTML)",
    "sweepH0": "H₀ sweep (60–80)",
    "sweepMass": "M_BH sweep (rₛ,T,τ)",
    "h0Points": "H₀ points",
    "massPoints": "Mass points",
    "copyUrl": "🔗 Copy reproducible URL",
    "cosmoPresets": {
      "lcdm": "ΛCDM",
      "planck2018": "Planck 2018",
      "hubble_tension_high": "High Hubble",
      "hubble_tension_low": "Low Hubble",
      "matter_dominated": "Matter only",
      "einstein_de_sitter": "Einstein-de Sitter",
      "custom": "Custom"
    },
    "model": "Model"
  },
  "panels": {
    "lab": {
      "title": "Laboratory",
      "age": "Universe age:",
      "validation": "Validation",
      "error": "error:"
    },
    "research": {
      "title": "Research",
      "seed": "Seed:",
      "samples": "Samples:",
      "compareTitle": "Theoretical model vs Simulation",
      "theoretical": "Theory",
      "simulated": "Sim",
      "error": "Error",
      "limits": "Honest limitations (not research-grade)",
      "validated": "✓ Validated in this mode",
      "visualOnly": "◎ Visual / pedagogical only",
      "limitsNote": "Lensing is screen-space post-processing (not geodesic ray-tracing). BH interiors are illustrative theory scenes. Binary merger uses Peters + phenomenological models, not full NR (SXS/ETK).",
      "collapse": "Collapse research panel",
      "maturity": "Scientific maturity",
      "ligoTitle": "LIGO GW150914 vs sim",
      "ligoLegend": "Orange = LIGO data · Cyan = simulation",
      "theoryCompare": "Theory comparator",
      "exportHelpTitle": "What does each export contain?",
      "workflowTitle": "Quick research guide",
      "workflowIntro": "Recommended workflow to use CosmosSim as a reproducible lab:",
      "step1": "<strong>Configure</strong> — Pick mode (bottom bar), mass/H₀/Ω in the right GUI (<kbd>G</kbd>). Use «Realistic (Planck/LIGO)» for observational calibration.",
      "step2": "<strong>Observe</strong> — HUD (left): a, z, H, d_c, rₛ. <strong>Lab</strong>: live formulas. <strong>Theory</strong>: horizon readouts.",
      "step3": "<strong>Validate</strong> — <strong>Research</strong> panel (📊 bottom-right): theory vs simulation table, maturity N2–N4, LIGO comparison in binary mode.",
      "step4": "<strong>Export</strong> — GUI → <strong>Research</strong> folder: CSV/JSON time series, validation JSON report, HTML publication report, H₀ and M_BH sweeps.",
      "step5": "<strong>Reproduce</strong> — «Copy URL» saves seed and parameters. Share the link to repeat the experiment.",
      "step6": "<strong>Automate</strong> — Browser console: <code>window.CosmosSim</code> exposes snapshot, validations and programmatic export.",
      "workflowTip": "💡 <kbd>V</kbd> hides panels for a clean 3D view only. <kbd>?</kbd> opens the full guide with a research section.",
      "welcomeHint": "📊 Research panel bottom-right — workflow guide inside the panel",
      "workflowTitle": "Quick research guide",
      "workflowIntro": "Recommended workflow to use CosmosSim as a reproducible lab:",
      "step1": "<strong>Configure</strong> — Pick mode (bottom bar), mass/H₀/Ω in the right GUI (<kbd>G</kbd>). Use «Realistic (Planck/LIGO)» for observational calibration.",
      "step2": "<strong>Observe</strong> — HUD (left): a, z, H, d_c, rₛ. <strong>Lab</strong>: live formulas. <strong>Theory</strong>: horizon readouts.",
      "step3": "<strong>Validate</strong> — <strong>Research</strong> panel (📊 bottom-right): theory vs simulation table, maturity N2–N4, LIGO comparison in binary mode.",
      "step4": "<strong>Export</strong> — GUI → <strong>Research</strong> folder: CSV/JSON time series, validation JSON report, HTML publication report, H₀ and M_BH sweeps.",
      "step5": "<strong>Reproduce</strong> — «Copy URL» saves seed and parameters. Share the link to repeat the experiment.",
      "step6": "<strong>Automate</strong> — Browser console: <code>window.CosmosSim</code> exposes snapshot, validations and programmatic export.",
      "workflowTip": "💡 <kbd>V</kbd> hides panels for a clean 3D view only. <kbd>?</kbd> opens the full guide with a research section.",
      "welcomeHint": "📊 Research panel bottom-right — workflow guide inside the panel"
    },
    "theory": {
      "crossing": "What you will see when crossing:",
      "crossingDefault": "The horizon dissolves into a distinct theoretical interior depending on the chosen theory.",
      "readouts": "Theory readouts",
      "physicsBasis": "Physical basis:",
      "immersion": "Immersion:",
      "probeState": "Probe state:",
      "dilation": "Time dilation:",
      "crossingProgress": "Crossing progress:",
      "cameraDist": "Camera dist. to horizon:",
      "interiorVisible": "Interior visible:",
      "hint": "💡 Zoom toward the black hole to activate the theory without the probe.",
      "original": "Theory derived from this simulation",
      "speculative": "Speculative ★",
      "physicsBreak": "Physics break ★★ — violates known laws on purpose",
      "fiction": "Science fiction ★★",
      "frozen": "≈ 0% (frozen)",
      "binary": {
        "title": "Binary black hole merger",
        "short": "Two black holes spiraling in, losing orbital energy via gravitational waves (Peters, 1964). Reduced mass μ = m₁m₂/(m₁+m₂).",
        "desc": "On merger, ~5% of mass is radiated. The remnant rings down and, if enabled, evaporates via Hawking (visually accelerated). <em>Disclaimer:</em> inspiral validated with Peters; merger/ringdown are phenomenological, not full NR.",
        "system": "Binary system",
        "hint": "💡 Watch blue-white expanding rings from the barycenter. At merger: golden flash + gravitational memory pulse.",
        "waiting": "Set masses and press «Start collision»"
      },
      "higgs": {
        "title": "Higgs boson",
        "status": "Scalar field · Higgs mechanism",
        "short": "The Higgs boson gives mass to particles via coupling to field φ.",
        "desc": "Abstract educational visualization: does not replicate exact LHC data, but the vacuum expectation value ⟨φ⟩ and fermion mass generation.",
        "readouts": "Symbolic readouts",
        "hint": "💡 Watch fermions approach the golden core and gain mass."
      },
      "strings": {
        "status": "String scene",
        "desc": "Cosmological scene: giant strings vibrating in vacuum, colliding D-branes (pedagogical ekpyrotic Big Bang model) and camera flight along a string.",
        "hint": "💡 You can also pick this theory at the BH horizon to see the Calabi-Yau interior with branes and vibrational modes."
      },
      "multiverse": {
        "title": "Multiverse Ω",
        "status": "Full scene · Friedmann bubbles",
        "short": "Each bubble is a universe with a different Ωₘ/ΩΛ pair.",
        "desc": "Navigate a void filled with bubble-universes expanding, colliding, and nucleating. Colored branches reflect the many-worlds interpretation per your simulated cosmology.",
        "cosmo": "Active cosmology",
        "bubbles": "Bubbles:",
        "bubblesCount": "~70+ active",
        "hint": "💡 Fly toward the central portal to traverse bifurcated branches."
      }
    },
    "life": {
      "awakening": "The cosmos awakens...",
      "waitingBinary": "Waiting for binary collision...",
      "phases": {
        "nacimiento": "🌌 Birth",
        "infancia": "✨ Childhood",
        "madurez": "🌀 Maturity",
        "vejez cósmica": "♾️ Old age"
      }
    },
    "collapse": "Minimize panel"
  },
  "probe": {
    "states": {
      "idle": "Idle",
      "approaching": "Approaching horizon",
      "crossing": "Crossing the horizon!",
      "inside": "Inside"
    },
    "immersion": {
      "none": "Exterior",
      "probe": "Probe in transit",
      "camera_approach": "Zoom: approaching horizon",
      "camera_inside": "Zoom: inside horizon"
    }
  },
  "binary": {
    "phases": {
      "idle": "Idle",
      "inspiral": "Inspiral (GW waves)",
      "merger": "Merger!",
      "ringdown": "Ringdown",
      "evaporation": "Hawking evaporation",
      "dead": "Death · void"
    },
    "events": {
      "inspiral": "Black holes spiral in... gravitational waves drain orbital energy",
      "merger": "Merger! Horizons join into a single black hole",
      "ringdown": "Ringdown — the horizon oscillates and stabilizes",
      "evaporation": "The black hole evaporates via Hawking radiation...",
      "dead": "Black hole death — only quantum vacuum remains"
    }
  },
  "toast": {
    "resetKey": "⏮ Universe reset (R key)",
    "resetSim": "↺ Simulation reset",
    "resetFull": "⏮ FULL reset",
    "resetFullClear": "⏮ Reset + formulas cleared",
    "modeChanged": "Mode: {mode}"
  },
  "experiment": {
    "title": "Experiment result"
  },
  "tour": {
    "cancel": "✕ Cancel (Esc)",
    "welcomeTitle": "What's inside the black hole?",
    "welcomeDesc": "Hybrid engine + horizon theories. Three quick steps:",
    "welcomeSteps": [
      "<strong>Zoom</strong> toward the black hole to activate the interior.",
      "<strong>Switch theories</strong> in the controls panel (★ = own/speculative).",
      "<strong>Try the 60s tour</strong> in Simulation → ▶ 60s tour."
    ],
    "start": "▶ Start tour",
    "skip": "Skip",
    "step1": "Step 1/5 — Resetting view…",
    "step2": "Step 2/5 — Approaching the black hole…",
    "step3": "Step 3/5 — Exploring horizon theories…",
    "step3Theory": "Step 3/5 — Theory: {theory}",
    "step4": "Step 4/5 — Formula laboratory…",
    "step5": "Step 5/5 — Living universe…",
    "done": "Tour complete! Explore freely.",
    "lifeEvent": "✨ Tour: the cosmos awakens at the horizon",
    "cancelled": "Tour cancelled"
  },
  "theories": {
    "singularity": {
      "name": "Singularity (classical GR)",
      "short": "La relatividad general predice un punto de densidad infinita en r = 0.",
      "description": "Según la Relatividad General de Einstein, toda la masa colapsa en un punto matemático de densidad y curvatura infinitas. Las leyes de la física dejan de tener sentido. Las fuerzas de marea divergen y cualquier objeto es destruido antes de llegar al centro.",
      "status": "Classical prediction",
      "crossingDescription": "Un núcleo rojo infinito que pulsa mientras anillos y espinas colapsan violentamente hacia r = 0.",
      "physicsBasis": ""
    },
    "white_hole": {
      "name": "White hole",
      "short": "Inverso temporal de un agujero negro: solo expulsa materia.",
      "description": "Solución matemática de las ecuaciones de Einstein donde el tiempo se invierte. Nada puede entrar, solo salir. Podría ser el \"otro lado\" de un agujero negro en un diagrama de Penrose extendido, aunque ningún agujero blanco se ha observado.",
      "status": "Mathematical solution",
      "crossingDescription": "Un estallido blanco cegador: chorros de materia y partículas que solo salen, nunca entran.",
      "physicsBasis": ""
    },
    "wormhole": {
      "name": "Einstein-Rosen bridge",
      "short": "Un túnel que conecta dos regiones del espaciotiempo.",
      "description": "Un \"agujero de gusano\" podría conectar el interior del agujero negro con otra región del universo o un universo paralelo. Requiere materia exótica con energía negativa para mantenerse estable; sin ella, el puente colapsa en microsegundos.",
      "status": "Hypothetical",
      "crossingDescription": "Un túnel azul wireframe se abre hacia un cuello de gusano y un cielo estrellado al otro lado.",
      "physicsBasis": ""
    },
    "baby_universe": {
      "name": "Universo hijo",
      "short": "El colapso da origen a un nuevo universo en expansión.",
      "description": "Propuesta de Lee Smolin y otros: el interior del agujero negro podría \"rebotar\" en un Big Bang local, creando un universo hijo con constantes físicas ligeramente diferentes. Nuestro universo podría ser el hijo de un agujero negro anterior.",
      "status": "Especulativo",
      "crossingDescription": "Una burbuja púrpura que se infla con mini-estrellas: un Big Bang local naciendo dentro del agujero.",
      "physicsBasis": ""
    },
    "firewall": {
      "name": "Firewall (AMPS)",
      "short": "Una pared de energía incandescente destruye todo en el horizonte.",
      "description": "Para resolver la paradoja de la información (¿qué pasa con los datos que caen?), AMPS propuso que el horizonte no es un paso tranquilo: es una pared de partículas de altísima energía que incinera cualquier cosa que lo cruce, violando el principio de equivalencia.",
      "status": "Controversial proposal",
      "crossingDescription": "Una pared de fuego naranja-incandescente: ondas de calor extremo que destruyen todo al cruzar.",
      "physicsBasis": ""
    },
    "holographic": {
      "name": "Holographic principle",
      "short": "La información se codifica en la superficie del horizonte.",
      "description": "La información de todo lo que cae al agujero negro queda codificada en el horizonte de sucesos como un holograma 2D. El interior sería una descripción equivalente pero no hay \"otro lado\" físico: la información persiste en la superficie y eventualmente se libera como radiación de Hawking.",
      "status": "Theoretical framework",
      "crossingDescription": "La membrana se convierte en scanlines cian: el interior es una malla de bits codificados en 2D.",
      "physicsBasis": ""
    },
    "quantum_foam": {
      "name": "Espuma cuántica (gravedad cuántica)",
      "short": "A escala de Planck, el espaciotiempo deja de ser continuo.",
      "description": "La gravedad cuántica (loops, cuerdas, etc.) sugiere que la singularidad no existe: el espaciotiempo se vuelve \"espumoso\" a la escala de Planck (~10⁻³⁵ m). El colapso podría detenerse y rebotar, o conectarse a otra región sin singularidad.",
      "status": "Investigación activa",
      "crossingDescription": "Espuma de burbujas poliédricas verdes que vibran: el espaciotiempo deja de ser continuo.",
      "physicsBasis": ""
    },
    "friedmann_echo": {
      "name": "Friedmann echo",
      "short": "El interior es el universo en expansión visto desde coordenadas congeladas.",
      "description": "Derivado de los cálculos de a(t) y H(t): al cruzar el horizonte, el factor de escala cosmológico domina sobre la gravedad local. El \"otro lado\" no es un lugar, sino el tiempo cósmico futuro expandiéndose a velocidad H(t), mientras tu reloj local tiende a cero. Las estrellas de fondo no se alejan: tú quedas fijo mientras a(t) las estira.",
      "status": "Own theory",
      "crossingDescription": "Capas esféricas rosas que se expanden como ecos del factor de escala a(t) del cosmos exterior.",
      "physicsBasis": ""
    },
    "hybrid_regime": {
      "name": "Hybrid transition zone",
      "short": "Tres regímenes físicos coexisten y compiten en el horizonte.",
      "description": "Basada en el umbral del simulador: por debajo de 100·rₛ rigen las geodésicas de Schwarzschild, entre 100·rₛ y 80 u.vis la gravedad N-cuerpos, y más allá la expansión de Friedmann. El horizonte es la frontera donde los tres regímenes se solapan: ninguna teoría sola describe lo que ocurre; el interior es un estado cuántico indeterminado entre colapso local y expansión global.",
      "status": "Own theory",
      "crossingDescription": "Tres esferas superpuestas (Schwarzschild, N-cuerpos, Friedmann) compitiendo en el mismo horizonte.",
      "physicsBasis": ""
    },
    "temporal_fracture": {
      "name": "Fractura temporal (teoría propia)",
      "short": "El tiempo local se congela; el tiempo cosmológico continúa.",
      "description": "De la fórmula √(1−rₛ/r): cuando r→rₛ, la dilatación temporal → 0. Conclusión: el horizonte es una fractura entre dos relojes. Un observador externo te ve congelado para siempre; tú, en coordenadas propias, cruzas en tiempo finito y encuentras un universo que envejeció infinitamente. El \"otro lado\" es el mismo cosmos, pero en un instante cosmológico futuro donde a(t) ≫ 1.",
      "status": "Conclusión del motor híbrido",
      "crossingDescription": "Una grieta dorada divide tiempo congelado (izquierda) de un cosmos que envejeció infinitamente (derecha).",
      "physicsBasis": ""
    },
    "information_loop": {
      "name": "Bucle de información (teoría propia)",
      "short": "La información circula entre regímenes sin destruirse.",
      "description": "Combinando N-cuerpos, geodésicas y holografía: la información de las partículas que caen se distribuye en el horizonte (superficie 2D), se mezcla con la expansión cosmológica (redshift z), y reaparece como radiación de baja energía. No hay \"otro lado\" material: hay un bucle donde datos locales se convierten en datos cosmológicos y viceversa, resolviendo la paradoja sin firewall.",
      "status": "Conclusión del motor híbrido",
      "crossingDescription": "Un anillo verde de bits que circula sin destruirse: la información rebota entre superficie y cosmos.",
      "physicsBasis": ""
    },
    "planck_threshold": {
      "name": "Umbral de Planck dinámico (teoría propia)",
      "short": "Al acercarse a rₛ, el espacio se vuelve espuma cuántica escalada por la masa.",
      "description": "Cuando r → rₛ, la escala de curvatura alcanza l_P ∝ √(ℏG/c³). El interior no es un punto: es una red de burbujas de Planck cuyo tamaño efectivo crece con M (rₛ/l_P ∝ M). La singularidad clásica se disuelve en fluctuaciones; lo que ves es el límite donde la gravedad de Schwarzschild y la gravedad cuántica compiten.",
      "status": "Conclusión del motor híbrido",
      "crossingDescription": "Red de burbujas de Planck violetas sobre una rejilla: la singularidad se disuelve en fluctuaciones.",
      "physicsBasis": "rₛ = 2GM/c² (schwarzschild_rs), longitud de Planck l_P = √(ℏG/c³), ratio rₛ/l_P desde masa simulada, dilatación √(1−rₛ/r) al acercarse."
    },
    "cosmic_resonance": {
      "name": "Resonancia cosmológica (teoría propia)",
      "short": "H(z) en el horizonte excita un eco interior con frecuencia cosmológica.",
      "description": "La tasa de expansión H(a) = H₀√(Ωₘa⁻³ + ΩΛ) define un período cósmico τ_H ∼ 1/H. Al cruzar el horizonte, ese ritmo se acopla con el redshift z = 1/a − 1: el interior pulsa como un resonador cuyo modo fundamental es la frecuencia de Hubble actual. Las capas del \"otro lado\" son armónicos de a(t) medido en vivo.",
      "status": "Conclusión del motor híbrido",
      "crossingDescription": "Anillos armónicos rosas que pulsan al ritmo de H(z): resonancia con la frecuencia de Hubble.",
      "physicsBasis": "Friedmann H(a) y H(z) del solver cosmológico, factor de escala a(t), redshift z, comparación H simulado vs H₀√(Ωₘ/a³ + ΩΛ)."
    },
    "accretion_inverted": {
      "name": "Membrana de acreción invertida (teoría propia)",
      "short": "La energía del disco refluye a través del horizonte según límites de Eddington.",
      "description": "El disco exterior acumula energía hasta el límite de Eddington L_Edd = 4πGMc/κ. En esta teoría, el horizonte invierte el flujo: la materia que \"cae\" desde fuera reaparece en el interior como un disco que expulsa hacia el centro, modulado por la tasa ṁ_Edd y el acoplamiento Bondi con la densidad local. El otro lado es un acrecedor invertido cuya luminosidad está acotada por los cálculos del motor.",
      "status": "Conclusión del motor híbrido",
      "crossingDescription": "Un disco de acreción invertido: materia que cae desde fuera reaparece expulsándose hacia el centro.",
      "physicsBasis": "Límite de Eddington (ṁ_Edd ∝ M), flujo Bondi ∝ ρ/(c_s³), masa M y rₛ del agujero simulado, fuerza de marea a r de la sonda."
    },
    "eternal_geodesic": {
      "name": "Geodésica eterna (teoría propia)",
      "short": "Fotones atrapados en r = 1,5 rₛ orbitan un interior de luz pura.",
      "description": "La esfera de fotones a r = 3GM/c² = 1,5 rₛ es una superficie de órbitas nulas inestables. Al cruzar el horizonte, entras a una red de geodésicas cerradas: luz atrapada que nunca alcanza r = 0 ni escapa. El ISCO a 3 rₛ marca la frontera entre órbitas materiales estables y este régimen fotónico eterno.",
      "status": "Conclusión del motor híbrido",
      "crossingDescription": "La esfera de fotones a 1,5 rₛ: luz amarilla atrapada en órbitas eternas sin escapar ni caer.",
      "physicsBasis": "Esfera de fotones r = 1,5 rₛ (photon_sphere), ISCO a 3 rₛ (isco), geodésicas del simulador, dilatación en r de la cámara/sonda."
    },
    "max_entropy": {
      "name": "Entropía máxima (teoría propia)",
      "short": "El interior es el estado de máxima entropía Bekenstein-Hawking del horizonte.",
      "description": "La entropía S = k_B c³ A / (4Gℏ) con A = 4πrₛ² fija el contenido informacional del interior. No hay geometría clásica: solo el microestado de máxima entropía compatible con M, temperatura T_H de Hawking y radiación de baja energía. Cada bit en la superficie corresponde a un grado de libertad interior en equilibrio térmico.",
      "status": "Conclusión del motor híbrido",
      "crossingDescription": "Ruido térmico verde-azul: el microestado de máxima entropía de Bekenstein-Hawking en equilibrio.",
      "physicsBasis": "Entropía Bekenstein-Hawking (bekenstein_entropy), temperatura de Hawking T_H, área del horizonte A = 4πrₛ², masa M simulada."
    },
    "hawking_islands": {
      "name": "Hawking islands",
      "short": "La información reaparece en islas cuánticas fuera del horizonte.",
      "description": "Propuesta de Page y colaboradores: la paradoja de la información se resuelve porque los estados puros del colapso se codifican en \"islas\" de entropía de Hawking — regiones cuánticas desconectadas del interior clásico pero entrelazadas con la radiación emitida. El interior sigue siendo un espacio-tiempo efectivo, pero los datos nunca se destruyen: migran a la superficie y a islas térmicas detectables en el espectro de Hawking.",
      "status": "Recent proposal",
      "crossingDescription": "Islas cuánticas azules orbitando el horizonte: la información reaparece fuera del interior clásico.",
      "physicsBasis": "Entropía Bekenstein-Hawking S = k_B c³A/(4Gℏ), temperatura T_H, área A = 4πrₛ², Page time τ_Page ∝ M³, comparación con radiación de Hawking del agujero simulado."
    },
    "er_epr_bridge": {
      "name": "ER = EPR (puente cuántico)",
      "short": "El entrelazamiento es un túnel de Einstein-Rosen a escala de Planck.",
      "description": "Conjetura de Maldacena y Susskind: dos partículas entrelazadas están conectadas por un agujero de gusano microscópico (ER). Al cruzar el horizonte macroscópico, entras a una red de puentes ER que codifican el entrelazamiento entre el interior y la radiación de Hawking exterior. El \"otro lado\" no es un lugar lejano: es el par EPR del agujero negro.",
      "status": "Especulativa ★",
      "crossingDescription": "Puentes ER curvos conectando pares entrelazados cian y magenta: el entrelazamiento es geometría.",
      "physicsBasis": "Longitud de Planck l_P, ratio rₛ/l_P, entropía S y bits informacionales, dilatación √(1−rₛ/r) en la sonda, geodésicas del simulador."
    },
    "planck_star": {
      "name": "Estrella de Planck",
      "short": "El colapso rebota en densidad de Planck antes de la singularidad.",
      "description": "Propuesta de Rovelli y Vidotto: la materia no alcanza r = 0. La presión cuántica de degeneración (ecuación de estado w ≈ −1/3 a escala de Planck) detiene el colapso y forma una \"estrella de Planck\" — un objeto ultra-denso del tamaño de rₛ pero sin horizonte clásico interno. Lo que cruzas es una capa dura cuántica que rebota la gravedad.",
      "status": "Especulativa ★",
      "crossingDescription": "Un núcleo naranja denso con ondas de rebote: el colapso se detiene en densidad de Planck.",
      "physicsBasis": "Densidad de Planck ρ_P = c⁵/(ℏG²), radio rₛ, masa M, ratio M/rₛ³ vs ρ_P, dilatación temporal en la sonda."
    },
    "string_theory": {
      "name": "String theory ★",
      "short": "El interior es un paisaje de dimensiones extra: cuerdas vibrantes, branas y el gravitón como estado cerrado.",
      "description": "La teoría de cuerdas postula que las partículas fundamentales no son puntos sino filamentos unidimensionales — cuerdas abiertas y cerradas — cuya vibración determina la masa y la carga. Para reconciliar cuántica y gravedad, el espacio-tiempo necesita dimensiones adicionales compactificadas (a menudo en variedades tipo Calabi-Yau del tamaño de la escala de Planck). El gravitón emerge como modo de vibración de una cuerda cerrada sin extremos.\n\nEn el contexto del agujero negro, la correspondencia AdS/CFT sugiere que el interior volumétrico es dual a una teoría de campos conforme en el horizonte 2D; la propuesta fuzzball de Mathur es un límite concreto donde micro-estados de cuerdas extendidas reemplazan el horizonte clásico. La entropía de Bekenstein-Hawking S = k_B c³A/(4Gℏ) se interpreta como conteo de modos vibracionales y configuraciones de cuerdas a escala l_P, con acoplamiento g_s y radio de compactificación R que dependen simbólicamente de la masa M.\n\nAl cruzar el horizonte en esta visualización, entras a un bulk con branas D translúcidas, planos de dimensiones extra ortogonales y cuerdas que oscilan a distintas frecuencias — un modelo pedagógico, no una predicción observacional directa.",
      "status": "Speculative",
      "crossingDescription": "La membrana vibra como una cuerda tensa: resonancia armónica al cruzar hacia el bulk de dimensiones extra.",
      "physicsBasis": "Dimensiones extra compactificadas (radio R simbólico ∝ l_P√(rₛ/l_P)), gravitón como cuerda cerrada, conexión AdS/CFT con entropía del horizonte, relación fuzzball–micro-estados, escala de Planck l_P = √(ℏG/c³), rₛ y ratio rₛ/l_P desde masa simulada, entropía Hawking como conteo de modos."
    },
    "fuzzball": {
      "name": "Fuzzball",
      "short": "Superposición de micro-estados sin horizonte clásico.",
      "description": "Propuesta de la teoría de cuerdas (Mathur): el agujero negro no tiene un horizonte liso. Es una \"pelota borrosa\" (fuzzball) — superposición de estados de cuerdas extendidas del tamaño de rₛ. No hay interior vacío: cada micro-estado es una configuración distinta de cuerdas que reproduce la entropía de Bekenstein-Hawking sin paradoja.",
      "status": "String theory proposal",
      "crossingDescription": "Nudos de cuerdas verdes en superposición: no hay interior vacío, solo micro-estados borrosos.",
      "physicsBasis": "Entropía S = k_B c³A/(4Gℏ), número de micro-estados N ~ e^(S/k_B), área A = 4πrₛ², temperatura T_H."
    },
    "cpt_mirror": {
      "name": "Universo espejo (CPT)",
      "short": "El interior es el universo CPT-simétrico reflejado.",
      "description": "Inspirado en la simetría CPT de la física de partículas: al cruzar el horizonte, entras a un universo espejo donde carga (C), paridad (P) y flecha temporal (T) se invierten. La materia que cae reaparece como antimateria en expansión; el tiempo cosmológico corre hacia atrás desde tu perspectiva exterior, pero es futuro propio en el espejo.",
      "status": "Especulativa ★",
      "crossingDescription": "Un espejo púrpura invierte materia y antimateria: el cosmos reflejado corre el tiempo al revés.",
      "physicsBasis": "Inversión temporal vinculada a dilatación √(1−rₛ/r), factor de escala a(t) y redshift z, H(z) del solver Friedmann, régimen cosmológico simulado."
    },
    "ads_cft_dynamic": {
      "name": "Horizonte holográfico dinámico",
      "short": "Modelo juguete AdS/CFT: el interior es el dual conforme del horizonte.",
      "description": "Basado en la correspondencia AdS/CFT (Maldacena): el volumen interior (Anti-de Sitter) es dual a una teoría de campo conforme (CFT) viviente en el horizonte 2D. Las lecturas en vivo del simulador alimentan el \"acoplamiento\" entre ambos: H(z) modula la dimensión efectiva del bulk, y la entropía del horizonte cuenta los grados de libertad del CFT.",
      "status": "Marco teórico (AdS/CFT)",
      "crossingDescription": "Bulk AdS ondulante con frontera CFT: el volumen interior es el dual holográfico de la superficie.",
      "physicsBasis": "Entropía S = k_B c³A/(4Gℏ) como conteo CFT, rₛ y área del horizonte, H(a) y a(t) modulan curvatura AdS efectiva, dilatación en la sonda."
    },
    "babel_library": {
      "name": "Library of Babel",
      "short": "Información infinita comprimida en cada punto del horizonte.",
      "description": "Ficción científica inspirada en Borges: el interior del agujero negro es una biblioteca infinita donde cada \"libro\" es un microestado posible del universo. La entropía de Bekenstein-Hawking es el índice: cada bit en el horizonte abre un volumen nuevo. Cruzar el horizonte es entrar al catálogo de todas las configuraciones que la física permite — y algunas imposibles.",
      "status": "Science fiction ★★",
      "crossingDescription": "Estantes infinitos de libros y partículas de texto ámbar: cada bit del horizonte abre un volumen nuevo.",
      "physicsBasis": "Metáfora sobre entropía S y bits informacionales del horizonte simulado; usa rₛ, T_H y Page time como \"índice de catalogación\"."
    },
    "friedmann_gate": {
      "name": "Puerta a otro Friedmann",
      "short": "El horizonte abre un Big Bang alternativo con otros Ω.",
      "description": "Ficción científica cosmológica: cruzar el horizonte no te lleva a r = 0 sino a otro universo de Friedmann con parámetros cosmológicos distintos — como si cada agujero negro fuera una puerta a un cosmos alternativo. El motor híbrido calcula en vivo qué universo \"gemelo\" sería compatible con la entropía que llevas.",
      "status": "Ficción científica ★★",
      "crossingDescription": "Un portal espiral magenta hacia un universo gemelo en expansión con Ω invertidos.",
      "physicsBasis": "Juguete cosmológico: H₀, Ωₘ, ΩΛ del simulador generan un universo gemelo con Ω invertidos; usa a(t), z y q(a) como parámetros de la puerta."
    },
    "cosmic_inflation": {
      "name": "Inflación cósmica",
      "short": "El interior es el campo inflatón en expansión exponencial.",
      "description": "La teoría de la inflación propone que el universo temprano experimentó una expansión exponencial impulsada por un campo escalar (inflatón). El horizonte del agujero negro, en esta lectura cosmológica, sería una región donde la energía de vacío domina y el espacio se estira más rápido que la luz localmente. El interior no es materia colapsada sino el mismo mecanismo que expandió el cosmos a escala microscópica.",
      "status": "Marco cosmológico",
      "crossingDescription": "Un campo inflatón violeta que estira el espacio exponencialmente: burbujas cuánticas en expansión ultra-rápida.",
      "physicsBasis": "Escala de Hubble de inflación H_inf ~ 10¹³ GeV, comparación con H₀ actual, factor de escala a(t) y redshift z del solver Friedmann."
    },
    "dark_matter": {
      "name": "Materia oscura",
      "short": "Un halo invisible distorsiona la luz y la dinámica interior.",
      "description": "La materia oscura constituye ~27% del universo pero no emite luz. En el interior del horizonte, esta lectura postula un halo de materia oscura no bariónica (WIMPs, axiones) que distorsiona geodésicas y produce lensing gravitacional sin contrapartida luminosa. Las galaxias y estrellas visibles orbitan en un potencial dominado por masa invisible.",
      "status": "Observación cosmológica",
      "crossingDescription": "Un halo azul oscuro invisible al ojo pero detectable por lensing: curvas de luz sin fuente luminosa.",
      "physicsBasis": "Ωₘ del cosmology simulado, fracción de materia oscura ~0.85·Ωₘ, lensing θ_E ~ 2rₛ/d, masa dinámica vs luminosa."
    },
    "dark_energy": {
      "name": "Energía oscura (Λ)",
      "short": "La constante cosmológica acelera el interior como el universo.",
      "description": "La energía oscura (~70% del universo) impulsa la aceleración cósmica actual. Al cruzar el horizonte bajo esta teoría, el interior no colapsa sino que hereda la expansión acelerada dominada por Λ: el espacio se estira exponencialmente a largo plazo, diluyendo cualquier materia que cruce. Es el mismo destino térmico que el cosmos exterior en un universo ΛCDM.",
      "status": "Observación cosmológica",
      "crossingDescription": "Capas púrpuras que se aceleran hacia afuera: la constante cosmológica estira el interior sin fin.",
      "physicsBasis": "Ω_Λ, parámetro de desaceleración q(a), H(a) = H₀√(Ωₘ/a³ + Ω_Λ), w = −1 para Λ pura."
    },
    "cosmic_strings": {
      "name": "Cuerdas cósmicas",
      "short": "Defectos topológicos de 1D cruzan el horizonte.",
      "description": "Las cuerdas cósmicas son defectos topológicos unidimensionales formados en transiciones de fase del universo temprano. Tensión μ ~ 10²² g/cm las hace supermasivas: curvan el espacio en ángulos cónicos sin masa local. El interior del agujero negro, en este modelo, estaría atravesado por redes de cuerdas que conectan regiones del espacio-tiempo como cicatrices del Big Bang.",
      "status": "Hipotético",
      "crossingDescription": "Filamentos verdes luminosos: defectos topológicos 1D que cortan el espacio como cicatrices.",
      "physicsBasis": "Tensión de cuerda μ, ángulo de déficit δ = 8πGμ/c², escala GUT ~ 10¹⁶ GeV, redshift z del cosmos simulado."
    },
    "lqg_bounce": {
      "name": "Rebote (gravedad cuántica de bucles)",
      "short": "La singularidad se reemplaza por un rebote cuántico.",
      "description": "La gravedad cuántica de bucles (LQG) predice que la densidad máxima es finita (~ρ_Planck): el colapso se detiene y rebota. No hay r = 0. El interior del agujero negro sería una región de espaciotiempo que emerge de un \"Big Bounce\" cuántico, conectada al exterior por el horizonte como frontera térmica. Es la alternativa más estudiada a la singularidad clásica.",
      "status": "Investigación activa",
      "crossingDescription": "Una esfera cian que rebota: la densidad de Planck detiene el colapso y el espacio repunta hacia afuera.",
      "physicsBasis": "Densidad de Planck ρ_P, radio de rebote r_b ~ rₛ·(ρ_BH/ρ_P)^(1/3), área mínima cuantizada en LQG, masa M simulada."
    },
    "time_loop": {
      "name": "Time loop (CTC)",
      "short": "Curvas cerradas de tipo tiempo: el interior es el exterior en bucle.",
      "description": "Ficción de ruptura física: el espaciotiempo se enrolla como una banda de Möbius. Cruzar el horizonte no te lleva «adelante» sino a una región donde el futuro es pasado y el exterior es interior. Los relojes giran al revés; la causalidad local se cierra en un bucle perfecto — algo que la Relatividad General solo tolera bajo materia exótica imposible y que aquí se asume a propósito.",
      "status": "Physics break ★★",
      "crossingDescription": "La membrana se retuerce en Möbius: relojes invertidos y el exterior reaparece dentro del bucle temporal.",
      "physicsBasis": "La GR permite CTC solo con condiciones de energía violadas (condición de energía débil). Aquí se viola a propósito: dilatación √(1−rₛ/r) invertida simbólicamente, flecha temporal Δt < 0 en la sonda."
    },
    "gravity_off": {
      "name": "Gravity off",
      "short": "G → 0 dentro del horizonte: nada atrae, todo flota.",
      "description": "Ruptura física deliberada: al cruzar el horizonte la constante gravitacional local cae a cero. Las ecuaciones de Einstein dejan de acoplar masa y curvatura; el disco de acreción se invierte y los escombros flotan en lugar de caer. Es el opuesto pedagógico de Schwarzschild: un interior sin peso donde la gravedad fue «apagada» como un interruptor.",
      "status": "Physics break ★★",
      "crossingDescription": "Un chasquido de gravedad invertida: escombros flotando y el disco de acreción boca arriba sin atraer nada.",
      "physicsBasis": "Newton: F = Gm₁m₂/r² con G_eff = 0 dentro de rₛ. Viola el principio de equivalencia y la curvatura de Einstein (G_μν = 8πG T_μν → plano con T ≠ 0)."
    },
    "negative_mass": {
      "name": "Materia de masa negativa",
      "short": "Repulsión gravitatoria: el horizonte se expande hacia afuera.",
      "description": "Si existiera materia con m < 0, la gravedad sería repulsiva. En esta ficción el interior del agujero negro está lleno de ella: las partículas huyen del centro, el horizonte parece crecer hacia el exterior y el colapso se invierte. La física real no permite masa negativa estable sin violar las condiciones de energía; aquí es el punto.",
      "status": "Ruptura física ★★",
      "crossingDescription": "Partículas de masa negativa huyen del centro mientras el horizonte se hincha hacia afuera como un globo repulsivo.",
      "physicsBasis": "F = G m₁m₂/r² con m₂ < 0 invierte la fuerza. Viola condiciones de energía (WEC/NEC). Radio de horizonte simbólico rₛ_eff = rₛ·(1 + |m_neg|/M)."
    },
    "causality_shatter": {
      "name": "Causa-efecto invertido",
      "short": "Los efectos preceden a las causas; la flecha temporal se rompe.",
      "description": "Interior donde la correlación temporal se invierte: ves el resultado antes del origen. Fragmentos de línea temporal flotan como esquirlas de cristal; eventos se rebobinan. Viola el principio de causalidad de la relatividad (conos de luz) y la termodinámica de flecha temporal. Etiquetado explícitamente como ficción de ruptura.",
      "status": "Ruptura física ★★",
      "crossingDescription": "Esquirlas de línea temporal rotas: los eventos se deshacen hacia atrás mientras los efectos brillan antes que sus causas.",
      "physicsBasis": "Causalidad: intervalo tipo tiempo exige que efectos sigan causas. Aquí Δt_causal < 0 simbólico; entropía local decrece (violación 2.ª ley etiquetada)."
    },
    "infinite_density_bounce": {
      "name": "Rebote de densidad infinita",
      "short": "ρ → ∞ sin singularidad: rebote con G negativo efectivo.",
      "description": "Un núcleo alcanza densidad infinita pero, en lugar de r = 0, rebota con gravedad efectiva negativa. Oscila eternamente entre colapso y expansión. Combina dos imposibilidades: singularidad sin tragar información y G < 0 local. Visual: núcleo pulsante que nunca se detiene.",
      "status": "Ruptura física ★★",
      "crossingDescription": "Un núcleo naranja oscila entre colapso infinito y rebote repulsivo: densidad ∞ sin punto, G efectivo negativo.",
      "physicsBasis": "ρ → ∞ pero V → 0 sin métrica singular; rebote con G_eff < 0. Viola teorema de Penrose (condiciones de energía) y positividad de G."
    },
    "chronology_horizon": {
      "name": "Horizonte cronológico",
      "short": "Frontera temporal, no espacial: el tiempo se derrite al cruzar.",
      "description": "El horizonte no es una superficie en r = cte sino una frontera entre eras temporales. Relojes se derriten literalmente; vectores de tiempo apuntan en direcciones imposibles. Inspirado en la conjetura de protección cronológica de Hawking — pero aquí la violamos a propósito para explorar paradojas.",
      "status": "Ruptura física ★★",
      "crossingDescription": "Relojes derretidos y flechas de tiempo que apuntan en todas las direcciones: el horizonte es una frontera temporal.",
      "physicsBasis": "Hawking: protección cronológica sugiere que la física impide CTC. Aquí el horizonte es τ = cte, no r = rₛ; dilatación √(1−rₛ/r) reemplazada por flujo temporal arbitrario."
    },
    "antigravity_core": {
      "name": "Núcleo antigravitatorio",
      "short": "Un vacío central repele toda la materia (torsión fantástica).",
      "description": "Fantasía inspirada en Einstein-Cartan con torsión extrema: el centro no atrae sino que repele. Una burbuja de vacío antigravitatorio empuja disco, partículas y luz hacia el horizonte interior. Viola el teorema de energía positiva y cualquier forma razonable de la ecuación de campo.",
      "status": "Ruptura física ★★",
      "crossingDescription": "Una burbuja de vacío cian repele todo hacia fuera: el núcleo es ausencia que empuja en lugar de atraer.",
      "physicsBasis": "Einstein-Cartan real añade torsión a la conexión; aquí la torsión genera repulsión central imposible. Viola teorema de energía positivo (ADM) y condición de energía."
    },
    "paradox_engine": {
      "name": "Máquina de paradojas",
      "short": "La información crea y destruye masa; la entropía puede decrecer.",
      "description": "El interior es un motor que convierte bits en gramos y viceversa. Cada paradoja lógica (bootstrap, abuelo, información sin origen) alimenta el núcleo. La entropía decrece visiblemente — violación flagrante de la segunda ley, etiquetada en pantalla. Puramente ficción para explorar límites conceptuales.",
      "status": "Ruptura física ★★",
      "crossingDescription": "Engranajes de paradoja violetas: información se condensa en masa y la entropía baja con cada vuelta del motor.",
      "physicsBasis": "E = mc² + k_B T ln(2)·I (Landauer extendido ficticio). Aquí Δm = f(paradoja) y ΔS < 0 permitido. Viola conservación de energía, información y segunda ley."
    },
    "omega_multiverse": {
      "name": "Multiverse by Ω",
      "short": "El interior ramifica según la razón Ωₘ/ΩΛ del cosmos simulado.",
      "description": "El destino cosmológico (colapso, equilibrio o expansión eterna) depende de Ωₘ y ΩΛ. Al cruzar el horizonte, el interior se bifurca: ramas dominadas por materia (Ωₘ > ΩΛ), por energía oscura (ΩΛ ≫ Ωₘ) o en punto crítico. Cada rama es un universo hijo con el mismo H₀ pero distinto parámetro de desaceleración q(a) calculado en vivo.",
      "status": "Own theory",
      "crossingDescription": "Tres ramas cosmológicas bifurcándose según Ωₘ/ΩΛ: materia, equilibrio o energía oscura dominante.",
      "physicsBasis": "Ωₘ, ΩΛ del solver Friedmann, parámetro q(a), classifyRegime en umbrales 100·rₛ y 80 u.vis, H(z) y a(t) actuales."
    }
  }
};
