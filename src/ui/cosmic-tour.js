import * as THREE from 'three';
import { theoryNameById } from './master-controls.js';

const STORAGE_KEY = 'cosmos-tour-seen';
const TOUR_THEORIES = ['hawking_islands', 'er_epr_bridge', 'fuzzball'];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Tour cancelado', 'AbortError'));
    const id = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(id);
      reject(new DOMException('Tour cancelado', 'AbortError'));
    }, { once: true });
  });
}

function animateCamera(camera, controls, from, to, target, durationMs, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Tour cancelado', 'AbortError'));
    const start = performance.now();
    const startTarget = controls.target.clone();

    function frame(now) {
      if (signal?.aborted) return reject(new DOMException('Tour cancelado', 'AbortError'));
      const t = Math.min(1, (now - start) / durationMs);
      const e = easeInOut(t);
      camera.position.set(
        lerp(from.x, to.x, e),
        lerp(from.y, to.y, e),
        lerp(from.z, to.z, e)
      );
      controls.target.set(
        lerp(startTarget.x, target.x, e),
        lerp(startTarget.y, target.y, e),
        lerp(startTarget.z, target.z, e)
      );
      controls.update();
      if (t < 1) requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  });
}

export function createCosmicTour(ctx) {
  let running = false;
  let abortController = null;
  let overlayEl = null;
  let bannerEl = null;

  function ensureBanner() {
    if (bannerEl) return bannerEl;
    bannerEl = document.createElement('div');
    bannerEl.id = 'tour-banner';
    bannerEl.innerHTML = '<span id="tour-banner-text"></span><button type="button" id="tour-cancel">✕ Cancelar (Esc)</button>';
    document.body.appendChild(bannerEl);
    bannerEl.querySelector('#tour-cancel').addEventListener('click', cancel);
    return bannerEl;
  }

  function setBanner(text) {
    ensureBanner();
    bannerEl.classList.add('visible');
    bannerEl.querySelector('#tour-banner-text').textContent = text;
  }

  function hideBanner() {
    bannerEl?.classList.remove('visible');
  }

  function highlightPanel(id, on) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('tour-highlight', on);
  }

  function switchTheory(id) {
    ctx.horizonSim.setTheory(id);
    ctx.onTheoryChange?.(id);
    ctx.guiSync?.();
  }

  async function runTour() {
    if (running) return;
    running = true;
    abortController = new AbortController();
    const signal = abortController.signal;

    ctx.cameraLife?.setEnabled?.(false);
    localStorage.setItem(STORAGE_KEY, '1');

    try {
      const rs = ctx.universe.rsVis;
      const camera = ctx.camera;
      const controls = ctx.controls;

      setBanner('Paso 1/5 — Reiniciando vista…');
      ctx.cameraLife?.resetCamera?.(camera, controls);
      await wait(4000, signal);

      setBanner('Paso 2/5 — Acercándose al agujero negro…');
      const from = camera.position.clone();
      const to = new THREE.Vector3(rs * 1.2, rs * 0.4, rs * 1.1);
      await animateCamera(camera, controls, from, to, new THREE.Vector3(0, 0, 0), 12000, signal);
      await wait(2000, signal);

      setBanner('Paso 3/5 — Explorando teorías del horizonte…');
      for (const id of TOUR_THEORIES) {
        switchTheory(id);
        setBanner(`Paso 3/5 — Teoría: ${theoryNameById(id)}`);
        await wait(6000, signal);
      }

      setBanner('Paso 4/5 — Laboratorio de fórmulas…');
      highlightPanel('lab-panel', true);
      await wait(8000, signal);
      highlightPanel('lab-panel', false);

      setBanner('Paso 5/5 — Universo vivo…');
      highlightPanel('life-panel', true);
      if (ctx.lifeEngine) {
        ctx.lifeEngine.enabled = true;
        ctx.lifeEngine.events.unshift({
          text: '✨ Tour: el cosmos despierta en el horizonte',
          time: ctx.lifeEngine.age,
        });
        ctx.guiSync?.();
      }
      await wait(8000, signal);
      highlightPanel('life-panel', false);

      setBanner('¡Tour completado! Explora libremente.');
      await wait(3000, signal);
    } catch (e) {
      if (e.name !== 'AbortError') console.warn(e);
    } finally {
      hideBanner();
      highlightPanel('lab-panel', false);
      highlightPanel('life-panel', false);
      ctx.cameraLife?.setEnabled?.(true);
      running = false;
      abortController = null;
    }
  }

  function cancel() {
    abortController?.abort();
    hideBanner();
    highlightPanel('lab-panel', false);
    highlightPanel('life-panel', false);
    running = false;
  }

  function showWelcomeIfNeeded() {
    if (localStorage.getItem(STORAGE_KEY)) return;

    overlayEl = document.createElement('div');
    overlayEl.id = 'tour-welcome';
    overlayEl.innerHTML = `
      <div class="tour-welcome-card">
        <h2>¿Qué hay dentro del agujero negro?</h2>
        <p>Motor híbrido + teorías del horizonte. Tres pasos rápidos:</p>
        <ol>
          <li><strong>Zoom</strong> hacia el agujero negro para activar el interior.</li>
          <li><strong>Cambia teorías</strong> en el panel de controles (★ = propias/especulativas).</li>
          <li><strong>Prueba el Tour 60s</strong> en Simulación → ▶ Tour 60s.</li>
        </ol>
        <div class="tour-welcome-actions">
          <button type="button" id="tour-welcome-start">▶ Iniciar tour</button>
          <button type="button" id="tour-welcome-skip">Saltar</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlayEl);

    overlayEl.querySelector('#tour-welcome-start').addEventListener('click', () => {
      overlayEl.remove();
      overlayEl = null;
      runTour();
    });
    overlayEl.querySelector('#tour-welcome-skip').addEventListener('click', () => {
      localStorage.setItem(STORAGE_KEY, '1');
      overlayEl.remove();
      overlayEl = null;
    });
    overlayEl.addEventListener('click', (e) => {
      if (e.target === overlayEl) {
        localStorage.setItem(STORAGE_KEY, '1');
        overlayEl.remove();
        overlayEl = null;
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && running) {
      e.preventDefault();
      cancel();
    }
  });

  return { start: runTour, cancel, showWelcomeIfNeeded };
}
