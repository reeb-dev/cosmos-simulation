import * as THREE from 'three';
import { t } from '../i18n/i18n.js';
import { showToast } from '../ui/toast.js';

/**
 * Modos de simulación: controlan escena, cámara y HUD.
 */
export const SIMULATION_MODES = {
  black_hole: {
    id: 'black_hole',
    name: 'Agujero negro',
    subtitle: 'Motor híbrido Schwarzschild + Friedmann · Teorías del horizonte',
    camera: { x: 1.5, y: 11, z: 118, tx: 0, ty: 0, tz: 0 },
    maxDistance: 400,
    minDistanceFactor: 0.35,
    fogDensity: 0.0008,
    scene: {
      exterior: true,
      horizon: true,
      interior: true,
      multiverse: false,
      higgs: false,
      bhScale: 1,
      bhOpacity: 1,
    },
  },
  multiverse: {
    id: 'multiverse',
    name: 'Multiverso',
    subtitle: 'Burbujas Friedmann · aceleración Λ · ramas Ωₘ/ΩΛ · portal',
    camera: { x: 0, y: 25, z: 85, tx: 0, ty: 5, tz: 0 },
    maxDistance: 250,
    minDistanceFactor: 0.2,
    fogDensity: 0.0004,
    autoTheory: 'omega_multiverse',
    scene: {
      exterior: false,
      horizon: false,
      interior: false,
      multiverse: true,
      higgs: false,
      bhScale: 0,
      bhOpacity: 0,
    },
  },
  higgs: {
    id: 'higgs',
    name: 'Partícula de Dios (Higgs)',
    subtitle: 'Campo escalar · acoplamiento de masa · estética LHC abstracta',
    camera: { x: 0, y: 12, z: 45, tx: 0, ty: 0, tz: 0 },
    maxDistance: 120,
    minDistanceFactor: 0.15,
    fogDensity: 0.0012,
    scene: {
      exterior: false,
      horizon: false,
      interior: false,
      multiverse: false,
      higgs: true,
      bhScale: 0,
      bhOpacity: 0,
    },
  },
  cosmology: {
    id: 'cosmology',
    name: 'Cosmología ΛCDM',
    subtitle: 'Campo galáctico · redshift · Hubble flow · CMB · BH mínimo',
    camera: { x: 0, y: 80, z: 200, tx: 0, ty: 0, tz: 0 },
    maxDistance: 600,
    minDistanceFactor: 0.5,
    fogDensity: 0.0003,
    scene: {
      exterior: true,
      horizon: true,
      interior: false,
      multiverse: false,
      higgs: false,
      bhScale: 0.35,
      bhOpacity: 0.25,
    },
  },
  theory_picker: {
    id: 'theory_picker',
    name: 'Teoría del horizonte',
    subtitle: 'Elige una teoría destacada · zoom al horizonte',
    camera: { x: 0, y: 8, z: 55, tx: 0, ty: 0, tz: 0 },
    maxDistance: 200,
    minDistanceFactor: 0.35,
    fogDensity: 0.0006,
    scene: {
      exterior: true,
      horizon: true,
      interior: true,
      multiverse: false,
      higgs: false,
      string: false,
      bhScale: 1,
      bhOpacity: 1,
    },
  },
  string_theory: {
    id: 'string_theory',
    name: 'Teoría de cuerdas',
    subtitle: 'Cuerdas vibrantes · branas colisionando · vuelo a lo largo de una cuerda',
    camera: { x: 0, y: 15, z: 80, tx: 0, ty: 0, tz: 0 },
    maxDistance: 300,
    minDistanceFactor: 0.2,
    fogDensity: 0.0005,
    autoTheory: 'string_theory',
    scene: {
      exterior: false,
      horizon: false,
      interior: false,
      multiverse: false,
      higgs: false,
      string: true,
      bhScale: 0,
      bhOpacity: 0,
    },
  },
  binary_merger: {
    id: 'binary_merger',
    name: 'Choque de agujeros negros',
    subtitle: 'Inspiral · fusión · ringdown · evaporación Hawking',
    camera: { x: 0, y: 55, z: 140, tx: 0, ty: 0, tz: 0 },
    maxDistance: 450,
    minDistanceFactor: 0.15,
    fogDensity: 0.0005,
    scene: {
      exterior: true,
      horizon: false,
      interior: false,
      multiverse: false,
      higgs: false,
      binary: true,
      bhScale: 0,
      bhOpacity: 0,
    },
  },
  deep_field: {
    id: 'deep_field',
    name: 'Universo a escala',
    subtitle: 'Campo profundo · estrellas con difracción · galaxias lejanas · vacío cósmico',
    camera: { x: 35, y: 90, z: 480, tx: 8, ty: 0, tz: -12 },
    maxDistance: 2800,
    minDistanceFactor: 0.01,
    fogDensity: 0,
    scene: {
      exterior: false,
      horizon: false,
      interior: false,
      multiverse: false,
      higgs: false,
      string: false,
      binary: false,
      deepField: true,
      bhScale: 0.015,
      bhOpacity: 0.12,
    },
  },
};

export const MODE_IDS = Object.keys(SIMULATION_MODES);
export const DEFAULT_MODE = 'black_hole';

/** Teorías destacadas para el selector rápido */
export const FEATURED_THEORIES = [
  { id: 'singularity', label: 'Singularidad' },
  { id: 'dark_matter', label: 'Materia oscura' },
  { id: 'dark_energy', label: 'Energía oscura' },
  { id: 'lqg_bounce', label: 'Rebote LQG' },
  { id: 'cosmic_inflation', label: 'Inflación' },
  { id: 'er_epr_bridge', label: 'ER=EPR' },
  { id: 'omega_multiverse', label: 'Multiverso Ω' },
  { id: 'fuzzball', label: 'Fuzzball' },
];

/** Teorías de ruptura física (ficción ★★ que violan leyes conocidas a propósito). */
export const PHYSICS_BREAK_THEORIES = [
  { id: 'time_loop', label: 'Cerradura temporal' },
  { id: 'gravity_off', label: 'Gravedad off' },
  { id: 'negative_mass', label: 'Masa negativa' },
  { id: 'causality_shatter', label: 'Causa-efecto roto' },
  { id: 'infinite_density_bounce', label: 'Rebote ρ=∞' },
  { id: 'chronology_horizon', label: 'Horizonte temporal' },
  { id: 'antigravity_core', label: 'Núcleo antigrav.' },
  { id: 'paradox_engine', label: 'Máq. paradojas' },
];

export function getModeName(id) {
  return t(`modes.${id}.name`) !== `modes.${id}.name` ? t(`modes.${id}.name`) : SIMULATION_MODES[id]?.name ?? id;
}

export function getModeSubtitle(id) {
  return t(`modes.${id}.subtitle`) !== `modes.${id}.subtitle` ? t(`modes.${id}.subtitle`) : SIMULATION_MODES[id]?.subtitle ?? '';
}

export function getMode(id) {
  const base = SIMULATION_MODES[id] ?? SIMULATION_MODES[DEFAULT_MODE];
  return {
    ...base,
    name: getModeName(base.id),
    subtitle: getModeSubtitle(base.id),
  };
}

export function applyCameraForMode(camera, controls, mode) {
  const c = mode.camera;
  camera.position.set(c.x, c.y, c.z);
  controls.target.set(c.tx, c.ty, c.tz);
  controls.update();
}

/**
 * Gestiona cambios de modo: escena, cámara, HUD.
 */
export class SimulationModeManager {
  constructor(ctx) {
    this.ctx = ctx;
    this.currentMode = DEFAULT_MODE;
  }

  setMode(id) {
    const mode = getMode(id);
    const prevMode = this.currentMode;
    this.currentMode = mode.id;
    const {
      camera, controls, exteriorGroup, horizonMembrane, interior,
      multiverseWorld, higgsScene, stringScene, binaryScene, deepField, gwWaves, bh, scene, setMinDistance,
      horizonSim, onTheoryChange,
    } = this.ctx;

    applyCameraForMode(camera, controls, mode);
    controls.maxDistance = mode.maxDistance;
    setMinDistance?.(this.ctx.universe.rsVis * mode.minDistanceFactor);

    if (scene.fog) scene.fog.density = mode.fogDensity;

    const s = mode.scene;
    exteriorGroup.visible = s.exterior;
    horizonMembrane.visible = s.horizon;
    interior.group.visible = s.interior;
    multiverseWorld.group.visible = s.multiverse;
    higgsScene.group.visible = s.higgs;
    stringScene?.group && (stringScene.group.visible = !!s.string);
    binaryScene?.group && (binaryScene.group.visible = !!s.binary);
    deepField?.group && (deepField.group.visible = !!s.deepField);
    gwWaves?.group && (gwWaves.group.visible = !!s.binary);

    if (s.deepField) {
      deepField?.showScaleBar?.(true);
      deepField?.reset?.(camera);
      if (scene.fog) scene.fog.density = 0;
      scene.background = new THREE.Color(0x000000);
      camera.far = 5000;
      camera.updateProjectionMatrix();
    } else {
      deepField?.showScaleBar?.(false);
      if (scene.fog) scene.fog.density = mode.fogDensity;
      scene.background = new THREE.Color(0x020210);
      camera.far = 2000;
      camera.updateProjectionMatrix();
    }

    if (s.binary) {
      this.ctx.binarySim?.reset?.();
      this.ctx.binarySim?.startCollision?.();
      binaryScene?.reset?.();
      gwWaves?.reset?.();
    }

    bh.group.scale.setScalar(s.bhScale || 0.001);
    bh.group.traverse((obj) => {
      if (obj.material?.opacity !== undefined) {
        obj.material.opacity = (obj.userData.baseOpacity ?? obj.material.opacity) * (s.bhOpacity ?? 1);
      }
    });

    if (mode.autoTheory) {
      horizonSim.setTheory(mode.autoTheory);
      onTheoryChange?.(mode.autoTheory);
    }

    if (s.multiverse) {
      multiverseWorld.updateCosmology(this.ctx.universe.cosmology);
    }

    this.ctx.cameraLife?.resetIdle?.();
    this.updateHudLabel(mode);
    this.ctx.guiSync?.();
    this.ctx.adaptGuiToMode?.(mode.id);
    this.ctx.modeExplainer?.showMode?.(mode.id, this.ctx.horizonSim?.theoryId);
    this.ctx.modePicker?.refresh?.(mode.id);
    if (prevMode !== mode.id) {
      showToast(t('toast.modeChanged', { mode: mode.name }));
    }
  }

  zoomToHorizon() {
    const { camera, controls } = this.ctx;
    camera.position.set(0, 4, 46);
    controls.target.set(0, 0, 0);
    controls.update();
    this.ctx.cameraLife?.resetIdle?.();
    if (this.currentMode !== 'theory_picker' && this.currentMode !== 'black_hole') {
      this.setMode('theory_picker');
    }
  }

  updateHudLabel(mode = getMode(this.currentMode)) {
    const m = mode?.id ? mode : getMode(this.currentMode);
    const tagline = document.querySelector('#hud .hud-tagline');
    if (tagline) tagline.textContent = m.subtitle;
    const modeLabel = document.getElementById('mode-bar-label');
    if (modeLabel) modeLabel.textContent = m.name;
    const modeBadge = document.getElementById('hud-mode-badge');
    if (modeBadge) modeBadge.textContent = m.name;
  }

  applySceneVisibility(cameraImmersion, interiorOpacity = 0, cameraOnlyImmersion = cameraImmersion) {
    const mode = getMode(this.currentMode);
    const s = mode.scene;
    if (s.multiverse || s.higgs || s.binary || s.string || s.deepField) return;

    // Exterior: solo ocultar si la cámara cruza el horizonte, no si solo la sonda está dentro
    this.ctx.exteriorGroup.visible = s.exterior && cameraOnlyImmersion < 0.95;
    if (!s.interior) {
      this.ctx.interior.group.visible = false;
    } else if (interiorOpacity > 0.01 && cameraOnlyImmersion < 0.05) {
      this.ctx.interior.group.visible = true;
    }
  }
}
