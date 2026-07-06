import { t } from '../i18n/i18n.js';

/** Fases del choque de galaxias */
export const GALAXY_PHASE = {
  IDLE: 'idle',
  APPROACH: 'approach',
  FIRST_PASS: 'first_pass',
  TIDAL: 'tidal',
  MERGER: 'merger',
  RELAXATION: 'relaxation',
  DONE: 'done',
};

const PHASE_EVENTS = {
  [GALAXY_PHASE.APPROACH]: 'galaxy.events.approach',
  [GALAXY_PHASE.FIRST_PASS]: 'galaxy.events.firstPass',
  [GALAXY_PHASE.TIDAL]: 'galaxy.events.tidal',
  [GALAXY_PHASE.MERGER]: 'galaxy.events.merger',
  [GALAXY_PHASE.RELAXATION]: 'galaxy.events.relaxation',
  [GALAXY_PHASE.DONE]: 'galaxy.events.done',
};

export function getGalaxyPhaseLabel(phase) {
  const key = `galaxy.phases.${phase}`;
  return t(key) !== key ? t(key) : phase;
}

/**
 * Simulación heurística de colisión galáctica (tipo Antennae / Milky Way-Andromeda).
 * Dos cuerpos extendidos con marea, fricción dinámica y colas tidales.
 */
export class GalaxyCollisionSim {
  constructor() {
    this.reset();
  }

  reset() {
    this.m1 = 1.0;
    this.m2 = 0.8;
    this.type1 = 'spiral';
    this.type2 = 'spiral';
    this.impactParam = 0.35;
    this.relativeSpeed = 280;
    this.timeScale = 1;
    this.phase = GALAXY_PHASE.IDLE;
    this.separation = 220;
    this.relativeAngle = 0;
    this.tidalStrength = 0;
    this.mergerProgress = 0;
    this.tailStrength = 0;
    this.starburst = 0;
    this.disruptedFraction = 0;
    this.elapsedTime = 0;
    this.events = [];
    this._phaseLogged = new Set();
    this._started = false;
    this.realismMode = 'realistic';
    this.g1Pos = { x: -110, y: 0, z: 0 };
    this.g2Pos = { x: 110, y: 0, z: 0 };
    this.g1Vel = { x: 40, y: 0, z: 0 };
    this.g2Vel = { x: -40, y: 0, z: 0 };
    this.remnantPos = { x: 0, y: 0, z: 0 };
    this.remnantScale = 1;
  }

  configure({
    m1, m2, type1, type2, impactParam, relativeSpeed, timeScale, realismMode,
  } = {}) {
    if (m1 != null) this.m1 = m1;
    if (m2 != null) this.m2 = m2;
    if (type1 != null) this.type1 = type1;
    if (type2 != null) this.type2 = type2;
    if (impactParam != null) this.impactParam = impactParam;
    if (relativeSpeed != null) this.relativeSpeed = relativeSpeed;
    if (timeScale != null) this.timeScale = timeScale;
    if (realismMode != null) this.realismMode = realismMode;
  }

  startCollision(force = false) {
    if (!force && this.phase !== GALAXY_PHASE.IDLE && this.phase !== GALAXY_PHASE.DONE) return;
    this.phase = GALAXY_PHASE.APPROACH;
    this._started = true;
    this._phaseLogged.clear();
    this.separation = 220;
    this.tidalStrength = 0;
    this.mergerProgress = 0;
    this.tailStrength = 0;
    this.starburst = 0;
    this.disruptedFraction = 0;
    this.elapsedTime = 0;
    this.g1Pos = { x: -110, y: 0, z: this.impactParam * 40 };
    this.g2Pos = { x: 110, y: 0, z: -this.impactParam * 40 };
    const v = this.relativeSpeed * 0.15;
    this.g1Vel = { x: v * 0.6, y: 0, z: 0 };
    this.g2Vel = { x: -v * 0.6, y: 0, z: 0 };
    this.relativeAngle = 0;
    this.logPhase(GALAXY_PHASE.APPROACH);
  }

  logPhase(phase) {
    if (this._phaseLogged.has(phase)) return;
    this._phaseLogged.add(phase);
    const text = PHASE_EVENTS[phase];
    if (text) {
      this.events.unshift({ text: t(text), time: performance.now() });
      if (this.events.length > 8) this.events.pop();
    }
  }

  get totalMass() {
    return this.m1 + this.m2;
  }

  get tidalRadius() {
    const ratio = this.m2 / Math.max(this.m1, 0.01);
    return this.separation * Math.pow(ratio, 1 / 3) * 0.45;
  }

  step(dt) {
    const t = dt * (this.timeScale || 1) * 0.35;
    if (!this._started || this.phase === GALAXY_PHASE.IDLE || this.phase === GALAXY_PHASE.DONE) return;

    this.elapsedTime += t;
    this.relativeAngle += t * 0.4;

    if (this.phase === GALAXY_PHASE.APPROACH) {
      this.g1Pos.x += this.g1Vel.x * t;
      this.g2Pos.x += this.g2Vel.x * t;
      this.separation = Math.hypot(
        this.g2Pos.x - this.g1Pos.x,
        this.g2Pos.z - this.g1Pos.z,
      );
      if (this.separation < 90) {
        this.phase = GALAXY_PHASE.FIRST_PASS;
        this.logPhase(GALAXY_PHASE.FIRST_PASS);
      }
    } else if (this.phase === GALAXY_PHASE.FIRST_PASS) {
      this.g1Pos.x += this.g1Vel.x * t * 0.7;
      this.g2Pos.x += this.g2Vel.x * t * 0.7;
      this.g1Pos.z += Math.sin(this.relativeAngle) * t * 8 * this.impactParam;
      this.g2Pos.z -= Math.sin(this.relativeAngle) * t * 8 * this.impactParam;
      this.separation = Math.hypot(this.g2Pos.x - this.g1Pos.x, this.g2Pos.z - this.g1Pos.z);
      this.tidalStrength = Math.min(0.5, (90 - this.separation) / 90 * 0.5);
      if (this.separation < 55 || this.elapsedTime > 12) {
        this.phase = GALAXY_PHASE.TIDAL;
        this.logPhase(GALAXY_PHASE.TIDAL);
      }
    } else if (this.phase === GALAXY_PHASE.TIDAL) {
      this.tidalStrength = Math.min(1, this.tidalStrength + t * 0.35);
      this.tailStrength = Math.min(1, this.tailStrength + t * 0.4);
      this.disruptedFraction = Math.min(0.45, this.disruptedFraction + t * 0.08);
      this.starburst = Math.min(1, this.starburst + t * 0.5);
      this.g1Pos.x += (this.g2Pos.x - this.g1Pos.x) * t * 0.02;
      this.g2Pos.x += (this.g1Pos.x - this.g2Pos.x) * t * 0.02;
      this.separation = Math.max(12, this.separation - t * 6);
      if (this.tidalStrength >= 0.85 || this.separation < 25) {
        this.phase = GALAXY_PHASE.MERGER;
        this.logPhase(GALAXY_PHASE.MERGER);
      }
    } else if (this.phase === GALAXY_PHASE.MERGER) {
      this.mergerProgress = Math.min(1, this.mergerProgress + t * 0.25);
      this.tidalStrength = 1 - this.mergerProgress * 0.5;
      this.starburst = Math.min(1, 0.6 + this.mergerProgress * 0.4);
      const lerp = this.mergerProgress;
      this.remnantPos.x = this.g1Pos.x * (1 - lerp) + this.g2Pos.x * lerp;
      this.remnantPos.z = this.g1Pos.z * (1 - lerp) + this.g2Pos.z * lerp;
      this.g1Pos.x += (this.remnantPos.x - this.g1Pos.x) * t * 2;
      this.g2Pos.x += (this.remnantPos.x - this.g2Pos.x) * t * 2;
      this.g1Pos.z += (this.remnantPos.z - this.g1Pos.z) * t * 2;
      this.g2Pos.z += (this.remnantPos.z - this.g2Pos.z) * t * 2;
      this.remnantScale = 1 + this.mergerProgress * 0.6;
      if (this.mergerProgress >= 1) {
        this.phase = GALAXY_PHASE.RELAXATION;
        this.logPhase(GALAXY_PHASE.RELAXATION);
      }
    } else if (this.phase === GALAXY_PHASE.RELAXATION) {
      this.mergerProgress = 1;
      this.tailStrength = Math.max(0.3, this.tailStrength - t * 0.05);
      this.starburst = Math.max(0.2, this.starburst - t * 0.08);
      this.disruptedFraction = Math.min(0.55, this.disruptedFraction + t * 0.02);
      if (this.elapsedTime > 28) {
        this.phase = GALAXY_PHASE.DONE;
        this.logPhase(GALAXY_PHASE.DONE);
      }
    }
  }

  getState() {
    const showPair = [
      GALAXY_PHASE.APPROACH,
      GALAXY_PHASE.FIRST_PASS,
      GALAXY_PHASE.TIDAL,
      GALAXY_PHASE.MERGER,
    ].includes(this.phase);
    const showRemnant = [
      GALAXY_PHASE.MERGER,
      GALAXY_PHASE.RELAXATION,
      GALAXY_PHASE.DONE,
    ].includes(this.phase) && this.mergerProgress > 0.4;

    return {
      phase: this.phase,
      showPair,
      showRemnant,
      m1: this.m1,
      m2: this.m2,
      type1: this.type1,
      type2: this.type2,
      g1Pos: { ...this.g1Pos },
      g2Pos: { ...this.g2Pos },
      g1Rot: this.relativeAngle * 0.3,
      g2Rot: -this.relativeAngle * 0.25 + Math.PI,
      remnantPos: { ...this.remnantPos },
      remnantScale: this.remnantScale,
      mergerProgress: this.mergerProgress,
      separation: this.separation,
      tidalStrength: this.tidalStrength,
      tailStrength: this.tailStrength,
      starburst: this.starburst,
      disruptedFraction: this.disruptedFraction,
      impactParam: this.impactParam,
      events: this.events,
    };
  }

  getReadouts() {
    return {
      phase: getGalaxyPhaseLabel(this.phase),
      separation: this.separation,
      m1: this.m1,
      m2: this.m2,
      tidalRadius: this.tidalRadius,
      tidalPct: this.tidalStrength * 100,
      tailPct: this.tailStrength * 100,
      starburstPct: this.starburst * 100,
      disruptedPct: this.disruptedFraction * 100,
      mergerPct: this.mergerProgress * 100,
    };
  }

  getCameraFrame() {
    const span = Math.max(this.separation, 80) + 60;
    return { tx: 0, ty: 0, tz: 0, dist: span * 1.4, height: span * 0.55 };
  }
}
