# Alcance y utilidad del proyecto

**cosmos-simulation** es un simulador web interactivo de física astrofísica y cosmología. Combina visualización 3D en tiempo real, fórmulas validadas numéricamente y herramientas de exportación para investigación pedagógica.

---

## ¿Para qué sirve?

| Público | Uso principal |
|---------|---------------|
| **Estudiantes** | Entender agujeros negros, cosmología ΛCDM, ondas gravitacionales y teorías del horizonte de forma visual |
| **Docentes** | Modo aula con parámetros bloqueados, tour 60 s, laboratorio con fórmulas en vivo |
| **Divulgadores** | Vista Gargantua (Interstellar), multiverso, Higgs, cuerdas — escenas cinematográficas |
| **Investigadores exploratorios** | Exportar CSV/JSON, informes de validación, barridos paramétricos, URL reproducible |
| **Desarrolladores** | API `CosmosSim`, motor híbrido extensible, i18n ES/EN |

---

## Qué incluye hoy (v1.2)

### 9 modos de simulación

| Modo | Contenido |
|------|-----------|
| **Agujero negro** | Motor híbrido completo, disco de acreción, lensing, 39 teorías del horizonte |
| **Gargantua (Interstellar)** | Modo cinematográfico dedicado: disco de canto, photon ring, lensing 2,4× |
| **Multiverso** | Burbujas Friedmann con distintos Ωₘ/ΩΛ |
| **Cosmología ΛCDM** | Expansión, redshift, CMB, galaxias |
| **Universo a escala** | Campo profundo, SDSS, CMB Planck, difracción estelar |
| **Choque binario** | Inspiral GW (Peters), coalescencia, ringdown, LIGO GW150914, evaporación Hawking |
| **Choque de galaxias** | Marea, colas tidales, brote estelar, fusión (Vía Láctea–Andrómeda) |
| **Teoría del horizonte** | Selector rápido de teorías destacadas |
| **Choque binario** | Inspiral GW (Peters), fusión, ringdown, comparador LIGO GW150914 |
| **Higgs** | Campo escalar y acoplamiento de masa (pedagógico) |
| **Cuerdas** | Vuelo por cuerdas cósmicas y branas |

### Física implementada

- **Schwarzschild / Kerr:** rₛ, ISCO, esfera de fotones, dilatación temporal, entropía Bekenstein-Hawking
- **Hawking:** temperatura y tiempo de evaporación
- **Friedmann ΛCDM:** H(a), z, q, d_c, edad integrada (RK4 + Simpson)
- **Binario:** masa reducida, strain inspiral (Peters), preset GW150914
- **Lensing:** deflexión analítica + post-proceso visual (estilo Gargantua)

### Herramientas de investigación

- Panel **Investigación** con validación teórico vs simulado (✓ / ~ / ✗)
- Madurez N2–N4 (exportaciones, datos observacionales)
- Exportación CSV, JSON, informe validación, informe HTML publicación
- Barridos H₀ y M_BH
- URL reproducible con semilla
- API en consola: `CosmosSim.getValidations()`, `CosmosSim.exportData()`, etc.

### Datos observacionales (pedagógicos)

- **LIGO GW150914:** plantilla de strain y correlación de forma
- **SDSS:** submuestra de posiciones angulares de galaxias
- **Planck CMB:** textura de temperatura del fondo cósmico

### Internacionalización

- Español e inglés completos (HUD, guías, 8 modos, 39 teorías)

### Calidad y tests

```bash
npm test        # audit + validate + build (59 checks)
npm run audit   # 31 checks estáticos (modos, i18n, fórmulas)
npm run validate # 28 checks numéricos vs referencias analíticas
```

---

## Límites honestos (qué NO es)

| No sustituye | Por qué |
|--------------|---------|
| **SXS / ETK / Einstein Toolkit** | No hay relatividad numérica completa ni merger NR |
| **CAMB / CLASS** | No calcula espectro de potencia CMB ni transfer functions |
| **LOSC / datos LIGO reales** | Comparador educativo con plantilla, no análisis de strain oficial |
| **Catálogo SDSS/GAIA completo** | Submuestra posicional, no fotometría ni redshift observacional |
| **Ray-tracing GR** | Lensing es post-proceso en pantalla, no geodésicas nulas |
| **MHD / hidrodinámica** | Disco de acreción es shader, no simulación de fluidos |

**Conclusión:** herramienta de **enseñanza, divulgación y exploración cualitativa**, no de publicación en revistas de física sin validación externa.

---

## Casos de uso concretos

1. **Clase de relatividad general:** mostrar rₛ, dilatación temporal y cruce del horizonte con distintas teorías.
2. **Seminario de cosmología:** ajustar H₀, Ωₘ, ΩΛ y ver H(t), z, edad del universo en el HUD.
3. **Taller LIGO:** modo binario + GW150914 + exportar comparación de strain.
4. **Proyecto de fin de curso:** exportar `cosmos-validation-*.json` + informe HTML + URL reproducible.
5. **Divulgación:** preset **Vista Gargantua (Interstellar)** para capturas y vídeos.
6. **Prototipo de ideas:** 39 teorías del horizonte como sandbox visual de especulación.

---

## Despliegue

| Plataforma | URL | Estado |
|------------|-----|--------|
| **Vercel** | [cosmos-simulation.vercel.app](https://cosmos-simulation.vercel.app) | Activo (deploy automático) |
| **GitHub Pages** | `https://reeb-dev.github.io/cosmos-simulation/` | Requiere activar Pages en Settings → Pages → GitHub Actions |

---

## Roadmap pendiente

- Tests E2E en navegador (Playwright)
- Code-splitting para reducir bundle > 500 kB
- GIF de demostración en `docs/preview.gif`
- DOI Zenodo al publicar release
- Lensing por geodésicas (más costoso en GPU)
- Perfil GAIA/SDSS ampliado

---

## Cómo citar

```bibtex
@software{reeb2026cosmos,
  author = {Reeb, Manuel},
  title = {cosmos-simulation: Interactive black hole and cosmology simulator},
  year = {2026},
  url = {https://github.com/reeb-dev/cosmos-simulation},
  note = {Educational/research exploratory tool}
}
```
