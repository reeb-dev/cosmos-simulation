import * as THREE from 'three';
import { SimulationEngine } from './simulation/engine.js';
import { HorizonSimulator } from './simulation/horizon-simulator.js';
import { LifeEngine } from './simulation/life-engine.js';
import { TheoryLab } from './lab/theory-lab.js';
import { ResetManager } from './simulation/reset-manager.js';
import { loadCustomFormulas } from './lab/custom-formula.js';
import { createBlackHole } from './rendering/blackHole.js';
import {
  createHorizonMembrane,
  createInteriorWorlds,
  createProbe,
  applyMembraneVisual,
} from './rendering/interior-worlds.js';
import { createHorizonTransition } from './rendering/horizon-transition.js';
import { getHorizonVisual, THEORY_IDS, PROBE_STATE } from './simulation/horizon-theories.js';
import { createLensingPass } from './rendering/lensing-pass.js';
import { createParticleSystem } from './rendering/particles.js';
import { createScene } from './rendering/scene.js';
import { createLivingStarfield, createCosmicGrid } from './rendering/living-starfield.js';
import { createMasterGui } from './ui/master-controls.js';
import { updateTheoryPanel } from './ui/horizon-panel.js';
import { updateHud } from './ui/horizon-panel.js';
import { createCameraLife, updateLifePanel } from './ui/life-panel.js';
import { updateLabPanel, updateExperimentModal, showResetToast } from './ui/lab-panel.js';
import { createGuidePanel } from './ui/guide-panel.js';
import { createCosmicTour } from './ui/cosmic-tour.js';

const container = document.getElementById('app');
const engine = new SimulationEngine();
const horizonSim = new HorizonSimulator(engine.universe.rsVis);
const lifeEngine = new LifeEngine(engine.universe, horizonSim);
const theoryLab = new TheoryLab(engine.universe, horizonSim, engine);
const customFormulas = loadCustomFormulas();
theoryLab.setCustomFormulas(customFormulas);

const { scene, camera, renderer, controls, setMinDistance } = createScene(container);
setMinDistance(engine.universe.rsVis);

const bh = createBlackHole(engine.universe.rsVis, engine.universe.spin);
const { mesh: horizonMembrane, mat: horizonMat } = createHorizonMembrane(engine.universe.rsVis);
scene.add(horizonMembrane);

const interior = createInteriorWorlds(engine.universe.rsVis);
const horizonTransition = createHorizonTransition(camera);
const probe = createProbe();

function applyTheoryVisual(id) {
  const visual = getHorizonVisual(id);
  const theoryIndex = THEORY_IDS.indexOf(id);
  interior.setTheory(id, visual);
  applyMembraneVisual(horizonMat, visual, theoryIndex);
  const tint = visual.exteriorTint ?? [1, 1, 1];
  bh.diskMat.uniforms.exteriorTint.value.set(tint[0], tint[1], tint[2]);
  probe.setTrailColor(visual.probeTrailColor ?? 0x00ffcc);
  bh.photonSphere.material.color.setHex(visual.membraneColor ?? 0xff6600);
  bh.photonSphere.material.opacity = 0.12 + (theoryIndex % 5) * 0.01;
}

applyTheoryVisual(horizonSim.theoryId);
scene.add(interior.group, probe.mesh, probe.trail);

const starfield = createLivingStarfield(5000, 200);
const grid = createCosmicGrid(200, 20);
const particles = createParticleSystem(30);

const exteriorGroup = new THREE.Group();
exteriorGroup.add(starfield.points, grid.grid, particles.group, bh.group);
scene.add(exteriorGroup);

const lensing = createLensingPass(renderer, scene, camera);
lensing.setSize(container.clientWidth, container.clientHeight);

const cameraLife = createCameraLife(controls, camera);
cameraLife.resetCamera(camera, controls);
const bhWorldPos = new THREE.Vector3(0, 0, 0);

function onRsChange() {
  const rs = engine.universe.rsVis;
  const spin = engine.universe.spin;
  bh.update(rs, spin);
  horizonSim.setRs(rs);
  setMinDistance(rs);
  horizonMembrane.geometry.dispose();
  horizonMembrane.geometry = new THREE.SphereGeometry(rs, 64, 64);
  horizonMat.uniforms.rs.value = rs;
  interior.updateRs(rs, horizonSim.theoryId);
  applyTheoryVisual(horizonSim.theoryId);
  guiHandles?.syncFromUniverse?.();
}

const appCtx = {
  universe: engine.universe,
  horizonSim,
  lifeEngine,
  theoryLab,
  engine,
  probe,
  starfield,
  camera,
  controls,
  cameraLife,
  customFormulas,
  onRsChange,
  onTheoryChange: (id) => applyTheoryVisual(id),
  onExperiment: (id, result) => updateExperimentModal(result),
  onVisualUpdate: onRsChange,
  clearCustomFormulas: () => {
    customFormulas.length = 0;
    theoryLab.setCustomFormulas([]);
  },
};

const resetManager = new ResetManager(appCtx);
appCtx.resetManager = resetManager;

const guiHandles = createMasterGui(appCtx);
const guidePanel = createGuidePanel();
const cosmicTour = createCosmicTour(appCtx);
appCtx.cosmicTour = cosmicTour;
cosmicTour.showWelcomeIfNeeded();

let lastTime = performance.now();
let animTime = 0;
let prevProbeState = PROBE_STATE.IDLE;
let prevCameraInside = false;

function animate(now) {
  requestAnimationFrame(animate);

  const rawDt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  animTime += rawDt;

  const life = lifeEngine.step(rawDt, engine, {
    onMassGrow: () => onRsChange(),
    onTheoryDrift: (id) => {
      applyTheoryVisual(id);
      guiHandles.syncFromUniverse();
    },
    onStarBorn: () => starfield.birthStar(),
    onStarDied: () => starfield.deathStar(),
  });

  if (!engine.universe.paused) {
    engine.step(rawDt);
    horizonSim.step(rawDt);
  }
  horizonSim.updateCamera(camera.position, bhWorldPos);
  cameraLife.update(rawDt, life.vitality);
  theoryLab.step();

  const scaleFactor = engine.getScaleFactor();
  starfield.update(scaleFactor, rawDt, life.vitality);
  grid.update(scaleFactor, life.pulse);

  const interiorOpacity = horizonSim.interiorOpacity;
  const cameraImmersion = horizonSim.cameraCrossingProgress;

  if (
    horizonSim.probeState === PROBE_STATE.CROSSING &&
    prevProbeState === PROBE_STATE.APPROACHING
  ) {
    const visual = getHorizonVisual(horizonSim.theoryId);
    horizonTransition.flash(visual.crossingFlash, visual.membraneColor);
  }
  if (horizonSim.cameraInside && !prevCameraInside) {
    const visual = getHorizonVisual(horizonSim.theoryId);
    horizonTransition.flash(visual.crossingFlash, visual.membraneColor);
  }
  prevProbeState = horizonSim.probeState;
  prevCameraInside = horizonSim.cameraInside;

  interior.setOpacity(interiorOpacity);
  interior.animate(animTime);
  horizonTransition.update(rawDt, animTime);

  // Ocultar el exterior solo cuando la cámara cruza el horizonte (no cuando solo la sonda cruza)
  exteriorGroup.visible = cameraImmersion < 0.95;
  const extDim = 1 - Math.min(1, cameraImmersion * 1.1);
  starfield.points.material.opacity = 0.3 + extDim * 0.6;
  grid.grid.visible = cameraImmersion < 0.85;
  horizonMembrane.material.opacity = 0.3 + (1 - Math.min(1, interiorOpacity * 1.5)) * 0.5;

  bh.diskMat.uniforms.time.value = animTime * (1 + life.pulse * 0.1);
  if (bh.diskMat.uniforms.spin) bh.diskMat.uniforms.spin.value = engine.universe.spin;
  horizonMat.uniforms.time.value = animTime;
  const visual = getHorizonVisual(horizonSim.theoryId);
  const theoryRipple = (visual.membraneRipple ?? 1) * 0.15;
  horizonMat.uniforms.ripple.value =
    horizonSim.horizonRipple + theoryRipple + life.pulse * 0.08;

  probe.update(horizonSim.getProbePosition(), horizonSim.probeState !== 'idle');
  particles.update(engine.universe.showGeodesics ? engine.getParticleStates() : []);

  updateHud(engine.universe.getReadouts());
  updateTheoryPanel(horizonSim, { universe: engine.universe, horizonSim, engine });
  updateLifePanel(lifeEngine);
  updateLabPanel(theoryLab);

  controls.update();
  lensing.update(camera, bhWorldPos, engine.universe.showLensing && cameraImmersion < 0.8, engine.universe.rsVis, engine.universe.spin);
  lensing.render();
}

animate(performance.now());

window.addEventListener('resize', () => lensing.setSize(container.clientWidth, container.clientHeight));

window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.key === 'r' || e.key === 'R') {
    resetManager.fullReset();
    showResetToast('⏮ Universo reiniciado (tecla R)');
  }
  if (e.key === ' ') {
    e.preventDefault();
    engine.universe.paused = !engine.universe.paused;
    guiHandles.syncFromUniverse();
  }
  if (e.key === '?') {
    guidePanel?.toggle();
  }
});
