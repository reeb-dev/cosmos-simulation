import { createCircularOrbit, createRadialInfall } from '../physics/schwarzschild.js';

const EVENTS = {
  starBorn: () => pick(['Una estrella enciende su fusión', 'Nace una estrella en el campo cósmico', 'Destello de luz: nueva estrella']),
  starDied: () => pick(['Una estrella se apaga en silencio', 'Ceniza estelar se dispersa', 'Una luz se apaga en la distancia']),
  particleCaptured: () => pick(['Materia cae al horizonte', 'El agujero negro devora una partícula', 'Acerción fatal: partícula capturada']),
  particleSpawned: () => pick(['Nueva materia emerge del vacío cuántico', 'Una partícula aparece en órbita', 'El cosmos genera materia']),
  geodesicReborn: () => pick(['Una geodésica renace en espiral', 'Trayectoria relativista reiniciada', 'El espaciotiempo traza un nuevo camino']),
  accretion: () => pick(['El agujero negro crece por acreción', 'Masa aumenta: el horizonte se expande', 'Hambre cósmica: +masa']),
  expansion: () => pick(['El universo se estira un poco más', 'a(t) pulsa: expansión continua', 'Las galaxias se alejan imperceptiblemente']),
  flare: () => pick(['Erupción en el disco de acreción', 'Chorro de energía desde el horizonte', 'El disco brilla con furia']),
  probeAuto: () => pick(['Una sonda se lanza sola hacia el horizonte', 'El universo envía un explorador', 'Sonda autónoma en tránsito']),
  breathe: () => pick(['El cosmos inhala...', 'El universo respira', 'Pulso gravitacional detectado']),
  theoryShift: () => pick(['El horizonte susurra otra posibilidad', 'La física del interior fluctúa', 'Realidad cuántica: teoría en superposición']),
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export class LifeEngine {
  constructor(universe, horizonSim) {
    this.universe = universe;
    this.horizonSim = horizonSim;
    this.enabled = true;
    this.age = 0;
    this.vitality = 0.5;
    this.pulse = 0;
    this.events = [];
    this.maxEvents = 8;
    this.eventTimer = 0;
    this.spawnTimer = 0;
    this.starTimer = 0;
    this.flareTimer = 0;
    this.probeTimer = 15;
    this.theoryTimer = 45;
    this.accretionAccum = 0;
    this.phase = 'nacimiento';
    this.birthTime = 0;
    setTimeout(() => this.log('breathe'), 500);
  }

  log(type, extra = '') {
    const msg = EVENTS[type] ? EVENTS[type]() : type;
    this.events.unshift({ text: msg + (extra ? ` (${extra})` : ''), time: this.age });
    if (this.events.length > this.maxEvents) this.events.pop();
  }

  step(dt, engine, callbacks = {}) {
    if (!this.enabled || this.universe.paused) return { vitality: this.vitality, pulse: this.pulse, phase: this.phase };

    this.age += dt;
    this.birthTime += dt;
    this.vitality = 0.45 + 0.55 * Math.sin(this.age * 0.21) * Math.cos(this.age * 0.13);
    this.pulse = 0.5 + 0.5 * Math.sin(this.age * 1.7);

    this._updatePhase();
    this._accretion(dt, callbacks);
    this._spawnMatter(dt, engine);
    this._rebornGeodesics();
    this._autoProbe(dt);
    this._ambientEvents(dt, callbacks);
    this._theoryDrift(dt, callbacks);

    return { vitality: this.vitality, pulse: this.pulse, phase: this.phase };
  }

  reset(enabled = true) {
    this.enabled = enabled;
    this.age = 0;
    this.vitality = 0.5;
    this.pulse = 0;
    this.events = [];
    this.eventTimer = 0;
    this.spawnTimer = 0;
    this.starTimer = 0;
    this.flareTimer = 0;
    this.probeTimer = 20;
    this.theoryTimer = 60;
    this.accretionAccum = 0;
    this.phase = 'nacimiento';
    this.birthTime = 0;
  }

  _updatePhase() {
    const z = this.universe.cosmology.redshift;
    if (this.birthTime < 30) this.phase = 'nacimiento';
    else if (z < 0.01) this.phase = 'infancia';
    else if (z < 0.5) this.phase = 'madurez';
    else this.phase = 'vejez cósmica';
  }

  _accretion(dt, callbacks) {
    const rate = 0.002 * dt * (0.5 + this.vitality);
    this.accretionAccum += rate;
    if (this.accretionAccum >= 0.05) {
      const add = Math.floor(this.accretionAccum * 20) / 20;
      this.universe.blackHoleMassSolar = Math.min(100, this.universe.blackHoleMassSolar + add);
      this.accretionAccum = 0;
      this.horizonSim.setRs(this.universe.rsVis);
      callbacks.onMassGrow?.(this.universe.blackHoleMassSolar);
      this.log('accretion', `+${add.toFixed(2)} M☉`);
    }
  }

  _spawnMatter(dt, engine) {
    const u = this.universe;
    const rs = u.rsVis;
    this.spawnTimer += dt;

    if (this.spawnTimer > 4 + Math.random() * 6) {
      this.spawnTimer = 0;
      const angle = Math.random() * Math.PI * 2;
      const r = rs * (20 + Math.random() * 50);
      const v = 0.12 + Math.random() * 0.25;
      u.gravity.addBody({
        x: r * Math.cos(angle),
        y: (Math.random() - 0.5) * rs * 0.5,
        z: r * Math.sin(angle),
        vx: -v * Math.sin(angle),
        vy: 0,
        vz: v * Math.cos(angle),
        mass: 0.2 + Math.random() * 0.8,
      });
      if (u.gravity.bodies.length > 18) u.gravity.bodies.shift();
      this.log('particleSpawned');
    }

    for (let i = u.gravity.bodies.length - 1; i >= 0; i--) {
      const dist = u.gravity.distanceFromBH(i);
      if (dist < rs * 0.9) {
        u.gravity.bodies.splice(i, 1);
        this.log('particleCaptured');
      }
    }
  }

  _rebornGeodesics() {
    const u = this.universe;
    const rs = u.rsVis;

    for (let i = u.geodesics.length - 1; i >= 0; i--) {
      const g = u.geodesics[i];
      if (g.captured || g.escaped) {
        u.geodesics.splice(i, 1);
        this.log(g.captured ? 'particleCaptured' : 'geodesicReborn');
      }
    }

    while (u.geodesics.length < 4) {
      const r = rs * (8 + Math.random() * 18);
      if (Math.random() < 0.3) {
        u.geodesics.push(createRadialInfall(rs, r));
      } else {
        u.geodesics.push(createCircularOrbit(rs, r));
      }
      this.log('geodesicReborn');
    }
  }

  _autoProbe(dt) {
    if (this.horizonSim.probeState !== 'idle') return;
    this.probeTimer -= dt;
    if (this.probeTimer <= 0) {
      this.probeTimer = 20 + Math.random() * 35;
      this.horizonSim.launchProbe();
      this.log('probeAuto');
    }
  }

  _ambientEvents(dt, callbacks = {}) {
    this.eventTimer += dt;
    this.starTimer += dt;
    this.flareTimer += dt;

    if (this.starTimer > 8 + Math.random() * 12) {
      this.starTimer = 0;
      if (Math.random() < 0.6) {
        this.log('starBorn');
        callbacks.onStarBorn?.();
      } else {
        this.log('starDied');
        callbacks.onStarDied?.();
      }
    }

    if (this.flareTimer > 12 + Math.random() * 15) {
      this.flareTimer = 0;
      this.log('flare');
    }

    if (this.eventTimer > 20) {
      this.eventTimer = 0;
      if (this.universe.showExpansion) this.log('expansion');
      else this.log('breathe');
    }
  }

  _theoryDrift(dt, callbacks) {
    this.theoryTimer -= dt;
    if (this.theoryTimer <= 0 && Math.random() < 0.35) {
      this.theoryTimer = 50 + Math.random() * 40;
      const all = [
        'hybrid_regime', 'friedmann_echo', 'temporal_fracture', 'information_loop',
        'planck_threshold', 'cosmic_resonance', 'accretion_inverted', 'eternal_geodesic',
        'max_entropy', 'omega_multiverse', 'wormhole', 'holographic',
      ];
      const next = all[Math.floor(Math.random() * all.length)];
      if (next !== this.horizonSim.theoryId) {
        this.horizonSim.setTheory(next);
        callbacks.onTheoryDrift?.(next);
        this.log('theoryShift');
      }
    }
  }
}
