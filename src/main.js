import * as THREE from 'three';
import { initI18n } from './i18n/i18n.js';
import { createLangToggle } from './i18n/lang-toggle.js';
import { applyStaticUi } from './i18n/static-ui.js';
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
import { createDeepField } from './rendering/deep-field.js';
import { createMasterGui } from './ui/master-controls.js';
import { updateHud, updateTheoryPanel, updateModePanel } from './ui/horizon-panel.js';
import { createCameraLife, updateLifePanel } from './ui/life-panel.js';
import { updateLabPanel, updateExperimentModal } from './ui/lab-panel.js';
import { createGuidePanel } from './ui/guide-panel.js';
import { createModeExplainer } from './ui/mode-explainer.js';
import { createCosmicTour } from './ui/cosmic-tour.js';
import { createModePicker } from './ui/mode-picker.js';
import { createUxDock, initHelpBarFade } from './ui/ux-dock.js';
import { initCleanView } from './ui/ui-clean-view.js';
import { showToast } from './ui/toast.js';
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
import { t } from './i18n/i18n.js';
import { getRealismProfile } from './physics/realism-profiles.js';
import { applyGargantuaPreset } from './physics/gargantua-preset.js';

async function bootstrap() {
const simulationSeed = new SimulationSeed();
const urlStateEarly = parseUrlState();
if (urlStateEarly.seed != null) simulationSeed.setSeed(Number(urlStateEarly.seed));

await initI18n(urlStateEarly.lang);
applyStaticUi();

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
  const profile = getRealismProfile(engine.universe.realismMode);
  bh.photonSphere.visible = profile.showPhotonSphere ?? false;
  if (bh.photonSphere.visible) {
    bh.photonSphere.material.wireframe = true;
    bh.photonSphere.material.opacity = 0.12 + (theoryIndex % 5) * 0.01;
  }
  modeExplainer?.updateTheory?.(id);
}

applyTheoryVisual(horizonSim.theoryId);
scene.add(interior.group, probe.mesh, probe.trail);

const observatory = {
  ligoEnabled: true,
  sdssEnabled: true,
  planckCmb: true,
};

const starfield = createLivingStarfield(5000, 200, { cinematic: false });
const galaxyField = createGalaxyField({ cinematic: false, rng: () => simulationSeed.random() });
const deepField = createDeepField({
  cinematic: false,
  sdssEnabled: observatory.sdssEnabled,
  rng: () => simulationSeed.random(),
});
const cmbBackground = createCMBBackground(480, { planckStyle: observatory.planckCmb });
const grid = createCosmicGrid(200, 20);
const particles = createParticleSystem(30);

const exteriorGroup = new THREE.Group();
exteriorGroup.add(cmbBackground.group, galaxyField.group, starfield.group, grid.grid, particles.group, bh.group, deepField.sdssGroup);
scene.add(exteriorGroup, deepField.group);
deepField.group.visible = false;
deepField.sdssGroup.visible = false;

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
  observatory,
  probe,
  starfield,
  galaxyField,
  deepField,
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
  applyGargantuaPreset: () => applyGargantuaPreset(appCtx),
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
appCtx.guidePanel = guidePanel;
modeExplainer = createModeExplainer();
appCtx.modeExplainer = modeExplainer;
const cosmicTour = createCosmicTour(appCtx);
appCtx.cosmicTour = cosmicTour;

createLangToggle(() => {
  guiHandles.refreshGuiI18n?.();
  guidePanel?.refresh?.();
  modeExplainer?.refresh?.();
  modeManager.updateHudLabel();
  appCtx.researchGuiRefresh?.();
  appCtx.uxDock?.refresh?.();
  appCtx.modePicker?.refresh?.();
});

cosmicTour.showWelcomeIfNeeded();

initPanelCollapse('lab-panel', { defaultCollapsed: true, title: t('gui.lab') });
initPanelCollapse('theory-panel', { defaultCollapsed: true, title: t('gui.horizon') });
initPanelCollapse('research-panel', { defaultCollapsed: false, title: t('panels.research.title') });
initPanelCollapse('life-panel', { defaultCollapsed: true, title: t('gui.life') });

const cleanView = initCleanView();
appCtx.cleanView = cleanView;

const hudEl = document.getElementById('hud');
hudEl?.classList.add('hud-expanded');
const hudToggle = document.getElementById('hud-toggle');
if (hudToggle) hudToggle.textContent = '▲';
hudToggle?.addEventListener('click', () => {
  hudEl?.classList.toggle('hud-expanded');
  if (hudToggle) hudToggle.textContent = hudEl?.classList.contains('hud-expanded') ? '▲' : '▼';
});
modeManager.setMode('black_hole');

appCtx.modePicker = createModePicker(appCtx);
appCtx.uxDock = createUxDock(appCtx);
initHelpBarFade(14000);

if (!localStorage.getItem('cosmos-research-hint-seen')) {
  setTimeout(() => {
    showToast(t('panels.research.welcomeHint'));
    try { localStorage.setItem('cosmos-research-hint-seen', '1'); } catch { /* ignore */ }
  }, 2500);
}
setTimeout(() => showToast(t('ux.realisticHint')), 1200);

// URL state (resto de parámetros tras init completo)
const urlState = urlStateEarly;
applyUrlState(appCtx, urlState);
engine.universe.repairCosmology();
if (urlState.H0 == null && urlState.OmegaM == null) {
  theoryLab.applyCosmologyPreset('planck2018');
}
engine.universe.realismMode = engine.universe.realismMode || 'realistic';
engine.universe.showExpansion = true;
engine.universe.showLensing = true;
engine.universe.showGeodesics = engine.universe.showGeodesics !== false;
starfield.setRealism?.(engine.universe.realismMode);
galaxyField.setRealism?.(engine.universe.realismMode);
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
  const isDeepField = mode === 'deep_field';
  const isCosmology = mode === 'cosmology';
  const isString = mode === 'string_theory';

  const scaleFactor = engine.getScaleFactor();
  const realism = engine.universe.realismMode ?? 'realistic';
  const profile = getRealismProfile(realism);
  const cosmo = engine.universe.cosmology;

  scene.fog.density = isBinary || isDeepField
    ? profile.fogDensity
    : mode === 'black_hole'
      ? profile.fogDensity * 0.28
      : profile.fogDensity * 0.6;
  renderer.toneMappingExposure = profile.toneExposure;
  if (bh.diskMat.uniforms.diskIntensity) {
    bh.diskMat.uniforms.diskIntensity.value = profile.diskIntensity;
  }
  if (bh.diskMat.uniforms.thinness) {
    bh.diskMat.uniforms.thinness.value = profile.diskThinness ?? 0.85;
  }
  binarySim.realismMode = realism;
  gwWaves.setRealism?.(realism);
  starfield.setRealism?.(realism);
  galaxyField.setRealism?.(realism);

  if (!isBinary && !isDeepField) {
    starfield.update(scaleFactor, rawDt, life.vitality, null, realism);
    galaxyField.update(scaleFactor, rawDt, cosmo, realism);
    cmbBackground.update(cosmo.redshift);
    grid.update(scaleFactor, life.pulse);
    if (isCosmology && observatory.sdssEnabled) {
      deepField.update(scaleFactor, rawDt, cosmo, camera, realism);
      deepField.sdssGroup.visible = true;
    } else if (!isDeepField) {
      deepField.sdssGroup.visible = false;
    }
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

  if (isAltScene || isBinary || isDeepField) {
    if (!isBinary && !isDeepField) exteriorGroup.visible = false;
    horizonMembrane.visible = false;
    interior.group.visible = false;
    if (isDeepField) {
      exteriorGroup.visible = true;
      starfield.group.visible = false;
      galaxyField.group.visible = false;
      cmbBackground.group.visible = false;
      grid.grid.visible = false;
      particles.group.visible = false;
      bh.group.visible = true;
      bh.group.position.set(12, -4, -18);
      deepField.sdssGroup.visible = observatory.sdssEnabled;
      deepField.update(scaleFactor, rawDt, cosmo, camera, realism);
      deepField.setRealism(realism);
    }
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
    bh.group.position.set(0, 0, 0);
    deepField.group.visible = false;
    deepField.showScaleBar(false);
    binaryCamLerp = 0;
    // Ocultar exterior solo por inmersión de cámara, no cuando solo la sonda cruza
    modeManager.applySceneVisibility(cameraImmersion, horizonSim.interiorOpacity, cameraImmersion);
    const extDim = 1 - Math.min(1, cameraImmersion * 1.1);
    starfield.points.material.opacity = 0.3 + extDim * 0.6;
    galaxyField.group.visible = cameraImmersion < 0.92;
    cmbBackground.group.visible = cameraImmersion < 0.95;
    grid.grid.visible = cameraImmersion < 0.85 && modeManager.currentMode !== 'black_hole';
    const camDist = camera.position.distanceTo(bhWorldPos);
    const rs = engine.universe.rsVis;
    const nearHorizon = Math.min(1, Math.max(0, 1 - (camDist - rs * 6) / (rs * 35)));
    horizonMembrane.material.opacity = nearHorizon * 0.7 + interiorOpacity * 0.35;
    horizonMembrane.visible = nearHorizon > 0.03 || interiorOpacity > 0.08;

    const bhScale = modeManager.currentMode === 'cosmology' ? 0.35 : 1;
    bh.group.scale.setScalar(bhScale);
  }

  bh.diskMat.uniforms.time.value = animTime * (1 + life.pulse * 0.1);
  if (bh.diskMat.uniforms.spin) bh.diskMat.uniforms.spin.value = engine.universe.spin;
  if (bh.lensedHalos) {
    const haloMul = profile.haloStrengthMul ?? 1.0;
    for (const halo of bh.lensedHalos.children) {
      const mat = halo.userData.haloMat;
      if (mat) {
        mat.uniforms.time.value = animTime;
        mat.uniforms.spin.value = engine.universe.spin;
        mat.uniforms.exteriorTint.value.copy(bh.diskMat.uniforms.exteriorTint.value);
        if (mat.uniforms.thinness) mat.uniforms.thinness.value = profile.diskThinness ?? 0.9;
        if (mat.uniforms.haloStrength) {
          mat.uniforms.haloStrength.value = (halo.userData.baseHaloStrength ?? 0.3) * haloMul;
        }
      }
    }
  }
  if (bh.photonRingMat) {
    const ringBase = profile.photonRingOpacity ?? 0.9;
    bh.photonRingMat.opacity = ringBase + Math.sin(animTime * 1.8) * 0.04;
    bh.photonRing.visible = !isAltScene && !isBinary && cameraImmersion < 0.75;
  }
  horizonMat.uniforms.time.value = animTime;
  const visual = getHorizonVisual(horizonSim.theoryId);
  const theoryRipple = (visual.membraneRipple ?? 1) * 0.15;
  horizonMat.uniforms.ripple.value =
    horizonSim.horizonRipple + theoryRipple + life.pulse * 0.08;

  probe.update(horizonSim.getProbePosition(), horizonSim.probeState !== 'idle');
  const particleStates = engine.universe.showGeodesics ? engine.getParticleStates() : [];
  particles.update(particleStates, profile.geodesicOpacity ?? 0.45);

  updateHud(engine.universe.getReadouts(), modeManager, isBinary ? binarySim.getReadouts() : null, simulationSeed.seed, isDeepField ? deepField : null);
  updateTheoryPanel(horizonSim, { universe: engine.universe, horizonSim, engine }, modeManager, higgsScene, isBinary ? binarySim : null, isString ? stringScene : null);
  updateModePanel(modeManager);
  updateLifePanel(lifeEngine, isBinary ? binarySim : null, isBinary);
  updateLabPanel(theoryLab);
  updateResearchPanel(appCtx);

  controls.update();
  lensing.update(camera, bhWorldPos, engine.universe.showLensing && cameraImmersion < 0.8 && !isAltScene && !isBinary && !isDeepField, engine.universe.rsVis, engine.universe.spin, profile.lensStrengthMul);
  lensing.render();
}

animate(performance.now());

window.addEventListener('resize', () => lensing.setSize(container.clientWidth, container.clientHeight));

window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
  if (e.key === 'r' || e.key === 'R') {
    resetManager.fullReset();
    showToast(t('toast.resetKey'));
  }
  if (e.key === ' ') {
    e.preventDefault();
    engine.universe.paused = !engine.universe.paused;
    guiHandles.syncFromUniverse();
    appCtx.uxDock?.refresh?.();
  }
  if (e.key === '?') {
    guidePanel?.toggle();
  }
  if (e.key === 'i' || e.key === 'I') {
    modeExplainer?.toggle?.();
  }
  if (e.key === 'g' || e.key === 'G') {
    appCtx.toggleGui?.();
    appCtx.uxDock?.refresh?.();
  }
  if (e.key === 'v' || e.key === 'V') {
    cleanView.toggle();
    appCtx.uxDock?.refresh?.();
  }
  if (e.key === 'Escape') {
    guidePanel?.close?.();
    modeExplainer?.hide?.();
  }
});
}

bootstrap().catch((err) => console.error('CosmosSim bootstrap failed:', err));
