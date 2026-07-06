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

### GitHub Pages

```bash
npm run deploy:gh
```

Requiere `gh-pages` y ajusta `base` en `vite.config.js` si el repo no está en la raíz del dominio.

## Generar un GIF de demostración

Con [ffmpeg](https://ffmpeg.org) y la simulación en marcha:

```bash
mkdir -p docs
# macOS: graba la ventana con Cmd+Shift+5, luego:
ffmpeg -i grabacion.mov -vf "fps=12,scale=800:-1" -loop 0 docs/preview.gif
```

O usa [Peek](https://github.com/phw/peek) / [LICEcap](https://www.cockos.com/licecap/) para capturar ~15 s del tour y el zoom al horizonte. Después puedes añadir al README: `![Vista previa](docs/preview.gif)`.

## Estructura

- `src/simulation/horizon-theories.js` — metadatos y lecturas en vivo por teoría
- `src/rendering/interior-worlds.js` — mundos 3D interiores
- `src/ui/cosmic-tour.js` — tour automático de 60 s
- `src/lab/theory-lab.js` — experimentos del laboratorio

## Licencia

[MIT](LICENSE) © 2026 Manuel Reeb
