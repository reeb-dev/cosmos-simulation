const SECTIONS = [
  {
    id: 'motor',
    icon: '⚙️',
    title: 'Motor híbrido de física',
  body: `Combina tres modelos que normalmente se estudian por separado:
<strong>Friedmann</strong> gobierna la expansión del universo entero (factor de escala a(t)).
<strong>Schwarzschild/Kerr</strong> describe la gravedad cerca del agujero negro: órbitas, caída libre y el horizonte de sucesos.
<strong>N-cuerpos</strong> simula partículas que interactúan gravitacionalmente entre sí y con el agujero.
El motor elige el régimen adecuado según la distancia de cada objeto al horizonte.`,
  },
  {
    id: 'cosmo',
    icon: '🌌',
    title: 'Cosmología',
    body: `El universo se expande según la ecuación de Friedmann. Puedes ajustar <strong>H₀</strong> (velocidad de expansión hoy), <strong>Ωₘ</strong> (densidad de materia) y <strong>ΩΛ</strong> (energía oscura).
El factor de escala <strong>a(t)</strong> y el corrimiento al rojo <strong>z</strong> aparecen en el HUD superior izquierdo.
Los presets (ΛCDM, Planck 2018, etc.) cargan combinaciones basadas en observaciones reales.`,
  },
  {
    id: 'bh',
    icon: '⚫',
    title: 'Agujero negro',
    body: `La <strong>masa</strong> (en masas solares) determina el radio del horizonte rₛ = 2GM/c².
El <strong>spin Kerr</strong> (0–0,998) deforma el espacio-tiempo y acelera el disco de acreción.
Visualmente verás el horizonte oscuro, una membrana ondulante y un disco caliente de materia cayendo.
Si el universo está "vivo", el agujero puede crecer por acreción de materia cercana.`,
  },
  {
    id: 'horizon',
    icon: '🌀',
    title: 'Horizonte y el "otro lado"',
    body: `El horizonte de sucesos es la frontera de no retorno: nada, ni la luz, puede escapar hacia fuera.
La física del interior es desconocida; aquí exploramos <strong>teorías clásicas</strong> (firewall, agujero de gusano, holografía…), <strong>teorías especulativas ★</strong> (islas de Hawking, ER=EPR, estrella de Planck, fuzzball, universo espejo CPT) y <strong>ficción científica ★★</strong> (Biblioteca de Babel, puerta a otro Friedmann).
También hay <strong>teorías propias ★</strong> derivadas del motor híbrido: eco de Friedmann, zona híbrida, fractura temporal, bucle de información, umbral de Planck, resonancia cosmológica, acreción invertida, geodésica eterna, entropía máxima, multiverso por Ω y horizonte holográfico dinámico (AdS/CFT).
Al acercarte o cruzar, el panel inferior izquierdo muestra la teoría activa, lecturas físicas en vivo y qué tan visible es el interior. Usa el <strong>Tour 60s</strong> en los controles para un recorrido guiado.`,
  },
  {
    id: 'probe',
    icon: '🛰️',
    title: 'Sonda y zoom inmersivo',
    body: `Puedes enviar una <strong>sonda</strong> desde los controles para que cruce el horizonte y revele el interior según la teoría elegida.
También basta con <strong>hacer zoom</strong> la cámara hacia el agujero negro: al acercarte, la simulación activa la inmersión automáticamente.
La dilatación temporal hace que el tiempo externo parezca congelarse cuando te acercas al horizonte.`,
  },
  {
    id: 'life',
    icon: '💫',
    title: 'Universo vivo',
    body: `El <strong>LifeEngine</strong> da comportamiento emergente al cosmos: nacen y mueren estrellas, aparecen partículas, hay erupciones en el disco y pulsos gravitacionales.
El panel inferior derecho muestra la fase de vida (nacimiento → vejez cósmica), vitalidad y eventos recientes.
Puedes activarlo o desactivarlo en los controles de simulación.`,
  },
  {
    id: 'lab',
    icon: '🔬',
    title: 'Laboratorio de fórmulas',
    body: `Calcula en tiempo real ecuaciones de relatividad, cosmología y mecánica celeste (H(z), rₛ, energía de enlace, etc.) y las compara con lo que muestra la simulación.
Puedes ejecutar <strong>experimentos</strong> desde el panel de controles y escribir <strong>fórmulas personalizadas</strong> con variables como G, M, c, r, a, H0.
El panel izquierdo indica la era cósmica actual según el redshift.`,
  },
  {
    id: 'visual',
    icon: '✨',
    title: 'Lensing, partículas y campo estelar',
    body: `<strong>Lensing gravitacional</strong>: la luz de las estrellas se curva cerca del agujero negro (efecto Einstein).
<strong>Geodésicas</strong>: trayectorias de prueba que siguen la curvatura del espacio-tiempo; algunas caen al horizonte, otras escapan.
<strong>Campo estelar</strong>: miles de estrellas que parpadean y se expanden con el universo; el grid cósmico marca la distorsión del espacio.
Las partículas N-cuerpos orbitan, chocan y pueden ser capturadas.`,
  },
  {
    id: 'controls',
    icon: '🎛️',
    title: 'Controles y reset',
    body: `<kbd>R</kbd> reinicia todo el universo. <kbd>Espacio</kbd> pausa o reanuda. Arrastra para rotar la vista, rueda para zoom.
El panel de controles (derecha) agrupa masa, cosmología, horizonte, simulación, laboratorio y reset.
<strong>Reset simulación</strong> vuelve parámetros y estado; <strong>Reset TOTAL</strong> también reinicia cámara, sonda y eventos del universo vivo.`,
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
