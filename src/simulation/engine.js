import { REGIME, Universe } from './universe.js';

export class SimulationEngine {
  constructor(universe = new Universe()) {
    this.universe = universe;
    this.clock = 0;
    this.dt = 1 / 60;
  }

  step(rawDt) {
    if (this.universe.paused) return;

    const u = this.universe;
    const cosmoDt = rawDt * u.timeScale;

    if (u.showExpansion) {
      const hubbleTime = 1 / u.cosmology.H0SI;
      const lifeBoost = u.lifeBoost ?? 1;
      u.cosmology.step((cosmoDt / hubbleTime) * 0.05 * lifeBoost);
    }

    if (u.showGeodesics) {
      const tau = rawDt * 1.5;
      for (const geo of u.geodesics) {
        geo.step(tau);
      }
    }

    u.gravity.step(rawDt * 0.8, u.blackHoleMassSolar / 10);

    this.clock += cosmoDt;
  }

  getParticleStates() {
    const u = this.universe;
    const rs = u.rsVis;
    const states = [];

    for (const geo of u.geodesics) {
      const pos = geo.cartesian();
      const dist = Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
      states.push({
        type: 'geodesic',
        x: pos.x,
        y: pos.y,
        z: pos.z,
        status: geo.status,
        regime: u.classifyRegime(dist),
        trail: [...geo.trail],
      });
    }

    for (let i = 0; i < u.gravity.bodies.length; i++) {
      const body = u.gravity.bodies[i];
      const dist = u.gravity.distanceFromBH(i);
      states.push({
        type: 'nbody',
        x: body.x,
        y: body.y,
        z: body.z,
        status: dist < rs ? 'captured' : 'orbiting',
        regime: u.classifyRegime(dist),
        trail: [...body.trail],
      });
    }

    return states;
  }

  getScaleFactor() {
    return this.universe.showExpansion ? this.universe.cosmology.a : 1;
  }
}

export { REGIME, Universe };
