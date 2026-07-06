/**
 * API programática expuesta como window.CosmosSim
 */
import { computeValidations, sweepH0, sweepBlackHoleMass } from '../ui/research-panel.js';

export function createCosmosApi(ctx) {
  return {
    /** Estado completo del universo y modo */
    getState() {
      const mode = ctx.modeManager?.currentMode ?? 'black_hole';
      const state = {
        mode,
        seed: ctx.simulationSeed?.seed,
        theoryId: ctx.horizonSim?.theoryId,
        paused: ctx.universe.paused,
        cosmology: {
          H0: ctx.universe.cosmology.H0,
          OmegaM: ctx.universe.cosmology.OmegaM,
          OmegaLambda: ctx.universe.cosmology.OmegaLambda,
          a: ctx.universe.cosmology.a,
          z: ctx.universe.cosmology.redshift,
        },
        blackHole: {
          massSolar: ctx.universe.blackHoleMassSolar,
          spin: ctx.universe.spin,
          rsVis: ctx.universe.rsVis,
        },
        clock: ctx.engine?.clock,
      };
      if (mode === 'binary_merger' && ctx.binarySim) {
        state.binary = ctx.binarySim.getState();
      }
      return state;
    },

    /** Lecturas en vivo (HUD) */
    getReadouts() {
      const readouts = ctx.universe.getReadouts();
      if (ctx.modeManager?.currentMode === 'binary_merger' && ctx.binarySim) {
        return { ...readouts, binary: ctx.binarySim.getReadouts() };
      }
      return readouts;
    },

    /** Ajustar cosmología */
    setCosmology(params) {
      ctx.universe.setCosmology(params);
      ctx.guiSync?.();
      return ctx.universe.cosmology;
    },

    /** Exportar datos (devuelve objeto; no descarga) */
    exportData(format = 'json') {
      if (format === 'csv') {
        return { csv: ctx.dataLogger?.toCSV(), snapshot: ctx.dataLogger?.snapshot(ctx) };
      }
      return ctx.dataLogger?.toJSON(ctx);
    },

    /** Descargar CSV+snapshot en el navegador */
    downloadData(format = 'csv') {
      if (format === 'json') ctx.dataLogger?.exportJSON(ctx);
      else ctx.dataLogger?.exportCSV(ctx);
    },

    /** Semilla reproducible */
    setSeed(seed) {
      ctx.simulationSeed?.setSeed(seed);
      ctx.universe.simulationSeed = ctx.simulationSeed;
      ctx.universe._initParticles();
      ctx.galaxyField?.reset?.();
      return ctx.simulationSeed.seed;
    },

    getSeed() {
      return ctx.simulationSeed?.seed;
    },

    /** Snapshot puntual */
    snapshot() {
      return ctx.dataLogger?.snapshot(ctx);
    },

    /** Validaciones teórico vs sim */
    getValidations() {
      return computeValidations(ctx);
    },

    sweepH0(opts) {
      return sweepH0(ctx, opts);
    },

    sweepMass(opts) {
      return sweepBlackHoleMass(ctx, opts);
    },

    /** Modo y teoría */
    setMode(modeId) {
      ctx.modeManager?.setMode(modeId);
    },

    setTheory(theoryId) {
      ctx.horizonSim?.setTheory(theoryId);
      ctx.onTheoryChange?.(theoryId);
    },
  };
}
