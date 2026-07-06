/**
 * Plantilla de strain GW150914 (LIGO/Virgo O1).
 * Basada en Abbott et al. (2016) Phys. Rev. Lett. 116, 061102.
 * M₁≈36 M☉, M₂≈29 M☉, D_L≈410 Mpc, f_merge≈250 Hz.
 * NOTA: serie sintética tipo chirp para comparación cualitativa; no es dato crudo de LOSC.
 */

export const GW150914_META = {
  id: 'GW150914',
  reference: 'Abbott et al. (2016), Phys. Rev. Lett. 116, 061102',
  source: 'LIGO Open Science Center (plantilla educativa)',
  m1Solar: 36,
  m2Solar: 29,
  distanceMpc: 410,
  peakStrain: 1.0e-21,
  mergeFrequencyHz: 250,
  durationSec: 4,
};

/** Genera chirp inspiral + pico de fusión (strain adimensional) */
export function generateGW150914Template(points = 400) {
  const { durationSec, peakStrain, mergeFrequencyHz, m1Solar, m2Solar } = GW150914_META;
  const Mchirp = ((m1Solar * m2Solar) ** (3 / 5)) / ((m1Solar + m2Solar) ** (1 / 5));
  const tMerge = durationSec * 0.72;
  const samples = [];

  for (let i = 0; i < points; i++) {
    const t = (i / (points - 1)) * durationSec;
    const tau = Math.max(0.001, tMerge - t);
    const f = mergeFrequencyHz * Math.pow(tau / tMerge, -3 / 8);
    const envelope = Math.exp(-((t - tMerge) ** 2) / (2 * 0.08 ** 2));
    const inspiral = t < tMerge
      ? peakStrain * 0.15 * Math.pow(t / tMerge, 1.5) * Math.sin(2 * Math.PI * f * t * 0.01)
      : 0;
    const merger = peakStrain * envelope * Math.sin(2 * Math.PI * mergeFrequencyHz * (t - tMerge) * 0.02);
    const h = inspiral + merger;
    samples.push({ t, h, f: Math.min(f, 500) });
  }
  return samples;
}

/** Interpola strain LIGO en tiempo t (s) */
export function ligoStrainAt(t, template = null) {
  const data = template ?? generateGW150914Template();
  if (t <= data[0].t) return data[0].h;
  if (t >= data[data.length - 1].t) return data[data.length - 1].h;
  for (let i = 0; i < data.length - 1; i++) {
    if (t >= data[i].t && t <= data[i + 1].t) {
      const u = (t - data[i].t) / (data[i + 1].t - data[i].t);
      return data[i].h * (1 - u) + data[i + 1].h * u;
    }
  }
  return 0;
}
