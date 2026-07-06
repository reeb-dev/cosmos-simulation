import { DEFAULT_THEORY, HORIZON_THEORIES, PROBE_STATE } from './horizon-theories.js';

export class HorizonSimulator {
  constructor(rsVis) {
    this.rs = rsVis;
    this.theoryId = DEFAULT_THEORY;
    this.probeState = PROBE_STATE.IDLE;
    this.probeRadius = rsVis * 30;
    this.crossingProgress = 0;
    this.timeDilation = 1;
    this.elapsed = 0;
    this.approachSpeed = 8;
    this.crossingDuration = 2.5;

    this.cameraRadius = rsVis * 40;
    this.cameraCrossingProgress = 0;
    this.cameraInside = false;
    this.cameraTimeDilation = 1;
    this.immersionSource = 'none';
  }

  setTheory(id) {
    if (HORIZON_THEORIES[id]) {
      this.theoryId = id;
    }
  }

  setRs(rs) {
    this.rs = rs;
    if (this.probeState === PROBE_STATE.IDLE) {
      this.probeRadius = rs * 30;
    }
  }

  /** Actualiza proximidad de la cámara al horizonte (zoom inmersivo) */
  updateCamera(cameraPosition, bhCenter = { x: 0, y: 0, z: 0 }) {
    const dx = cameraPosition.x - bhCenter.x;
    const dy = cameraPosition.y - bhCenter.y;
    const dz = cameraPosition.z - bhCenter.z;
    this.cameraRadius = Math.sqrt(dx * dx + dy * dy + dz * dz);

    const fadeStart = this.rs * 12;
    const fadeEnd = this.rs * 1.05;

    if (this.cameraRadius <= fadeEnd) {
      this.cameraCrossingProgress = 1;
      this.cameraInside = true;
    } else if (this.cameraRadius < fadeStart) {
      const t = (this.cameraRadius - fadeEnd) / (fadeStart - fadeEnd);
      this.cameraCrossingProgress = 1 - t;
      this.cameraInside = false;
    } else {
      this.cameraCrossingProgress = 0;
      this.cameraInside = false;
    }

    if (this.cameraRadius > this.rs) {
      this.cameraTimeDilation = Math.sqrt(Math.max(0.001, 1 - this.rs / this.cameraRadius));
    } else {
      this.cameraTimeDilation = 0;
    }
  }

  launchProbe() {
    if (this.probeState !== PROBE_STATE.IDLE) return;
    this.probeState = PROBE_STATE.APPROACHING;
    this.probeRadius = this.rs * 30;
    this.crossingProgress = 0;
    this.elapsed = 0;
  }

  reset() {
    this.probeState = PROBE_STATE.IDLE;
    this.probeRadius = this.rs * 30;
    this.crossingProgress = 0;
    this.timeDilation = 1;
    this.elapsed = 0;
  }

  step(dt) {
    this.elapsed += dt;

    if (this.probeState === PROBE_STATE.APPROACHING) {
      const dist = this.probeRadius - this.rs;
      const speedFactor = Math.max(0.15, dist / (this.rs * 30));
      this.probeRadius -= this.approachSpeed * dt * speedFactor * 3;
      this.timeDilation = Math.sqrt(Math.max(0.01, 1 - this.rs / this.probeRadius));

      if (this.probeRadius <= this.rs * 1.02) {
        this.probeState = PROBE_STATE.CROSSING;
        this.probeRadius = this.rs;
        this.crossingProgress = 0;
      }
    }

    if (this.probeState === PROBE_STATE.CROSSING) {
      this.crossingProgress += dt / this.crossingDuration;
      this.timeDilation = Math.max(0.001, 1 - this.crossingProgress);

      if (this.crossingProgress >= 1) {
        this.probeState = PROBE_STATE.INSIDE;
        this.crossingProgress = 1;
        this.timeDilation = 0;
      }
    }

    if (this.probeState === PROBE_STATE.INSIDE) {
      this.probeRadius = this.rs * 0.5;
      this.timeDilation = 0;
    }

    this._updateImmersionSource();
  }

  _updateImmersionSource() {
    const probeOpacity = this._probeOpacity();
    const camOpacity = this.cameraCrossingProgress;

    if (probeOpacity >= camOpacity && probeOpacity > 0) {
      this.immersionSource = this.probeState === PROBE_STATE.IDLE ? 'none' : 'probe';
    } else if (camOpacity > 0) {
      this.immersionSource = this.cameraInside ? 'camera_inside' : 'camera_approach';
    } else {
      this.immersionSource = 'none';
    }
  }

  _probeOpacity() {
    if (this.probeState === PROBE_STATE.CROSSING) return this.crossingProgress;
    if (this.probeState === PROBE_STATE.INSIDE) return 1;
    if (this.probeState === PROBE_STATE.APPROACHING && this.probeRadius < this.rs * 5) {
      return 0.3 * (1 - (this.probeRadius - this.rs) / (this.rs * 4));
    }
    return 0;
  }

  getProbePosition() {
    const angle = this.elapsed * 0.4;
    const r = this.probeRadius;
    return {
      x: r * Math.cos(angle),
      y: Math.sin(this.elapsed * 0.6) * r * 0.05,
      z: r * Math.sin(angle),
    };
  }

  get theory() {
    return HORIZON_THEORIES[this.theoryId];
  }

  get effectiveTimeDilation() {
    if (this.immersionSource.startsWith('camera')) {
      return this.cameraTimeDilation;
    }
    return this.timeDilation;
  }

  get interiorOpacity() {
    return Math.max(this._probeOpacity(), this.cameraCrossingProgress);
  }

  get horizonRipple() {
    if (this.probeState === PROBE_STATE.CROSSING) {
      return Math.sin(this.crossingProgress * Math.PI * 4) * (1 - this.crossingProgress);
    }
    if (this.cameraCrossingProgress > 0 && this.cameraCrossingProgress < 1) {
      return Math.sin(this.cameraCrossingProgress * Math.PI * 3) * 0.5;
    }
    if (this.cameraInside) return 0.15;
    if (this.probeState === PROBE_STATE.APPROACHING && this.probeRadius < this.rs * 3) {
      return 0.3 * (1 - (this.probeRadius - this.rs) / (this.rs * 2));
    }
    return 0;
  }

  get immersionLabel() {
    const labels = {
      none: 'Exterior',
      probe: 'Sonda en tránsito',
      camera_approach: 'Zoom: acercándose al horizonte',
      camera_inside: 'Zoom: dentro del horizonte',
    };
    return labels[this.immersionSource] ?? 'Exterior';
  }
}
