import { DEFAULT_BLACK_HOLE, DEFAULT_COSMOLOGY, REGIME_THRESHOLDS } from '../physics/constants.js';
import { FriedmannSolver } from '../physics/friedmann.js';
import { NBodyGravity } from '../physics/gravity.js';
import { createCircularOrbit, createRadialInfall } from '../physics/schwarzschild.js';
import { massFromSolar, schwarzschildRadiusMeters, schwarzschildRadiusVis } from '../physics/units.js';

export const REGIME = {
  SCHWARZSCHILD: 'schwarzschild',
  NEWTONIAN: 'newtonian',
  COSMOLOGICAL: 'cosmological',
};

export class Universe {
  constructor(simulationSeed = null) {
    this.cosmology = new FriedmannSolver({ ...DEFAULT_COSMOLOGY });
    this.gravity = new NBodyGravity({ softening: 0.3 });
    this.geodesics = [];
    this.blackHoleMassSolar = DEFAULT_BLACK_HOLE.massSolar;
    this.spin = 0;
    this.timeScale = 1e4;
    this.paused = false;
    this.showExpansion = true;
    this.showGeodesics = true;
    this.showLensing = true;
    this.lifeBoost = 1.8;
    this.realismMode = 'standard';
    this.simulationSeed = simulationSeed;

    this._initParticles();
  }

  /** RNG reproducible o Math.random como fallback */
  _rng() {
    return this.simulationSeed?.random?.() ?? Math.random();
  }

  get massKg() {
    return massFromSolar(this.blackHoleMassSolar);
  }

  get rsVis() {
    return schwarzschildRadiusVis(this.blackHoleMassSolar);
  }

  get localRadius() {
    return REGIME_THRESHOLDS.localRadius;
  }

  _initParticles() {
    this.geodesics = [];
    this.gravity.clear();

    const rs = this.rsVis;

    this.geodesics.push(createCircularOrbit(rs, rs * 8));
    this.geodesics.push(createCircularOrbit(rs, rs * 15));
    this.geodesics.push(createRadialInfall(rs, rs * 20));

    const orbits = [
      { r: rs * 25, v: 0.35 },
      { r: rs * 35, v: 0.28 },
      { r: rs * 50, v: 0.22 },
      { r: rs * 65, v: 0.18 },
    ];

    for (const o of orbits) {
      const angle = this._rng() * Math.PI * 2;
      this.gravity.addBody({
        x: o.r * Math.cos(angle),
        y: 0,
        z: o.r * Math.sin(angle),
        vx: -o.v * Math.sin(angle),
        vy: 0,
        vz: o.v * Math.cos(angle),
        mass: 0.5 + this._rng() * 0.5,
      });
    }
  }

  setBlackHoleMass(massSolar) {
    this.blackHoleMassSolar = massSolar;
    this._initParticles();
  }

  setCosmology(params) {
    this.cosmology.setCosmology(params);
  }

  classifyRegime(distanceVis) {
    const rs = this.rsVis;
    if (distanceVis < rs * REGIME_THRESHOLDS.schwarzschildFactor) {
      return REGIME.SCHWARZSCHILD;
    }
    if (distanceVis < this.localRadius) {
      return REGIME.NEWTONIAN;
    }
    return REGIME.COSMOLOGICAL;
  }

  getReadouts() {
    return {
      a: this.cosmology.a,
      z: this.cosmology.redshift,
      H: this.cosmology.HNow,
      rs: this.rsVis,
      rsMeters: schwarzschildRadiusMeters(this.blackHoleMassSolar),
      t: this.cosmology.t,
      dc: this.cosmology.comovingDistance(),
      ageGyr: this.cosmology.universeAgeGyr(),
    };
  }
}
