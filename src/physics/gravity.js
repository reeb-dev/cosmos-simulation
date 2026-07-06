import { G_DISPLAY } from './constants.js';

/**
 * Simulación N-cuerpos con integrador leapfrog (Verlet).
 * Posiciones y velocidades en unidades de visualización Three.js.
 */
export class NBodyGravity {
  constructor({ softening = 0.3 } = {}) {
    this.softening = softening;
    this.bodies = [];
  }

  addBody({ x, y, z, vx = 0, vy = 0, vz = 0, mass = 1, id = null }) {
    const body = {
      id: id ?? this.bodies.length,
      x, y, z,
      vx, vy, vz,
      ax: 0, ay: 0, az: 0,
      mass,
      trail: [],
      maxTrail: 200,
    };
    this.bodies.push(body);
    return body;
  }

  clear() {
    this.bodies = [];
  }

  computeAccelerations(bhMass = 1, bhPos = { x: 0, y: 0, z: 0 }) {
    const n = this.bodies.length;

    for (let i = 0; i < n; i++) {
      this.bodies[i].ax = 0;
      this.bodies[i].ay = 0;
      this.bodies[i].az = 0;
    }

    for (let i = 0; i < n; i++) {
      const bi = this.bodies[i];

      const dxBH = bhPos.x - bi.x;
      const dyBH = bhPos.y - bi.y;
      const dzBH = bhPos.z - bi.z;
      const r2BH = dxBH * dxBH + dyBH * dyBH + dzBH * dzBH + this.softening * this.softening;
      const rBH = Math.sqrt(r2BH);
      const accBH = (G_DISPLAY * bhMass) / r2BH;
      bi.ax += accBH * (dxBH / rBH);
      bi.ay += accBH * (dyBH / rBH);
      bi.az += accBH * (dzBH / rBH);

      for (let j = i + 1; j < n; j++) {
        const bj = this.bodies[j];
        const dx = bj.x - bi.x;
        const dy = bj.y - bi.y;
        const dz = bj.z - bi.z;
        const r2 = dx * dx + dy * dy + dz * dz + this.softening * this.softening;
        const r = Math.sqrt(r2);
        const acc = (G_DISPLAY * bi.mass * bj.mass) / r2;
        const scale = acc / r;

        bi.ax += scale * dx;
        bi.ay += scale * dy;
        bi.az += scale * dz;
        bj.ax -= scale * dx;
        bj.ay -= scale * dy;
        bj.az -= scale * dz;
      }
    }
  }

  step(dt, bhMass = 1, bhPos = { x: 0, y: 0, z: 0 }) {
    this.computeAccelerations(bhMass, bhPos);

    for (const b of this.bodies) {
      b.vx += 0.5 * dt * b.ax;
      b.vy += 0.5 * dt * b.ay;
      b.vz += 0.5 * dt * b.az;
      b.x += dt * b.vx;
      b.y += dt * b.vy;
      b.z += dt * b.vz;
    }

    this.computeAccelerations(bhMass, bhPos);

    for (const b of this.bodies) {
      b.vx += 0.5 * dt * b.ax;
      b.vy += 0.5 * dt * b.ay;
      b.vz += 0.5 * dt * b.az;

      b.trail.push({ x: b.x, y: b.y, z: b.z });
      if (b.trail.length > b.maxTrail) b.trail.shift();
    }
  }

  distanceFromBH(index, bhPos = { x: 0, y: 0, z: 0 }) {
    const b = this.bodies[index];
    const dx = b.x - bhPos.x;
    const dy = b.y - bhPos.y;
    const dz = b.z - bhPos.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}
