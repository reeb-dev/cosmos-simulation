import { C, G, M_SUN } from '../physics/constants.js';
import { schwarzschildRadiusVis } from '../physics/units.js';
import { FORMULA_REGISTRY } from '../physics/formula-registry.js';
import { getRealismProfile, qnmFrequencyHz } from '../physics/realism-profiles.js';
import { t } from '../i18n/i18n.js';

/** Fases del choque binario */
export const BINARY_PHASE = {
  IDLE: 'idle',
  INSPIRAL: 'inspiral',
  MERGER: 'merger',
  RINGDOWN: 'ringdown',
  EVAPORATION: 'evaporation',
  DEAD: 'dead',
};

const PHASE_EVENTS = {
  [BINARY_PHASE.INSPIRAL]: 'binary.events.inspiral',
  [BINARY_PHASE.MERGER]: 'binary.events.merger',
  [BINARY_PHASE.RINGDOWN]: 'binary.events.ringdown',
  [BINARY_PHASE.EVAPORATION]: 'binary.events.evaporation',
  [BINARY_PHASE.DEAD]: 'binary.events.dead',
};

export function getBinaryPhaseLabel(phase) {
  return t(`binary.phases.${phase}`) !== `binary.phases.${phase}` ? t(`binary.phases.${phase}`) : phase;
}

function gwEnergyLossRate(m1Kg, m2Kg, separationM) {
  const M = m1Kg + m2Kg;
  const mu = (m1Kg * m2Kg) / M;
  return ((32 / 5) * G ** 4 * mu ** 2 * M ** 3) / (C ** 5 * separationM ** 5);
}

function circularOrbitEnergy(m1Kg, m2Kg, separationM) {
  const M = m1Kg + m2Kg;
  const mu = (m1Kg * m2Kg) / M;
  return -(G * mu * M) / (2 * separationM);
}

function keplerOmega(m1Kg, m2Kg, separationM) {
  const M = m1Kg + m2Kg;
  return Math.sqrt((G * M) / separationM ** 3);
}

function hawkingLifetimeSec(massKg) {
  return FORMULA_REGISTRY.hawking_lifetime.compute({ massKg }).value;
}

/**
 * Simulación simplificada: inspiral (Peters) → fusión → ringdown → muerte Hawking.
 */
export class BinaryBlackHoleSim {
  constructor() {
    this.reset();
  }

  reset() {
    this.m1Solar = 30;
    this.m2Solar = 20;
    this.spin1 = 0.6;
    this.spin2 = 0.4;
    this.separationVis = 80;
    this.hawkingDeath = true;
    this.timeScale = 1;
    this.phase = BINARY_PHASE.IDLE;
    this.orbitalAngle = 0;
    this.mergedMassSolar = 0;
    this.mergedSpin = 0;
    this.ringdownAmplitude = 0;
    this.ringdownTime = 0;
    this.mergerFlash = 0;
    this.memoryPulse = 0;
    this.evapProgress = 0;
    this.evapBurst = 0;
    this.lastStrain = 0;
    this.lastPhysicalStrain = 0;
    this.lastFrequency = 0;
    this.energyRadiated = 0;
    this.elapsedTime = 0;
    this.strainHistory = [];
    this.events = [];
    this._phaseLogged = new Set();
    this._started = false;
    this.realismMode = 'realistic';
  }

  /** Escala visual→metros calibrada por rₛ físico total */
  get visToMeters() {
    const mTot = (this.m1Solar + this.m2Solar) * M_SUN;
    const rsPhys = (2 * G * mTot) / (C * C);
    return rsPhys / Math.max(this.rs1 + this.rs2, 0.1);
  }

  configure({ m1Solar, m2Solar, separationVis, spin1, spin2, hawkingDeath, timeScale, realismMode } = {}) {
    if (m1Solar != null) this.m1Solar = m1Solar;
    if (m2Solar != null) this.m2Solar = m2Solar;
    if (separationVis != null) this.separationVis = separationVis;
    if (spin1 != null) this.spin1 = spin1;
    if (spin2 != null) this.spin2 = spin2;
    if (hawkingDeath != null) this.hawkingDeath = hawkingDeath;
    if (timeScale != null) this.timeScale = timeScale;
    if (realismMode != null) this.realismMode = realismMode;
    if (this.phase === BINARY_PHASE.IDLE) this.orbitalAngle = 0;
  }

  startCollision() {
    if (this.phase !== BINARY_PHASE.IDLE && this.phase !== BINARY_PHASE.DEAD) return;
    this.phase = BINARY_PHASE.INSPIRAL;
    this._started = true;
    this._phaseLogged.clear();
    this.ringdownAmplitude = 0;
    this.mergerFlash = 0;
    this.memoryPulse = 0;
    this.evapProgress = 0;
    this.evapBurst = 0;
    this.mergedMassSolar = 0;
    this.elapsedTime = 0;
    this.strainHistory = [];
    this.logPhase(BINARY_PHASE.INSPIRAL);
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

  get lastStrainPhysical() {
    return this.lastPhysicalStrain;
  }

  get muSolar() {
    return (this.m1Solar * this.m2Solar) / (this.m1Solar + this.m2Solar);
  }

  get rs1() {
    return schwarzschildRadiusVis(this.m1Solar);
  }

  get rs2() {
    return schwarzschildRadiusVis(this.m2Solar);
  }

  get rsMerged() {
    if (this.mergedMassSolar <= 0) return schwarzschildRadiusVis(this.m1Solar + this.m2Solar);
    const shrink = this.phase === BINARY_PHASE.EVAPORATION || this.phase === BINARY_PHASE.DEAD
      ? Math.max(0.02, 1 - this.evapProgress)
      : 1;
    const base = schwarzschildRadiusVis(this.mergedMassSolar);
    const ring = this.phase === BINARY_PHASE.RINGDOWN
      ? 1 + this.ringdownAmplitude * Math.sin(this.ringdownTime * 12)
      : 1;
    return base * shrink * ring;
  }

  get separationM() {
    return this.separationVis * this.visToMeters;
  }

  get barycenter() {
    return { x: 0, y: 0, z: 0 };
  }

  get bhPositions() {
    const total = this.m1Solar + this.m2Solar;
    const r1 = this.separationVis * (this.m2Solar / total);
    const r2 = this.separationVis * (this.m1Solar / total);
    const ca = Math.cos(this.orbitalAngle);
    const sa = Math.sin(this.orbitalAngle);
    return {
      bh1: { x: -r1 * ca, y: 0, z: r1 * sa },
      bh2: { x: r2 * ca, y: 0, z: -r2 * sa },
    };
  }

  get mergerThreshold() {
    return (this.rs1 + this.rs2) * 4.5;
  }

  /** Fase expuesta a ondas GW ('death' incluye evaporación y muerte) */
  get gwPhase() {
    if (this.phase === BINARY_PHASE.EVAPORATION || this.phase === BINARY_PHASE.DEAD) return 'death';
    if (this.phase === BINARY_PHASE.IDLE) return 'inspiral';
    return this.phase;
  }

  /** Strain h ~ (4GM/c²r)(v²/c²) — orden de magnitud inspiral (GW150914-like) */
  _strainFromOrbit(sepM, m1, m2) {
    const h = this._physicalStrainFromOrbit(sepM, m1, m2);
    return Math.min(1, h * 1e21);
  }

  _physicalStrainFromOrbit(sepM, m1, m2) {
    const M = m1 + m2;
    const mu = (m1 * m2) / M;
    const v = Math.sqrt((G * M) / sepM);
    const h0 = (4 * G * mu) / (C * C * sepM);
    return h0 * (v / C) ** 2;
  }

  _recordStrain(dt) {
    this.elapsedTime += dt;
    const entry = { t: this.elapsedTime, h: this.lastPhysicalStrain, phase: this.phase };
    this.strainHistory.push(entry);
    if (this.strainHistory.length > 800) this.strainHistory.shift();
  }

  step(dt) {
    const profile = getRealismProfile(this.realismMode);
    const t = dt * (this.timeScale || 1) * profile.binaryTimeScale;
    if (!this._started || this.phase === BINARY_PHASE.IDLE || this.phase === BINARY_PHASE.DEAD) {
      return;
    }

    const m1 = this.m1Solar * M_SUN;
    const m2 = this.m2Solar * M_SUN;

    if (this.phase === BINARY_PHASE.INSPIRAL) {
      const sepM = this.separationM;
      const dEdt = gwEnergyLossRate(m1, m2, sepM);
      const daDt = (2 * sepM ** 2) / (G * (m1 * m2 / (m1 + m2)) * (m1 + m2)) * (-dEdt);
      const daVis = (daDt / this.visToMeters) * t;

      this.separationVis = Math.max(this.mergerThreshold * 0.98, this.separationVis + daVis);
      const omega = keplerOmega(m1, m2, sepM);
      this.orbitalAngle += omega * t * profile.orbitalFactor;
      this.lastFrequency = (omega / (2 * Math.PI)) * 2;
      this.lastPhysicalStrain = this._physicalStrainFromOrbit(sepM, m1, m2);
      this.lastStrain = Math.min(1, this.lastPhysicalStrain * 1e21);
      this.energyRadiated += dEdt * t;

      if (this.separationVis <= this.mergerThreshold) this._enterMerger();
    } else if (this.phase === BINARY_PHASE.MERGER) {
      this.mergerFlash = Math.min(1, this.mergerFlash + t * 2.5);
      this.memoryPulse = Math.max(0, 1 - this.mergerFlash * 0.7);
      this.lastStrain = Math.min(1, 0.45 + (1 - this.mergerFlash) * 0.55);
      this.lastPhysicalStrain = 1e-21 * (0.4 + (1 - this.mergerFlash) * 0.6);
      this.lastFrequency = 220 + this.mergerFlash * 200;
      if (this.mergerFlash >= 1) {
        this.phase = BINARY_PHASE.RINGDOWN;
        this.ringdownTime = 0;
        this.ringdownAmplitude = 0.35;
        this.logPhase(BINARY_PHASE.RINGDOWN);
      }
    } else if (this.phase === BINARY_PHASE.RINGDOWN) {
      this.ringdownTime += t;
      const tau = 0.12 / Math.max(this.mergedMassSolar, 1);
      this.ringdownAmplitude *= Math.exp(-t / tau);
      const fQnm = qnmFrequencyHz(this.mergedMassSolar, this.mergedSpin);
      this.lastStrain = this.ringdownAmplitude * 0.6;
      this.lastPhysicalStrain = 1e-21 * this.ringdownAmplitude * 0.5;
      this.lastFrequency = fQnm;
      if (this.ringdownTime > 4 || this.ringdownAmplitude < 0.02) {
        this.ringdownAmplitude = 0;
        if (this.hawkingDeath) {
          this.phase = BINARY_PHASE.EVAPORATION;
          this.evapProgress = 0;
          this.logPhase(BINARY_PHASE.EVAPORATION);
        } else {
          this.phase = BINARY_PHASE.IDLE;
          this._started = false;
        }
      }
    } else if (this.phase === BINARY_PHASE.EVAPORATION) {
      const mKg = this.mergedMassSolar * M_SUN;
      const tEvap = hawkingLifetimeSec(mKg);
      const accel = Math.max(1, this.timeScale) * profile.hawkingAccel;
      this.evapProgress = Math.min(1, this.evapProgress + (t / tEvap) * accel);
      this.evapBurst = 0.3 + 0.7 * Math.pow(this.evapProgress, 3);
      this.lastStrain = 0.05 * (1 - this.evapProgress);
      this.lastPhysicalStrain = 1e-22 * (1 - this.evapProgress);
      this.lastFrequency = 35 * (1 - this.evapProgress * 0.7);
      if (this.evapProgress >= 1) {
        this.phase = BINARY_PHASE.DEAD;
        this.evapBurst = 0;
        this.logPhase(BINARY_PHASE.DEAD);
      }
    }
    this._recordStrain(t);
  }

  _enterMerger() {
    const radiated = 0.05 * (this.m1Solar + this.m2Solar);
    this.mergedMassSolar = this.m1Solar + this.m2Solar - radiated;
    this.mergedSpin = Math.min(
      0.998,
      ((this.spin1 * this.m1Solar + this.spin2 * this.m2Solar) / (this.m1Solar + this.m2Solar)) * 0.85
    );
    this.phase = BINARY_PHASE.MERGER;
    this.mergerFlash = 0;
    this.memoryPulse = 1;
    this.energyRadiated += radiated * M_SUN * C * C * 0.05;
    this.logPhase(BINARY_PHASE.MERGER);
  }

  getState() {
    const pos = this.bhPositions;
    const showBinary = this.phase === BINARY_PHASE.IDLE || this.phase === BINARY_PHASE.INSPIRAL;
    const showMerged = [
      BINARY_PHASE.MERGER,
      BINARY_PHASE.RINGDOWN,
      BINARY_PHASE.EVAPORATION,
    ].includes(this.phase);

    return {
      phase: this.phase,
      gwPhase: this.gwPhase,
      showBinary,
      showMerged,
      m1Solar: this.m1Solar,
      m2Solar: this.m2Solar,
      spin1: this.spin1,
      spin2: this.spin2,
      rs1: this.rs1,
      rs2: this.rs2,
      rsMerged: this.rsMerged,
      mergedMassSolar: this.mergedMassSolar,
      mergedSpin: this.mergedSpin,
      separationVis: this.separationVis,
      orbitalAngle: this.orbitalAngle,
      bh1Pos: pos.bh1,
      bh2Pos: pos.bh2,
      barycenter: { x: 0, y: 0, z: 0 },
      mergerFlash: this.mergerFlash,
      ringdownAmplitude: this.ringdownAmplitude,
      memoryPulse: this.memoryPulse,
      lastStrain: this.lastStrain,
      lastFrequency: this.lastFrequency,
      energyRadiated: this.energyRadiated,
      evapProgress: this.evapProgress,
      evapBurst: this.evapBurst,
      hawkingDeath: this.hawkingDeath,
      events: this.events,
    };
  }

  getReadouts() {
    const T = FORMULA_REGISTRY.hawking_temperature.compute({
      massKg: (this.mergedMassSolar || this.m1Solar + this.m2Solar) * M_SUN,
    }).value;
    return {
      phase: getBinaryPhaseLabel(this.phase),
      separation: this.separationVis,
      m1: this.m1Solar,
      m2: this.m2Solar,
      mu: this.muSolar,
      merged: this.mergedMassSolar,
      strain: this.lastStrain,
      frequency: this.lastFrequency,
      energyRadiated: this.energyRadiated,
      hawkingT: T,
      evapPct: this.evapProgress * 100,
    };
  }

  getCameraFrame() {
    if (this.phase === BINARY_PHASE.IDLE || this.phase === BINARY_PHASE.INSPIRAL) {
      const span = this.separationVis + this.rs1 + this.rs2 + 30;
      return { tx: 0, ty: 0, tz: 0, dist: span * 1.6, height: span * 0.45 };
    }
    const rs = this.rsMerged || schwarzschildRadiusVis(this.m1Solar + this.m2Solar);
    return { tx: 0, ty: 0, tz: 0, dist: rs * 35, height: rs * 12 };
  }
}
