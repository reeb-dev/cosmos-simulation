# Auditoría física — Gargantua vs *Interestelar*

Investigación basada en:

- James, von Tunzelmann, Franklin, Thorne — *Gravitational Lensing by Spinning Black Holes in Astrophysics, and in the Movie Interstellar* ([arXiv:1502.03808](https://arxiv.org/abs/1502.03808))
- Thorne — *The Science of Interstellar* (2014)
- *Inspiral into Gargantua* (2016) — masa ~10⁸ M☉, spin extremal para dilatación temporal

---

## Parámetros de Gargantua en la película

| Parámetro | Física narrativa (Miller, dilatación ~60 000×) | Visual en pantalla (DNGR) | Simulador (preset actual) |
|-----------|--------------------------------------------------|---------------------------|---------------------------|
| **Masa** | ~10⁸ M☉ | ~10⁸ M☉ (escala en render) | **55 M☉** (escala visual del sim) |
| **Spin a/M** | ≈ 1 − 1,3×10⁻¹⁴ (casi extremal) | **0,6** (reducido por Nolan/Thorne) | **0,6** (alineado al visual) |
| **ISCO** | ≈ **0,50 rₛ** | ≈ **1,91 rₛ** | **1,91 rₛ** (Kerr, spin 0,6) |
| **Disco inner (sim)** | N/A | N/A | **2,0 rₛ** (~4 % sobre ISCO) |
| **Anillo de fotones** | Geodésicas Kerr (DNGR) | DNGR | **1,5 rₛ** (fórmula Schwarzschild) |
| **Lensing** | Ray-tracing métrica Kerr completa | DNGR | Post-proceso 2D heurístico |
| **Doppler / redshift** | Calculado en DNGR | **Omitido** en la versión final | Aproximación en shader |

---

## Fórmulas del registro — ¿son correctas?

| Fórmula | Estado | Notas |
|---------|--------|-------|
| `rₛ = 2GM/c²` | ✅ Correcta | Coincide con Schwarzschild |
| ISCO Schwarzschild `3 rₛ` | ✅ Correcta | Solo válida para spin 0 |
| ISCO Kerr (Bardeen 1972) | ✅ Corregida | Había un **bug ×2**; ahora `r_ISCO = (rₛ/2)(3+Z₂−√…)` |
| Esfera de fotones `1,5 rₛ` | ⚠️ Aproximada | Exacta para Schwarzschild; en Kerr las órbitas de fotones dependen del spin |
| Dilatación `√(1−rₛ/r)` | ⚠️ Schwarzschild | No reproduce dilatación ~60 000× de Miller (requiere Kerr extremal + órbita casi en horizonte) |
| Deflexión `α = 4GM/(c²b)` | ✅ Correcta (débil) | **No** es la que usa el shader de lensing en pantalla |
| Temperatura disco `T ∝ (M/r³)^¼` | ⚠️ Pedagógica | Shakura-Sunyaev simplificado; no MHD |

---

## Hallazgos críticos

### 1. Bug corregido: `kerr_isco`

La implementación multiplicaba por `rₛ` el factor de Bardeen sin dividir por 2. Para spin 0 devolvía **6 rₛ** en lugar de **3 rₛ**.

### 2. Disco inner `2,55 rₛ` era incorrecto para el spin declarado

Con spin **0,99**, el ISCO Kerr real es ≈ **0,73 rₛ** — el disco empezaba ~3,5× demasiado lejos.

Con spin **0,6** (película), ISCO ≈ **1,91 rₛ** — ahora `diskInnerMul = 2,0` está ~4 % por encima del ISCO (razonable para un disco de acreción).

### 3. Spin 0,99 no es el de *Interestelar* en pantalla

Thorne documenta que el spin narrativo debe ser casi extremal para la dilatación de Miller, pero **Nolan y Franklin bajaron el spin visual a 0,6** para que el público no se confundiera con sombras y múltiples imágenes del disco.

### 4. Masa 55 M☉ vs 10⁸ M☉

**No es un error de fórmula** — es compromiso de escala: a 10⁸ M☉ el `rₛ` visual sería inmanejable en el canvas. Las fórmulas SI en el HUD (`rₛ` en metros) siguen usando la masa del slider.

### 5. Lensing y arcos

La película resolvió **geodésicas nulas en métrica Kerr** (código DNGR). Este proyecto usa:

- Distorsión UV en pantalla (`lensing-pass.js`)
- Reflexión heurística para arcos superior/inferior
- Multiplicador `lensStrengthMul ≈ 2,8`

Esto **imita** el aspecto pero **no** satisface las ecuaciones de Einstein.

---

## Conclusión

| Pregunta | Respuesta |
|----------|-----------|
| ¿`rₛ = 2GM/c²` es correcta? | **Sí** |
| ¿El preset reproduce la física de Interestelar? | **Parcialmente** — spin 0,6 y disco ~ISCO alineados al **visual** de la película; masa y lensing son aproximaciones |
| ¿Reproduce la narrativa de Miller (dilatación extrema)? | **No** — haría falta spin ≈ 1 y órbitas a ~0,5 rₛ con métrica Kerr completa |
| ¿Las fórmulas del HUD son falsas? | **No**, salvo el bug ya corregido en `kerr_isco` |
| ¿El modo puede llamarse “como Interestelar”? | **Sí como inspiración visual**; **no** como réplica del ray-tracing GR de Double Negative |

---

## Validación automática

```bash
npm run validate:gargantua
```

Comprueba ISCO Kerr, coherencia preset/modo, y emite **warnings** documentados para masa visual y lensing heurístico.

---

## Referencias

- [arXiv:1502.03808](https://arxiv.org/abs/1502.03808) — Lensing en Interestelar
- [doi:10.1088/0264-9381/33/15/155002](https://doi.org/10.1088/0264-9381/33/15/155002) — Inspiral into Gargantua
- Bardeen, Press, Teukolsky (1972) — ISCO Kerr
