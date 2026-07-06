# ¿Qué hay dentro del agujero negro?

Simulación interactiva 3D que combina un **motor híbrido** (Schwarzschild + Friedmann + N-cuerpos) con **teorías del horizonte de sucesos**: desde predicciones clásicas de la relatividad general hasta modelos especulativos (islas de Hawking, ER=EPR, fuzzball) y ficción científica claramente etiquetada.

**Repositorio:** [github.com/reeb-dev/cosmos-simulation](https://github.com/reeb-dev/cosmos-simulation)

**Demo en vivo:** [cosmos-simulation.vercel.app](https://cosmos-simulation.vercel.app) *(se actualiza tras el deploy en Vercel)*

> **Vista previa:** aún no hay GIF en el repo. Puedes generar uno con las instrucciones al final de este README y guardarlo en `docs/preview.gif`.

## Inicio rápido

Requisitos: Node.js 18+ y npm.

```bash
git clone https://github.com/reeb-dev/cosmos-simulation.git
cd cosmos-simulation
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173).

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo (Vite) |
| `npm run build` | Compila a `dist/` |
| `npm run preview` | Previsualiza la build local |
| `npm run deploy` | Alias de `vite build` (sube con Vercel CLI o el dashboard) |

## Tour guiado (60 s)

1. En el panel **Controles → Simulación**, pulsa **▶ Tour 60s**.
2. En la primera visita verás un overlay de bienvenida (3 pasos, saltable).
3. El tour: reinicia la vista → zoom al agujero negro → cambia 3 teorías → resalta el laboratorio → evento del universo vivo.
4. Cancela con **Esc** o el botón **✕ Cancelar**.

## Controles

| Tecla | Acción |
|-------|--------|
| `?` | Abrir/cerrar guía |
| `R` | Reset total |
| `Espacio` | Pausar / reanudar |
| Zoom al BH | Activar interior según teoría |

Las teorías con **★** son propias del motor o especulativas; **★★** es ficción científica.

## Despliegue

### Vercel (recomendado)

### Si `vercel login` o el token fallan

1. Entra en [vercel.com/new](https://vercel.com/new) con tu cuenta.
2. **Import Git Repository** → elige `reeb-dev/cosmos-simulation`.
3. Deja el preset **Vite** (o detectado automáticamente); build: `npm run build`, output: `dist`.
4. Pulsa **Deploy**. La URL será algo como `https://cosmos-simulation-*.vercel.app`; puedes fijar el dominio `cosmos-simulation.vercel.app` en **Project → Settings → Domains**.

1. Importa el repositorio en [vercel.com](https://vercel.com) o usa la CLI:

```bash
npm run build
npx vercel --prod --yes
```

2. `vercel.json` ya define el framework (Vite) y los rewrites para SPA.

### GitHub Pages (CI automático)

Cada push a `main` despliega vía [GitHub Actions](.github/workflows/deploy-pages.yml). Activa **Pages** en el repo: Settings → Pages → Source: **GitHub Actions**.

```bash
npm run deploy:gh   # despliegue manual alternativo
```

Requiere `gh-pages` y ajusta `base` en `vite.config.js` si el repo no está en la raíz del dominio.

## Roadmap y sugerencias

Ver [SUGERENCIAS.md](SUGERENCIAS.md) para el roadmap completo (SDSS, strain LIGO real, limitaciones peer-review).

## Generar un GIF de demostración

Con [ffmpeg](https://ffmpeg.org) y la simulación en marcha:

```bash
mkdir -p docs
# macOS: graba la ventana con Cmd+Shift+5, luego:
ffmpeg -i grabacion.mov -vf "fps=12,scale=800:-1" -loop 0 docs/preview.gif
```

O usa [Peek](https://github.com/phw/peek) / [LICEcap](https://www.cockos.com/licecap/) para capturar ~15 s del tour y el zoom al horizonte. Después puedes añadir al README: `![Vista previa](docs/preview.gif)`.

## Para investigación

Esta simulación incluye herramientas de **grado exploratorio** (no reemplaza códigos NR, CAMB, CLASS ni observatorios). Úsala para enseñanza, prototipado de ideas y comparaciones cualitativas.

### Qué está validado

| Dominio | Cantidades | Método |
|---------|------------|--------|
| Cosmología ΛCDM | H(a), z, d_c, edad | Friedmann + RK4 / Simpson |
| Schwarzschild | rₛ, dilatación √(1−rₛ/r) | Analítico vs motor |
| Binario GW | μ, dE/dt (Peters), h inspiral | Campo débil, órbita circular |
| Hawking | T_H, t_evap | Fórmulas estándar |

### Qué es solo visual

- Lensing en **espacio de pantalla** (no geodésicas nulas ray-traced)
- Disco de acreción y nebulosas (shaders, no MHD)
- Interiores del BH según teoría (ilustrativos)
- Fusión binaria post-inspiral (fenomenológico, no SXS/ETK)
- Campo galáctico procedural (no catálogo SDSS/GAIA)

### Exportar datos

1. Panel **Controles → Investigación → 📥 Exportar datos (CSV/JSON)**  
   - CSV: serie temporal (t, a, z, H, rₛ, strain, f_GW, fase binaria, teoría, modo, semilla)  
   - JSON: snapshot con parámetros cosmológicos y URL reproducible  
2. **📋 Informe validación**: JSON con comparaciones teórico vs simulado  
3. Barridos: H₀ (60–80) y M_BH (rₛ, T_Hawking, τ_evap) → CSV en descargas

### Reproducibilidad

- Semilla por defecto: **42** (HUD: «Semilla: 42»)  
- URL con estado: `?mode=binary_merger&M1=30&M2=20&H0=70&theory=firewall&seed=42`  
- **🔗 Copiar URL reproducible** en carpeta Investigación

### Modo aula

Para clases: el docente fija escena, teoría y cosmología; los alumnos abren un enlace con controles simplificados.

1. Ajusta modo, teoría y preset cosmológico deseados.
2. En **Controles → Modo aula**, activa **Modo aula** y pulsa **🔗 Copiar enlace alumnos**.
3. Comparte la URL generada, por ejemplo:

```
?classroom=1&lockMode=black_hole&lockTheory=firewall&lockPreset=planck2018
```

| Parámetro | Descripción |
|-----------|-------------|
| `classroom=1` | Activa modo aula |
| `lockMode` | Modo bloqueado (`black_hole`, `cosmology`, `binary_merger`, …) |
| `lockTheory` | Teoría del horizonte bloqueada |
| `lockPreset` | Preset cosmológico bloqueado (`planck2018`, `lcdm`, …) |
| `classRole=teacher` | Vista docente (todos los paneles) |

Los estudiantes ven menos carpetas en la GUI y no pueden cambiar los parámetros bloqueados.

### Preset GW150914 (LIGO)

En **Controles → Choque binario → GW150914 (LIGO) · Abbott+2016** se cargan masas inspiradas en la primera detección de ondas gravitacionales (M₁≈36 M☉, M₂≈29 M☉). Referencia: Abbott et al. (2016), Phys. Rev. Lett. 116, 061102.

### Cómo citar este software

> Reeb, M. (2026). *cosmos-simulation*: Simulación interactiva de agujeros negros y cosmología. Software. https://github.com/reeb-dev/cosmos-simulation

**Zenodo (DOI pendiente):** al publicar un release en Zenodo, sustituye este placeholder:

```bibtex
@software{reeb2026cosmos_zenodo,
  author = {Reeb, Manuel},
  title = {cosmos-simulation: Interactive black hole and cosmology simulator},
  year = {2026},
  publisher = {Zenodo},
  doi = {10.5281/zenodo.XXXXXXX},
  url = {https://github.com/reeb-dev/cosmos-simulation},
  note = {Educational/research exploratory tool; not peer-reviewed physics code}
}
```

### API programática (consola del navegador)

```javascript
CosmosSim.getState()
CosmosSim.getReadouts()
CosmosSim.setCosmology({ H0: 67.4, OmegaM: 0.315, OmegaLambda: 0.685 })
CosmosSim.exportData('json')
CosmosSim.downloadData('csv')
CosmosSim.setSeed(123)
CosmosSim.sweepH0({ points: 15 }).then(console.table)
```

### Cita rápida (sin Zenodo)

```bibtex
@software{reeb2026cosmos,
  author = {Reeb, Manuel},
  title = {cosmos-simulation: Interactive black hole and cosmology simulator},
  year = {2026},
  url = {https://github.com/reeb-dev/cosmos-simulation},
  note = {Educational/research exploratory tool; not a peer-reviewed physics code}
}
```

### Referencias clave (BibTeX)

```bibtex
@article{friedmann1922,
  author = {Friedmann, Alexander},
  title = {Über die Krümmung des Raumes},
  journal = {Zeitschrift für Physik},
  year = {1922}
}
@article{schwarzschild1916,
  author = {Schwarzschild, Karl},
  title = {Über das Gravitationsfeld eines Massenpunktes},
  journal = {Sitzungsberichte der Königlich Preußischen Akademie der Wissenschaften},
  year = {1916}
}
@article{peters1964,
  author = {Peters, P. C. and Mathews, J.},
  title = {Gravitational Radiation from Point Masses in a Keplerian Orbit},
  journal = {Physical Review},
  volume = {131},
  year = {1964}
}
@article{hawking1974,
  author = {Hawking, Stephen W.},
  title = {Black hole explosions?},
  journal = {Nature},
  volume = {248},
  year = {1974}
}
@article{planck2018,
  author = {{Planck Collaboration}},
  title = {Planck 2018 results. VI. Cosmological parameters},
  journal = {A\&A},
  volume = {641},
  pages = {A6},
  year = {2020}
}
```

## Estructura

- `src/research/data-logger.js` — registro de series temporales y exportación CSV/JSON
- `src/research/simulation-seed.js` — RNG con semilla y codificación URL
- `src/research/physics-metadata.js` — citas y metadatos por fórmula/modo
- `src/research/cosmos-api.js` — API `window.CosmosSim`
- `src/ui/research-panel.js` — validación teórico vs sim, barridos, limitaciones
- `src/ui/classroom-mode.js` — modo aula con bloqueos por URL
- `src/rendering/galaxy-field.js` — campo galáctico con redshift, Hubble flow y cúmulos
- `src/rendering/interior-worlds.js` — mundos 3D interiores
- `src/ui/cosmic-tour.js` — tour automático de 60 s
- `src/lab/theory-lab.js` — experimentos del laboratorio

## Roadmap de realismo

### Implementado (v1.1+)

- Campo galáctico procedural (espiral, elíptica, irregular) con sprites canvas y LOD
- Redshift cosmológico y flujo de Hubble visual en galaxias
- Cúmulos galácticos y banda de la Vía Láctea
- Estrellas OBAFGKM con IMF (predominio de enanas M) y nebulosas de emisión
- Fondo CMB tenue (relicto z ~ 1100)
- Línea temporal cosmológica en el laboratorio (inflación → Λ) y edad del universo (Friedmann)
- 5 teorías nuevas: inflación, materia oscura, energía oscura, cuerdas cósmicas, rebote LQG
- Lensing con hint de radio de Einstein θ_E ∝ rₛ/d
- Disco de acreción con gradiente T ∝ r⁻³/⁴ (Shakura-Sunyaev)
- Strain GW binario más físico (h ∝ GMμ/c²r · v²/c²)
- Toggle Realismo: estándar vs cinemático
- Aceleración por Λ en modo multiverso

### Pendiente (honesto)

- Catálogo de galaxias reales (SDSS/GAIA) en lugar de solo procedural
- Lensing ray-traced por geodésicas nulas (no solo post-proceso en pantalla)
- Rotación curva de galaxias con perfil de densidad NFW para materia oscura
- Simulación hidrodinámica del disco (no solo shader)
- CMB con anisotropías reales del mapa Planck
- Merger tree cosmológico completo (no solo burbujas estáticas)
- GPU compute para N-cuerpos a escala galáctica

### Cómo ver las galaxias

1. Modo **Cosmología ΛCDM** (mejor vista) o **Agujero negro** con zoom alejado.
2. Aleja la cámara (rueda) hasta ver el campo exterior; las galaxias aparecen como manchas espirales/elípticas.
3. Activa **Realismo → Cinemático** para el doble de galaxias y nebulosas más visibles.
4. Panel **Laboratorio**: línea temporal y edad cósmica en Gyr.
5. Teorías **Materia oscura** / **Energía oscura** en el selector de horizonte para lecturas en vivo.

## Licencia

[MIT](LICENSE) © 2026 Manuel Reeb
