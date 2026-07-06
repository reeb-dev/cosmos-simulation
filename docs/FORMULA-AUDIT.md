# Auditoría de fórmulas — CosmosSim

Revisión completa del registro (`src/physics/formula-registry.js`) frente a fórmulas documentadas, usadas en simulación y validadas en `scripts/validate-formulas.mjs`.

**Fecha:** julio 2026  
**Total en registro:** 36 fórmulas habilitadas (+ custom en laboratorio)

---

## Resumen ejecutivo

| Área | Estado | Notas |
|------|--------|-------|
| Agujero negro (Schwarzschild/Kerr) | ✅ Completo | `kerr_isco` corregido (bug ×2 histórico) |
| Hawking / cuántica | ✅ Completo | T_H, dM/dt, L, t_evap, τ_Page, S_BH, bits, cota Bekenstein, κ, λ_peak |
| Cosmología ΛCDM | ✅ Completo | H, q, ρ_c, D_H, z, d_c, edad |
| Lensing | ⚠️ Parcial | Deflexión débil registrada; shader usa heurística |
| Disco de acreción | ✅ Añadido | `disk_temperature` Shakura-Sunyaev pedagógico |
| Ondas gravitacionales | ✅ Añadido | Peters, strain, chirp, QNM |
| Cuerdas / especulativo | ✅ Simbólico | `string_tension` marcado como simbólico |

---

## Fórmulas Hawking añadidas (julio 2026)

| ID | Fórmula | Referencia |
|----|---------|------------|
| `hawking_mass_loss_rate` | \|dM/dt\| = ℏc⁴/(15360πG²M²) | Hawking 1974 |
| `hawking_luminosity` | L = c²\|dM/dt\| | Hawking 1974 |
| `hawking_page_time` | τ_Page = t_evap/10 | Page 1993 |
| `hawking_horizon_area` | A = 4πrₛ² | Hawking 1974 |
| `hawking_peak_wavelength` | λ_peak = b/T_H (Wien) | Planck / Hawking |
| `hawking_surface_gravity` | κ = c⁴/(4GM), T_H = ℏκ/(2πck_B) | Hawking 1974 |
| `hawking_information_bits` | N = S/(k_B ln 2) | Bekenstein-Hawking |
| `bekenstein_bound` | S ≤ 2πk_B E R/(ℏc) | Bekenstein 1981 |

---

## Fórmulas añadidas en auditoría anterior

| ID | Fórmula | Uso en el proyecto |
|----|---------|-------------------|
| `disk_temperature` | T ∝ (3GMṁ/8πσr³)^¼ | Shader disco, Gargantua audit |
| `reduced_mass` | μ = m₁m₂/(m₁+m₂) | Binario, LIGO GW150914 |
| `chirp_mass` | ℳ = (m₁m₂)^(3/5)/(m₁+m₂)^(1/5) | Binario, panel investigación |
| `gw_energy_loss` | dE/dt Peters | `binary-black-holes.js` inspiral |
| `gw_strain_inspiral` | h ~ (4Gμ/c²r)(v/c)² | Binario, research panel |
| `gw_frequency` | f_GW ≈ 2f_orb | Chirp binario |
| `qnm_frequency` | f_QNM Berti et al. | Ringdown post-fusión |

---

## Fórmulas ya presentes (validadas)

- `schwarzschild_rs`, `isco`, `photon_sphere`, `kerr_isco`
- `time_dilation`, `tidal_force`
- `hawking_temperature`, `hawking_lifetime`, `hawking_mass_loss_rate`, `hawking_luminosity`
- `hawking_page_time`, `hawking_horizon_area`, `hawking_peak_wavelength`, `hawking_surface_gravity`
- `hawking_information_bits`, `bekenstein_entropy`, `bekenstein_bound`
- `lensing_deflection` (campo débil; no es el lensing en pantalla)
- `friedmann_H`, `friedmann_q`, `critical_density`, `hubble_distance`
- `redshift`, `comoving_distance`, `universe_age`
- `kepler_velocity`, `escape_velocity`, `orbital_period`
- `string_tension` (simbólico)

---

## Aproximaciones documentadas (no errores)

| Fórmula | Limitación |
|---------|------------|
| Esfera de fotones `1.5 rₛ` | Exacta Schwarzschild; Kerr depende del spin |
| Dilatación `√(1−rₛ/r)` | No reproduce dilatación Kerr extremal (~60 000× Miller) |
| Disco T | ṁ fijo pedagógico (1×10¹⁷ kg/s); no MHD |
| Strain GW | Campo débil; fusión usa modelo fenomenológico |
| QNM | Aproximación Berti l=m=2; no NR completa |
| Lensing shader | Post-proceso 2D; no geodésicas Kerr (ver `GARGANTUA-AUDIT.md`) |

---

## Fórmulas fuera del registro (intencional)

- Experimentos del laboratorio (`theory-lab.js`): Page time, ER=EPR, rebote Planck — son **experimentos**, no fórmulas HUD persistentes.
- Interior de horizonte: lecturas por teoría en `horizon-theories.js` (especulación/ficción).
- Shader lensing: parámetros heurísticos en `lensing-pass.js`.

---

## Validación automática

```bash
npm run validate    # Referencias analíticas + finitud
npm run audit       # Cobertura estática del registro
npm run validate:gargantua  # Preset Interestelar
npm test            # Suite completa + build
```

---

## Referencias clave

- Bardeen, Press, Teukolsky (1972) — ISCO Kerr
- Peters (1964) — Radiación GW orbital
- Hawking (1974); Page (1976) — Radiación y evaporación
- Berti et al. — Cuasi-modos normales (ringdown)
- Shakura & Sunyaev (1973) — Disco de acreción delgado
- Friedmann (1922); Planck Collaboration (2018) — Cosmología
