import * as THREE from 'three';
import { t, getBundle } from '../i18n/i18n.js';
import { theoryNameById } from './master-controls.js';

const STORAGE_KEY = 'cosmos-tour-seen';
const TOUR_THEORIES = ['hawking_islands', 'er_epr_bridge', 'fuzzball'];

function lerp(a, b, val) {
  return a + (b - a) * val;
}

function easeInOut(val) {
  return val < 0.5 ? 2 * val * val : 1 - (-2 * val + 2) ** 2 / 2;
}

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException(t('tour.cancelled'), 'AbortError'));
    const id = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(id);
      reject(new DOMException(t('tour.cancelled'), 'AbortError'));
    }, { once: true });
  });
}

function animateCamera(camera, controls, from, to, target, durationMs, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException(t('tour.cancelled'), 'AbortError'));
    const start = performance.now();
    const startTarget = controls.target.clone();

    function frame(now) {
      if (signal?.aborted) return reject(new DOMException(t('tour.cancelled'), 'AbortError'));
      const val = Math.min(1, (now - start) / durationMs);
      const e = easeInOut(val);
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
      if (val < 1) requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  });
}

export function createCosmicTour(ctx) {
  let running = false;
  let abortController = null;
  let bannerEl = null;

  function ensureBanner() {
    if (bannerEl) return bannerEl;
    bannerEl = document.createElement('div');
    bannerEl.id = 'tour-banner';
    bannerEl.innerHTML = `<span id="tour-banner-text"></span><button type="button" id="tour-cancel">${t('tour.cancel')}</button>`;
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

      setBanner(t('tour.step1'));
      ctx.cameraLife?.resetCamera?.(camera, controls);
      await wait(4000, signal);

      setBanner(t('tour.step2'));
      const from = camera.position.clone();
      const to = new THREE.Vector3(rs * 1.2, rs * 0.4, rs * 1.1);
      await animateCamera(camera, controls, from, to, new THREE.Vector3(0, 0, 0), 12000, signal);
      await wait(2000, signal);

      setBanner(t('tour.step3'));
      for (const id of TOUR_THEORIES) {
        switchTheory(id);
        setBanner(t('tour.step3Theory', { theory: theoryNameById(id) }));
        await wait(6000, signal);
      }

      setBanner(t('tour.step4'));
      highlightPanel('lab-panel', true);
      await wait(8000, signal);
      highlightPanel('lab-panel', false);

      setBanner(t('tour.step5'));
      highlightPanel('life-panel', true);
      if (ctx.lifeEngine) {
        ctx.lifeEngine.enabled = true;
        ctx.lifeEngine.events.unshift({
          text: t('tour.lifeEvent'),
          time: ctx.lifeEngine.age,
        });
        ctx.guiSync?.();
      }
      await wait(8000, signal);
      highlightPanel('life-panel', false);

      setBanner(t('tour.done'));
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

    const overlayEl = document.createElement('div');
    overlayEl.id = 'tour-welcome';
    const steps = getBundle('tour.welcomeSteps') ?? [];
    overlayEl.innerHTML = `
      <div class="tour-welcome-card">
        <h2>${t('tour.welcomeTitle')}</h2>
        <p>${t('tour.welcomeDesc')}</p>
        <ol>${steps.map((s) => `<li>${s}</li>`).join('')}</ol>
        <div class="tour-welcome-actions">
          <button type="button" id="tour-welcome-start">${t('tour.start')}</button>
          <button type="button" id="tour-welcome-skip">${t('tour.skip')}</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlayEl);

    overlayEl.querySelector('#tour-welcome-start').addEventListener('click', () => {
      overlayEl.remove();
      runTour();
    });
    overlayEl.querySelector('#tour-welcome-skip').addEventListener('click', () => {
      localStorage.setItem(STORAGE_KEY, '1');
      overlayEl.remove();
    });
    overlayEl.addEventListener('click', (e) => {
      if (e.target === overlayEl) {
        localStorage.setItem(STORAGE_KEY, '1');
        overlayEl.remove();
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
