# Guía de investigación — cosmos-simulation

Panel **Controles → Investigación** (carpeta en la GUI derecha). Exporta datos, genera informes y ejecuta barridos paramétricos para análisis pedagógico o exploratorio.

> **Importante:** esta herramienta no sustituye códigos de física revisados por pares (CAMB, CLASS, SXS, LOSC). Los archivos exportados documentan el estado de *esta* simulación híbrida.

---

## Flujo recomendado (6 pasos)

1. **Configura** modo y parámetros (Cosmología, Agujero negro, Binario…).
2. **Deja correr** la simulación unos segundos — el contador de **muestras** sube cada ~0,25 s.
3. **Revisa** el panel Investigación (abajo-derecha, botón 📊): validaciones teórico vs simulado.
4. **Compara** madurez N2–N4 (exportaciones, datos observacionales LIGO/SDSS/Planck).
5. **Exporta** CSV/JSON, informe de validación o informe HTML de publicación.
6. **Copia URL reproducible** para que otros repitan el mismo estado (`seed`, modo, teoría, H₀…).

---

## Botones del panel Investigación

| Botón | Qué descarga | Cuándo usarlo |
|-------|--------------|---------------|
| **📥 Exportar datos (CSV/JSON)** | 2 archivos: `cosmos-sim-*.csv` + `cosmos-sim-snapshot-*.json` | Serie temporal + estado instantáneo |
| **📥 Exportar serie (JSON)** | `cosmos-sim-full-*.json` | Todo en un solo JSON (meta + muestras + snapshot) |
| **📋 Informe validación** | `cosmos-validation-*.json` | Comparaciones H, rₛ, z, d_c, dilatación… con errores % |
| **📄 Informe publicación (HTML)** | `cosmos-publication-*.html` | Informe autocontenido para adjuntar o subir a Zenodo/GitHub |
| **Barrido H₀ (60–80)** | `sweep-H0-*.csv` | Sensibilidad cosmológica (edad, H, d_c) |
| **Barrido M_BH (rₛ,T,τ)** | `sweep-MBH-*.csv` | Masa del agujero negro vs rₛ, T_Hawking, vida |
| **🔗 Copiar URL reproducible** | (portapapeles) | Enlace con semilla y parámetros codificados |

**Sliders:** `Puntos H₀` y `Puntos masa` (10–20, default 15) controlan la resolución de los barridos.

---

## Formatos de archivo

### 1. CSV de serie temporal — `cosmos-sim-YYYY-MM-DD-HH-mm-ss.csv`

Separador: coma. Primera fila = cabecera. Muestreo cada **0,25 s** de simulación (máx. 10 000 filas).

**Columnas base (siempre):**

| Columna | Tipo | Unidad / descripción |
|---------|------|---------------------|
| `t` | number | Tiempo de simulación (s) |
| `a` | number | Factor de escala |
| `z` | number | Redshift cosmológico |
| `H` | number | Hubble H(t) en km/s/Mpc |
| `rs` | number | Radio de Schwarzschild visual (u.vis) |
| `mode` | string | Modo activo (`black_hole`, `cosmology`, `binary_merger`, `deep_field`…) |
| `theoryId` | string | Teoría del horizonte |
| `seed` | number | Semilla RNG |
| `massSolar` | number | Masa del BH en M☉ |
| `H0` | number | H₀ configurado (km/s/Mpc) |
| `OmegaM` | number | Ωₘ |
| `OmegaLambda` | number | ΩΛ |

**Columnas extra en modo `binary_merger`:** `binaryPhase`, `m1Solar`, `m2Solar`, `muSolar`, `separationVis`, `strain`, `gwFrequency`, `energyRadiated`.

**Columnas extra si hay sonda/cámara:** `timeDilation`, `probeState`.

**Ejemplo (fragmento):**

```csv
t,a,z,H,rs,mode,theoryId,seed,massSolar,H0,OmegaM,OmegaLambda
0.25,1,0,67.4,3,black_hole,singularity,42,10,67.4,0.315,0.685
0.5,1.00001,0,67.4,3,black_hole,singularity,42,10,67.4,0.315,0.685
```

**Abrir en:** Excel, Google Sheets, LibreOffice Calc, pandas (`pd.read_csv`), R (`read.csv`).

---

### 2. Snapshot JSON — `cosmos-sim-snapshot-*.json`

Estado instantáneo al exportar. Esquema versión **1.1.0**.

```json
{
  "version": "1.1.0",
  "timestamp": "2026-07-06T21:00:00.000Z",
  "seed": 42,
  "mode": "cosmology",
  "theoryId": "singularity",
  "cosmology": {
    "H0": 67.4,
    "OmegaM": 0.315,
    "OmegaLambda": 0.685,
    "a": 1,
    "z": 0,
    "H": 67.4,
    "t": 0,
    "ageGyr": 13.796,
    "dc": 0
  },
  "blackHole": { "massSolar": 10, "spin": 0, "rsVis": 3 },
  "readouts": { },
  "urlState": { "mode": "cosmology", "seed": "42", "H0": "67.4" },
  "reproducibility": {
    "seed": 42,
    "url": "https://cosmos-simulation.vercel.app/?mode=cosmology&seed=42&H0=67.4"
  },
  "timeSeriesCount": 120,
  "lastSamples": [ ]
}
```

---

### 3. Serie completa JSON — `cosmos-sim-full-*.json`

Incluye metadatos + todas las muestras + snapshot embebido.

```json
{
  "meta": {
    "exportedAt": "2026-07-06T21:00:00.000Z",
    "sampleCount": 120,
    "sampleIntervalS": 0.25,
    "snapshot": { }
  },
  "samples": [ ]
}
```

**Uso:** scripts Python/R, Jupyter, análisis reproducible. Preferir este formato si subes **un solo archivo** a un repositorio.

---

### 4. Informe de validación — `cosmos-validation-*.json`

Comparaciones teórico vs simulado en el momento de exportar.

```json
{
  "exportedAt": "2026-07-06T21:00:00.000Z",
  "mode": "black_hole",
  "seed": 42,
  "validations": [
    {
      "id": "friedmann_h",
      "name": "H(a) Friedmann",
      "theoretical": 67.4,
      "simulated": 67.4,
      "unit": "km/s/Mpc",
      "errorPercent": 0,
      "meta": { "citation": "Friedmann 1922" }
    }
  ],
  "limitations": { },
  "snapshot": { }
}
```

**Criterios en el panel:** ✓ error &lt; 2%, ~ &lt; 10%, ✗ mayor.

---

### 5. Informe de publicación — `cosmos-publication-*.html`

HTML autocontenido (CSS inline). Incluye:

- Metadatos del modo y semilla
- Tabla de validaciones con citas
- Puntuación de madurez N2–N4
- Sección LIGO (si modo binario con historial de strain)
- Notas sobre datos SDSS / CMB Planck
- URL reproducible

**Subir tal cual** a Zenodo, OSF, o adjuntar en un informe de laboratorio. No requiere servidor.

---

### 6. Barridos CSV

**`sweep-H0-YYYY-MM-DD.csv`**

| Columna | Descripción |
|---------|-------------|
| `H0` | Hubble constant (60–80 km/s/Mpc) |
| `H_at_a1` | H(a=1) |
| `ageGyr` | Edad del universo integrada (Gyr) |
| `dc_at_z0` | Distancia comóvil a z=0 (m) |

**`sweep-MBH-YYYY-MM-DD.csv`**

| Columna | Descripción |
|---------|-------------|
| `massSolar` | Masa en M☉ (1–100) |
| `rsVis` | rₛ visual |
| `rsMeters` | rₛ en metros (SI) |
| `hawkingT_K` | Temperatura de Hawking (K) |
| `lifetime_s` | Tiempo de evaporación (s) |
| `lifetime_yr` | Tiempo de evaporación (años) |

---

## Cómo preparar archivos para subirlos

### Entrega académica (informe / TFG / clase)

Paquete mínimo recomendado:

```
mi-experimento-cosmos/
├── README.txt              ← describe qué hiciste y la URL reproducible
├── cosmos-sim-full.json    ← serie + snapshot (un solo archivo)
├── cosmos-validation.json  ← validaciones
├── cosmos-publication.html ← informe legible para el profesor
└── sweep-H0.csv            ← (opcional) barrido paramétrico
```

En `README.txt` incluye:

- Fecha y versión de la simulación (`https://github.com/reeb-dev/cosmos-simulation`)
- Modo, teoría, H₀, Ωₘ, ΩΛ, masa, semilla
- URL reproducible copiada del botón **🔗 Copiar URL reproducible**
- Qué conclusiones sacaste de las validaciones

### Zenodo / OSF / repositorio de datos

| Archivo | Tipo MIME | Descripción en Zenodo |
|---------|-----------|----------------------|
| `cosmos-sim-full-*.json` | `application/json` | Time series + simulation snapshot |
| `cosmos-validation-*.json` | `application/json` | Theoretical vs simulated validation |
| `cosmos-publication-*.html` | `text/html` | Human-readable publication report |
| `cosmos-sim-*.csv` | `text/csv` | Time series for spreadsheets |
| `sweep-*.csv` | `text/csv` | Parameter sweep results |

**No subas** archivos generados por el navegador con rutas locales. Usa solo los descargados desde el panel.

### GitHub (Issues / PR / adjunto en repo)

- JSON y CSV: sube a `docs/datos/` o adjunta en el Issue.
- HTML: válido como artefacto en Releases.
- Tamaño: series &lt; 10 000 puntos ≈ pocos MB en JSON.

---

## Requisitos antes de exportar

1. La simulación debe estar **en marcha** al menos 1–2 s para tener muestras (`sampleCount` &gt; 0).
2. Para validaciones de dilatación: acerca la cámara o envía una sonda.
3. Para comparación LIGO: modo **Choque binario**, preset GW150914, deja correr el inspiral.
4. Para datos SDSS/CMB: modos **Cosmología** o **Universo a escala** (`deep_field`).

---

## API en consola del navegador

```javascript
// Estado y lecturas
CosmosSim.getState()
CosmosSim.getReadouts()
CosmosSim.getValidations()

// Exportar sin descargar (objeto en memoria)
CosmosSim.exportData('json')
CosmosSim.exportData('csv')   // { csv, snapshot }

// Descargar directamente
CosmosSim.downloadData('csv')
CosmosSim.downloadData('json')

// Barridos
CosmosSim.sweepH0({ min: 60, max: 80, points: 15 })
CosmosSim.sweepMass({ min: 1, max: 100, points: 15 })

// Reproducibilidad
CosmosSim.setSeed(42)
CosmosSim.setCosmology({ H0: 67.4, OmegaM: 0.315, OmegaLambda: 0.685 })
```

---

## Auditoría y validación del código

```bash
npm run audit      # 31 checks: modos, i18n, fórmulas, custom formula
npm run validate   # 28 checks numéricos vs referencias analíticas
npm run build      # compila producción
```

---

## Limitaciones (honestas)

| Validado | Solo visual / pedagógico |
|----------|--------------------------|
| H(a), z, d_c, edad ΛCDM | Lensing en pantalla (no ray-tracing GR) |
| rₛ, dilatación √(1−rₛ/r) | Disco de acreción (shader, no MHD) |
| T_Hawking, t_evap | Interior del BH según teoría (ilustrativo) |
| Strain GW inspiral (Peters) | Fusión post-inspiral (fenomenológico) |
| Posiciones SDSS, textura CMB Planck | Fotometría/galaxias no es catálogo completo |

---

## Cita

```bibtex
@software{reeb2026cosmos,
  author = {Reeb, Manuel},
  title = {cosmos-simulation: Interactive black hole and cosmology simulator},
  year = {2026},
  url = {https://github.com/reeb-dev/cosmos-simulation},
  note = {Educational/research exploratory tool}
}
```
