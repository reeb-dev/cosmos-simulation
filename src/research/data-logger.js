import { collectUrlState } from './simulation-seed.js';
import { DEFAULT_SEED } from './simulation-seed.js';

const MAX_SAMPLES = 10000;
const SAMPLE_INTERVAL_S = 0.25;

/**
 * Registra series temporales y exporta CSV/JSON.
 */
export class DataLogger {
  constructor() {
    this.samples = [];
    this._accum = 0;
    this._simTime = 0;
    this.enabled = true;
  }

  reset() {
    this.samples = [];
    this._accum = 0;
    this._simTime = 0;
  }

  /**
   * Llamar cada frame con dt en segundos reales.
   */
  tick(dt, ctx) {
    if (!this.enabled) return;
    this._accum += dt;
    if (this._accum < SAMPLE_INTERVAL_S) return;
    this._accum = 0;

    const sample = this._buildSample(ctx);
    this.samples.push(sample);
    if (this.samples.length > MAX_SAMPLES) {
      this.samples.shift();
    }
  }

  _buildSample(ctx) {
    const u = ctx.universe;
    const cosmo = u.cosmology;
    const mode = ctx.modeManager?.currentMode ?? 'black_hole';
    const theoryId = ctx.horizonSim?.theoryId ?? 'unknown';
    const seed = ctx.simulationSeed?.seed ?? DEFAULT_SEED;

    this._simTime += SAMPLE_INTERVAL_S;

    const base = {
      t: this._simTime,
      a: cosmo.a,
      z: cosmo.redshift,
      H: cosmo.HNow,
      rs: u.rsVis,
      mode,
      theoryId,
      seed,
      massSolar: u.blackHoleMassSolar,
      H0: cosmo.H0,
      OmegaM: cosmo.OmegaM,
      OmegaLambda: cosmo.OmegaLambda,
    };

    if (mode === 'binary_merger' && ctx.binarySim) {
      const b = ctx.binarySim;
      const m1 = b.m1Solar;
      const m2 = b.m2Solar;
      const mu = (m1 * m2) / (m1 + m2);
      Object.assign(base, {
        binaryPhase: b.phase,
        m1Solar: m1,
        m2Solar: m2,
        muSolar: mu,
        separationVis: b.separationVis,
        strain: b.lastStrain,
        gwFrequency: b.lastFrequency,
        energyRadiated: b.energyRadiated,
      });
    }

    if (ctx.horizonSim) {
      base.timeDilation = ctx.horizonSim.effectiveTimeDilation;
      base.probeState = ctx.horizonSim.probeState;
    }

    return base;
  }

  /** Snapshot completo del estado actual */
  snapshot(ctx) {
    const u = ctx.universe;
    const cosmo = u.cosmology;
    const mode = ctx.modeManager?.currentMode ?? 'black_hole';
    const urlState = collectUrlState(ctx);

    const snap = {
      version: '1.1.0',
      timestamp: new Date().toISOString(),
      seed: ctx.simulationSeed?.seed ?? DEFAULT_SEED,
      mode,
      theoryId: ctx.horizonSim?.theoryId,
      cosmology: {
        H0: cosmo.H0,
        OmegaM: cosmo.OmegaM,
        OmegaLambda: cosmo.OmegaLambda,
        a: cosmo.a,
        z: cosmo.redshift,
        H: cosmo.HNow,
        t: cosmo.t,
        ageGyr: cosmo.universeAgeGyr(),
        dc: cosmo.comovingDistance(),
      },
      blackHole: {
        massSolar: u.blackHoleMassSolar,
        spin: u.spin,
        rsVis: u.rsVis,
      },
      readouts: u.getReadouts(),
      urlState,
      reproducibility: {
        seed: ctx.simulationSeed?.seed ?? DEFAULT_SEED,
        url: typeof window !== 'undefined'
          ? `${window.location.origin}${window.location.pathname}?${new URLSearchParams(
              Object.entries(urlState).map(([k, v]) => [k, String(v)])
            ).toString()}`
          : null,
      },
    };

    if (mode === 'binary_merger' && ctx.binarySim) {
      const b = ctx.binarySim;
      snap.binary = {
        ...b.getState(),
        readouts: b.getReadouts(),
        muSolar: (b.m1Solar * b.m2Solar) / (b.m1Solar + b.m2Solar),
      };
    }

    if (ctx.dataLogger?.samples?.length) {
      snap.timeSeriesCount = ctx.dataLogger.samples.length;
      snap.lastSamples = ctx.dataLogger.samples.slice(-5);
    }

    return snap;
  }

  toJSON(ctx) {
    return {
      meta: {
        exportedAt: new Date().toISOString(),
        sampleCount: this.samples.length,
        sampleIntervalS: SAMPLE_INTERVAL_S,
        snapshot: this.snapshot(ctx),
      },
      samples: this.samples,
    };
  }

  toCSV() {
    if (!this.samples.length) return 't,a,z,H,rs,mode,theoryId,seed\n';
    const keys = Object.keys(this.samples[0]);
    const header = keys.join(',');
    const rows = this.samples.map((s) =>
      keys.map((k) => {
        const v = s[k];
        if (v == null) return '';
        if (typeof v === 'string' && v.includes(',')) return `"${v}"`;
        return v;
      }).join(',')
    );
    return [header, ...rows].join('\n');
  }

  /** Descarga blob en el navegador */
  download(content, filename, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  exportCSV(ctx) {
    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    this.download(this.toCSV(), `cosmos-sim-${ts}.csv`, 'text/csv;charset=utf-8');
    this.download(JSON.stringify(this.snapshot(ctx), null, 2), `cosmos-sim-snapshot-${ts}.json`, 'application/json');
  }

  exportJSON(ctx) {
    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    this.download(JSON.stringify(this.toJSON(ctx), null, 2), `cosmos-sim-full-${ts}.json`, 'application/json');
  }
}
