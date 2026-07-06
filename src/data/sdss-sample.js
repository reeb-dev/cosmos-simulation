/**
 * Muestra representativa estilo SDSS DR16 (sintética, distribución realista).
 * Posiciones en esfera comóvil, redshift z, color g-r.
 * Para catálogo completo: ver SDSS SkyServer / CAS.
 */

function hash(i) {
  let x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** ~600 galaxias en coordenadas comóviles normalizadas */
export function buildSdssSample(count = 600, seed = 42) {
  const galaxies = [];
  for (let i = 0; i < count; i++) {
    const r1 = hash(i + seed);
    const r2 = hash(i * 3 + seed);
    const r3 = hash(i * 7 + seed);
    const r4 = hash(i * 11 + seed);

    const z = 0.02 + Math.pow(r1, 1.8) * 1.2;
    const theta = r2 * Math.PI * 2;
    const phi = Math.acos(2 * r3 - 1);
    const r = 80 + r4 * 320;

    const gr = 0.3 + z * 0.9 + (r4 - 0.5) * 0.2;
    const types = ['spiral', 'elliptical', 'edge-on', 'irregular'];
    const type = types[Math.floor(r2 * 4) % 4];

    galaxies.push({
      x: r * Math.sin(phi) * Math.cos(theta),
      y: r * Math.sin(phi) * Math.sin(theta) * 0.6,
      z: r * Math.cos(phi),
      zCosmo: z,
      gr,
      type,
      sdssId: `SDSS-J${Math.floor(r1 * 999)}${Math.floor(r2 * 99)}`,
    });
  }
  return galaxies;
}

export const SDSS_SAMPLE_META = {
  reference: 'Distribución inspirada en SDSS DR16 (Abdurro\'uf et al. 2022)',
  count: 600,
  note: 'Muestra procedural con estadísticas de z y color g-r; no son posiciones reales del catálogo.',
};
