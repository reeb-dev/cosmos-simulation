/**
 * Geodésicas en métrica de Schwarzschild en unidades de visualización.
 * c = 1, r y r_s en las mismas unidades que la escena Three.js.
 */
export class SchwarzschildGeodesic {
  constructor(rsDisplay, { r, theta, phi, dr, dtheta, dphi, dt }) {
    this.rs = rsDisplay;
    this.state = { t: 0, r, theta, phi, dr, dtheta, dphi, dt }; // tiempo coordenada inicial
    this.captured = false;
    this.escaped = false;
    this.trail = [];
    this.maxTrail = 500;
  }

  f(r) {
    if (r <= this.rs) return 0;
    return 1 - this.rs / r;
  }

  christoffel(r, theta) {
    const fr = this.f(r);
    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);
    const fp = this.rs / (r * r);

    return {
      trr: 0.5 * fp / Math.max(fr, 1e-15),
      ttr: 0.5 * fp / Math.max(fr, 1e-15),
      rtt: 0.5 * fr * fp,
      rthth: -fr * r,
      rphph: -fr * r * sinT * sinT,
      thrr: 1 / r,
      thphph: -sinT * cosT,
      phrr: 1 / r,
      phthph: cosT / Math.max(sinT, 1e-15),
    };
  }

  derivatives(s) {
    const { r, theta, dr, dtheta, dphi, dt: dtCoord } = s;
    const gamma = this.christoffel(r, theta);

    const acc = (mu) => {
      const terms = { t: 0, r: 0, theta: 0, phi: 0 };
      const v = { t: dtCoord, r: dr, theta: dtheta, phi: dphi };

      const add = (upper, lower1, lower2, coeff) => {
        terms[upper] -= coeff * v[lower1] * v[lower2];
      };

      add('r', 't', 't', gamma.rtt);
      add('r', 'r', 'r', gamma.trr);
      add('r', 'theta', 'theta', gamma.rthth);
      add('r', 'phi', 'phi', gamma.rphph);
      add('theta', 'r', 'theta', 2 * gamma.thrr);
      add('theta', 'phi', 'phi', gamma.thphph);
      add('phi', 'r', 'phi', 2 * gamma.phrr);
      add('phi', 'theta', 'phi', 2 * gamma.phthph);
      add('t', 't', 'r', 2 * gamma.ttr);

      return terms[mu];
    };

    return {
      dt: dtCoord,
      dr,
      dtheta,
      dphi,
      ddr: acc('r'),
      ddtheta: acc('theta'),
      ddphi: acc('phi'),
      ddt: acc('t'),
    };
  }

  step(dtau) {
    if (this.captured || this.escaped) return this;

    const s = this.state;
    const d = (st) => this.derivatives(st);

    const k1 = d(s);
    const s2 = { ...s, t: s.t + 0.5 * dtau * k1.dt, r: s.r + 0.5 * dtau * k1.dr, theta: s.theta + 0.5 * dtau * k1.dtheta, phi: s.phi + 0.5 * dtau * k1.dphi, dr: s.dr + 0.5 * dtau * k1.ddr, dtheta: s.dtheta + 0.5 * dtau * k1.ddtheta, dphi: s.dphi + 0.5 * dtau * k1.ddphi, dt: s.dt + 0.5 * dtau * k1.ddt };
    const k2 = d(s2);
    const s3 = { ...s, t: s.t + 0.5 * dtau * k2.dt, r: s.r + 0.5 * dtau * k2.dr, theta: s.theta + 0.5 * dtau * k2.dtheta, phi: s.phi + 0.5 * dtau * k2.dphi, dr: s.dr + 0.5 * dtau * k2.ddr, dtheta: s.dtheta + 0.5 * dtau * k2.ddtheta, dphi: s.dphi + 0.5 * dtau * k2.ddphi, dt: s.dt + 0.5 * dtau * k2.ddt };
    const k3 = d(s3);
    const s4 = { ...s, t: s.t + dtau * k3.dt, r: s.r + dtau * k3.dr, theta: s.theta + dtau * k3.dtheta, phi: s.phi + dtau * k3.dphi, dr: s.dr + dtau * k3.ddr, dtheta: s.dtheta + dtau * k3.ddtheta, dphi: s.dphi + dtau * k3.ddphi, dt: s.dt + dtau * k3.ddt };
    const k4 = d(s4);

    this.state = {
      t: s.t + (dtau / 6) * (k1.dt + 2 * k2.dt + 2 * k3.dt + k4.dt),
      r: s.r + (dtau / 6) * (k1.dr + 2 * k2.dr + 2 * k3.dr + k4.dr),
      theta: s.theta + (dtau / 6) * (k1.dtheta + 2 * k2.dtheta + 2 * k3.dtheta + k4.dtheta),
      phi: s.phi + (dtau / 6) * (k1.dphi + 2 * k2.dphi + 2 * k3.dphi + k4.dphi),
      dr: s.dr + (dtau / 6) * (k1.ddr + 2 * k2.ddr + 2 * k3.ddr + k4.ddr),
      dtheta: s.dtheta + (dtau / 6) * (k1.ddtheta + 2 * k2.ddtheta + 2 * k3.ddtheta + k4.ddtheta),
      dphi: s.dphi + (dtau / 6) * (k1.ddphi + 2 * k2.ddphi + 2 * k3.ddphi + k4.ddphi),
      dt: s.dt + (dtau / 6) * (k1.ddt + 2 * k2.ddt + 2 * k3.ddt + k4.ddt),
    };

    if (this.state.r <= this.rs * 1.001) {
      this.captured = true;
      this.state.r = this.rs;
    } else if (this.state.r > this.rs * 500) {
      this.escaped = true;
    }

    this.trail.push(this.cartesian());
    if (this.trail.length > this.maxTrail) this.trail.shift();

    return this;
  }

  cartesian() {
    const { r, theta, phi } = this.state;
    const sinT = Math.sin(theta);
    return {
      x: r * sinT * Math.cos(phi),
      y: r * sinT * Math.sin(phi),
      z: r * Math.cos(theta),
    };
  }

  get status() {
    if (this.captured) return 'captured';
    if (this.escaped) return 'escaped';
    return 'orbiting';
  }
}

/** Órbita circular en unidades de visualización */
export function createCircularOrbit(rsDisplay, orbitRadius) {
  const r = orbitRadius;
  const f = 1 - rsDisplay / r;
  const omega = Math.sqrt(Math.max(f, 1e-6)) / r;

  return new SchwarzschildGeodesic(rsDisplay, {
    r,
    theta: Math.PI / 2,
    phi: 0,
    dr: 0,
    dtheta: 0,
    dphi: omega,
    dt: 1 / Math.sqrt(Math.max(f, 1e-6)),
  });
}

/** Caída radial hacia el horizonte */
export function createRadialInfall(rsDisplay, orbitRadius) {
  const r = orbitRadius;
  const f = 1 - rsDisplay / r;

  return new SchwarzschildGeodesic(rsDisplay, {
    r,
    theta: Math.PI / 2,
    phi: 0,
    dr: -0.15 * Math.sqrt(Math.max(f, 1e-6)),
    dtheta: 0,
    dphi: 0,
    dt: 1 / Math.sqrt(Math.max(f, 1e-6)),
  });
}

export { schwarzschildRadius } from './units.js';
