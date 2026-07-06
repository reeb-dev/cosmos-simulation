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
import { createLivingStarfield, createCosmicGrid, createCMBBackground } from './rendering/living-starfield.js';
import { createGalaxyField } from './rendering/galaxy-field.js';
import { createMasterGui } from './ui/master-controls.js';
import { updateHud, updateTheoryPanel, updateModePanel } from './ui/horizon-panel.js';
import { createCameraLife, updateLifePanel } from './ui/life-panel.js';
import { updateLabPanel, updateExperimentModal, showResetToast } from './ui/lab-panel.js';
import { createGuidePanel } from './ui/guide-panel.js';
import { createModeExplainer } from './ui/mode-explainer.js';
import { createCosmicTour } from './ui/cosmic-tour.js';
import { createMultiverseWorld } from './rendering/multiverse-world.js';
import { createHiggsScene } from './rendering/higgs-scene.js';
import { createStringScene } from './rendering/string-scene.js';
import { createBinaryBlackHolesScene } from './rendering/binary-black-holes.js';
import { createGravitationalWaves } from './rendering/gravitational-waves.js';
import { BinaryBlackHoleSim } from './simulation/binary-black-holes.js';
import { SimulationModeManager } from './simulation/simulation-modes.js';
import { initPanelCollapse } from './ui/panel-collapse.js';
import { SimulationSeed, parseUrlState, applyUrlState, collectUrlState, syncUrlState } from './research/simulation-seed.js';
import { DataLogger } from './research/data-logger.js';
import { createCosmosApi } from './research/cosmos-api.js';
import { updateResearchPanel } from './ui/research-panel.js';
import { createResearchGui } from './ui/research-panel.js';
import { createClassroomMode } from './ui/classroom-mode.js';

const simulationSeed = new SimulationSeed();
const urlStateEarly = parseUrlState();
if (urlStateEarly.seed != null) simulationSeed.setSeed(Number(urlStateEarly.seed));

const container = document.getElementById('app');
const engine = new SimulationEngine();
engine.universe.simulationSeed = simulationSeed;
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
let modeExplainer = null;

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
  modeExplainer?.updateTheory?.(id);
}

applyTheoryVisual(horizonSim.theoryId);
scene.add(interior.group, probe.mesh, probe.trail);

const starfield = createLivingStarfield(5000, 200, { cinematic: false });
const galaxyField = createGalaxyField({ cinematic: false, rng: () => simulationSeed.random() });
const cmbBackground = createCMBBackground(480);
const grid = createCosmicGrid(200, 20);
const particles = createParticleSystem(30);

const exteriorGroup = new THREE.Group();
exteriorGroup.add(cmbBackground.group, galaxyField.group, starfield.group, grid.grid, particles.group, bh.group);
scene.add(exteriorGroup);

const multiverseWorld = createMultiverseWorld(engine.universe.cosmology);
const higgsScene = createHiggsScene();
const stringScene = createStringScene();
const binarySim = new BinaryBlackHoleSim();
const binaryScene = createBinaryBlackHolesScene();
const gwWaves = createGravitationalWaves();
scene.add(multiverseWorld.group, higgsScene.group, stringScene.group, binaryScene.group, gwWaves.group);

// Guardar opacidades base del BH para modos
bh.group.traverse((obj) => {
  if (obj.material?.opacity !== undefined) {
    obj.userData.baseOpacity = obj.material.opacity;
  }
});

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

const dataLogger = new DataLogger();

const appCtx = {
  universe: engine.universe,
  horizonSim,
  lifeEngine,
  theoryLab,
  engine,
  simulationSeed,
  dataLogger,
  probe,
  starfield,
  galaxyField,
  cmbBackground,
  camera,
  controls,
  cameraLife,
  customFormulas,
  scene,
  exteriorGroup,
  horizonMembrane,
  interior,
  multiverseWorld,
  higgsScene,
  stringScene,
  binarySim,
  binaryScene,
  gwWaves,
  bh,
  setMinDistance,
  onRsChange,
  onTheoryChange: (id) => applyTheoryVisual(id),
  onExperiment: (id, result) => updateExperimentModal(result),
  onVisualUpdate: onRsChange,
  clearCustomFormulas: () => {
    customFormulas.length = 0;
    theoryLab.setCustomFormulas([]);
  },
};

const modeManager = new SimulationModeManager(appCtx);
appCtx.modeManager = modeManager;

const resetManager = new ResetManager(appCtx);
appCtx.resetManager = resetManager;

const guiHandles = createMasterGui(appCtx);
const researchFolder = createResearchGui(appCtx, guiHandles.gui);
guiHandles.folders.research = researchFolder;
const classroomMode = createClassroomMode(appCtx);
appCtx.classroomMode = classroomMode;
classroomMode.addGuiControls(guiHandles.gui, guiHandles.controllers, guiHandles.folders);
classroomMode.applyLocksFromUrl();
classroomMode.applyGuiRestrictions(guiHandles.controllers, guiHandles.folders);
const guidePanel = createGuidePanel();
modeExplainer = createModeExplainer();
appCtx.modeExplainer = modeExplainer;
const cosmicTour = createCosmicTour(appCtx);
appCtx.cosmicTour = cosmicTour;
cosmicTour.showWelcomeIfNeeded();

initPanelCollapse('lab-panel', { defaultCollapsed: false });
initPanelCollapse('theory-panel', { defaultCollapsed: false });
initPanelCollapse('research-panel', { defaultCollapsed: true });
modeManager.setMode('black_hole');

// URL state (resto de parámetros tras init completo)
const urlState = urlStateEarly;
applyUrlState(appCtx, urlState);
syncUrlState(collectUrlState(appCtx));

window.CosmosSim = createCosmosApi(appCtx);

let lastTime = performance.now();
let animTime = 0;
let prevProbeState = PROBE_STATE.IDLE;
let prevCameraInside = false;
let binaryCamLerp = 0;

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
  dataLogger.tick(rawDt, appCtx);

  const interiorOpacity = horizonSim.interiorOpacity;
  const cameraImmersion = horizonSim.cameraCrossingProgress;
  const mode = modeManager.currentMode;
  const isAltScene = mode === 'multiverse' || mode === 'higgs' || mode === 'string_theory';
  const isBinary = mode === 'binary_merger';
  const isString = mode === 'string_theory';

  const scaleFactor = engine.getScaleFactor();
  const realism = engine.universe.realismMode ?? 'standard';
  const cosmo = engine.universe.cosmology;

  if (!isBinary) {
    starfield.update(scaleFactor, rawDt, life.vitality, null, realism);
    galaxyField.update(scaleFactor, rawDt, cosmo, realism);
    cmbBackground.update(cosmo.redshift);
    grid.update(scaleFactor, life.pulse);
  }

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

  if (isAltScene || isBinary) {
    if (!isBinary) exteriorGroup.visible = false;
    horizonMembrane.visible = false;
    interior.group.visible = false;
    if (mode === 'multiverse') {
      multiverseWorld.animate(animTime, rawDt);
      multiverseWorld.updateCosmology(engine.universe.cosmology);
    }
    if (mode === 'higgs') higgsScene.animate(animTime, rawDt);
    if (isString) {
      stringScene.animate(animTime, rawDt);
      const frame = stringScene.getCameraFrame(animTime);
      camera.position.x += (frame.x - camera.position.x) * 0.03;
      camera.position.y += (frame.y - camera.position.y) * 0.03;
      camera.position.z += (frame.z - camera.position.z) * 0.03;
      controls.target.set(frame.tx, frame.ty, frame.tz);
    }
    if (isBinary) {
      bh.group.visible = false;
      exteriorGroup.visible = true;
      starfield.points.material.opacity = 0.75;
      grid.grid.visible = true;
      if (!engine.universe.paused) binarySim.step(rawDt);
      binaryScene.update(rawDt, binarySim, animTime);
      gwWaves.update(rawDt, binarySim);
      starfield.update(engine.getScaleFactor(), rawDt, life.vitality, gwWaves.waveDisplacementAt, realism);
      grid.update(engine.getScaleFactor(), life.pulse, gwWaves.waveDisplacementAt);

      binaryCamLerp = Math.min(1, binaryCamLerp + rawDt * 0.8);
      const frame = binarySim.getCameraFrame();
      const targetDist = frame.dist;
      const targetH = frame.height;
      const angle = animTime * 0.12;
      const camX = Math.sin(angle) * targetDist * binaryCamLerp;
      const camZ = Math.cos(angle) * targetDist * binaryCamLerp;
      camera.position.x += (camX - camera.position.x) * 0.04;
      camera.position.y += (targetH - camera.position.y) * 0.04;
      camera.position.z += (camZ - camera.position.z) * 0.04;
      controls.target.set(frame.tx, frame.ty, frame.tz);
    }
  } else {
    bh.group.visible = true;
    binaryCamLerp = 0;
    // Ocultar exterior solo por inmersión de cámara, no cuando solo la sonda cruza
    modeManager.applySceneVisibility(cameraImmersion, horizonSim.interiorOpacity, cameraImmersion);
    const extDim = 1 - Math.min(1, cameraImmersion * 1.1);
    starfield.points.material.opacity = 0.3 + extDim * 0.6;
    galaxyField.group.visible = cameraImmersion < 0.92;
    cmbBackground.group.visible = cameraImmersion < 0.95;
    grid.grid.visible = cameraImmersion < 0.85;
    horizonMembrane.material.opacity = 0.3 + (1 - Math.min(1, interiorOpacity * 1.5)) * 0.5;

    const bhScale = modeManager.currentMode === 'cosmology' ? 0.35 : 1;
    bh.group.scale.setScalar(bhScale);
  }

  bh.diskMat.uniforms.time.value = animTime * (1 + life.pulse * 0.1);
  if (bh.diskMat.uniforms.spin) bh.diskMat.uniforms.spin.value = engine.universe.spin;
  horizonMat.uniforms.time.value = animTime;
  const visual = getHorizonVisual(horizonSim.theoryId);
  const theoryRipple = (visual.membraneRipple ?? 1) * 0.15;
  horizonMat.uniforms.ripple.value =
    horizonSim.horizonRipple + theoryRipple + life.pulse * 0.08;

  probe.update(horizonSim.getProbePosition(), horizonSim.probeState !== 'idle');
  particles.update(engine.universe.showGeodesics ? engine.getParticleStates() : []);

  updateHud(engine.universe.getReadouts(), modeManager, isBinary ? binarySim.getReadouts() : null, simulationSeed.seed);
  updateTheoryPanel(horizonSim, { universe: engine.universe, horizonSim, engine }, modeManager, higgsScene, isBinary ? binarySim : null, isString ? stringScene : null);
  updateModePanel(modeManager);
  updateLifePanel(lifeEngine, isBinary ? binarySim : null, isBinary);
  updateLabPanel(theoryLab);
  updateResearchPanel(appCtx);

  controls.update();
  lensing.update(camera, bhWorldPos, engine.universe.showLensing && cameraImmersion < 0.8 && !isAltScene && !isBinary, engine.universe.rsVis, engine.universe.spin);
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
  if (e.key === 'i' || e.key === 'I') {
    modeExplainer?.toggle?.();
  }
});
