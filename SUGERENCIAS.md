# Sugerencias y roadmap

Documento de ideas para evolucionar **cosmos-simulation** hacia un entorno útil en aula e investigación exploratoria.

## Implementado recientemente

- **Modo aula** — bloqueo de escena/teoría/cosmología vía URL (`?classroom=1&lockMode=...`)
- **Preset GW150914** — parámetros inspirados en Abbott et al. (2016), detección LIGO
- **Panel de investigación** — validación teórico vs simulación, exportación CSV/JSON
- **Campo galáctico procedural** — redshift, flujo de Hubble, cúmulos
- **GitHub Actions** — despliegue automático a GitHub Pages (`.github/workflows/deploy-pages.yml`)

## Próximas mejoras sugeridas

### Datos reales

| Idea | Descripción | Dificultad |
|------|-------------|------------|
| Catálogo SDSS | Importar posiciones/colores de galaxias reales (muestra) | Alta |
| Mapa CMB Planck | Textura de anisotropías del fondo cósmico | Media |
| Strain LIGO real | Importar serie temporal GW150914 (HDF5/CSV) y superponer | Media |
| Catálogo GAIA | Estrellas con paralaje y magnitud absoluta | Alta |

### Física y visual

| Idea | Descripción |
|------|-------------|
| Lensing por geodésicas | Ray-tracing de luz alrededor del BH (no solo post-proceso) |
| Perfil NFW | Curva de rotación galáctica con halo de materia oscura |
| Simulación NR | Inspiral post-merger con datos SXS/ETK (muy costoso) |
| Kerr métrica completa | Frame dragging y ergosfera visual |

### Aula e investigación

| Idea | Descripción |
|------|-------------|
| Cuestionarios embebidos | Preguntas tras el tour guiado |
| Informes PDF | Exportar validación + gráficos en un solo archivo |
| DOI Zenodo | Archivar releases con metadatos para citación académica |
| Modo examen | Temporizador + bloqueo total de controles avanzados |

## Limitaciones honestas (no grado peer-review)

Esta simulación **no sustituye**:

- Códigos de relatividad numérica (SXS, ETK, Einstein Toolkit)
- Boltzmann codes (CAMB, CLASS) para CMB y estructura a gran escala
- Pipelines de LIGO/Virgo/KAGRA para análisis de ondas gravitacionales
- Catálogos observacionales completos (SDSS, DESI, Euclid)

El lensing es **post-proceso en pantalla**. Los interiores del agujero negro son **escenas teóricas ilustrativas**. El merger binario usa **Peters + modelos fenomenológicos**, no simulación NR completa.

## Cómo contribuir

1. Abre un issue describiendo la mejora y el caso de uso (aula, divulgación, prototipo).
2. Para datos reales, indica la fuente y licencia (SDSS, LIGO Open Science Center, etc.).
3. Mantén separado lo **validado numéricamente** de lo **solo visual**.

## Referencias útiles

- Abbott, B. P. et al. (2016). *Observation of Gravitational Waves from a Binary Black Hole Merger.* Phys. Rev. Lett. 116, 061102. [GW150914]
- Planck Collaboration (2020). Planck 2018 results. VI. Cosmological parameters. A&A 641, A6.
- Peters, P. C. (1964). Gravitational Radiation from Point Masses in a Keplerian Orbit. Phys. Rev. 131.
