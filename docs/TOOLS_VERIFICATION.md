# Verificación de herramientas integradas

Revisión realizada el 13/10/2026 sobre la rama `main` de cada repositorio.

> **Limitación**: desde el entorno de desarrollo no fue posible acceder a `*.github.io` (bloqueo de red). Las URLs proceden de evidencia en los repositorios, **no de una comprobación en vivo**. Deben abrirse manualmente antes de fusionar (ver checklist).

| Herramienta | Repositorio (commit) | Finalidad verificada | URL pública | Evidencia de la URL | Comprobación en vivo |
|---|---|---|---|---|---|
| SIAF-CMO Respiratorio | `ramonmorillo/cmorespiratorio` (3f9fa58) | Estratificación CMO-MAPEX del paciente respiratorio; prioridad P1–P3; necesidades; intervenciones; informe | https://ramonmorillo.github.io/cmorespiratorio/ | README (publicación en Pages) y `<base href="/cmorespiratorio/">` | ☐ Pendiente |
| MAPEX-ADHEFAR Hub | `ramonmorillo/adhefarmapexhub` (8a37bd6) | Hub de la Guía MAPEX-ADHEFAR: PDC/MPR, checklists, guion ADHEFAR-EM, clasificador CMO, casos, implantación | https://ramonmorillo.github.io/adhefarmapexhub/ | `.github/workflows/pages.yml` (deploy de la raíz) | ☐ Pendiente |
| RxPlain | `ramonmorillo/rxplain` (ae10fc8) | Infografía de tratamiento para el paciente, revisable por el farmacéutico; búsqueda opcional CIMA/AEMPS | https://ramonmorillo.github.io/rxplain/ | Catálogo de SIAF-CMO (`index.html`, entrada CLI-M-008, estado «operativo») | ☐ Pendiente |
| EvidenceGap Radar | `ramonmorillo/evidencegap-radar` (98386a1) | Paisaje de evidencia PICO-lite con PubMed y ClinicalTrials.gov | https://ramonmorillo.github.io/evidencegap-radar/ | Catálogo de SIAF-CMO (INV-CMO-009) y `about.html` | ☐ Pendiente |

Enlaces profundos usados en «¿Qué necesitas hacer hoy?»: `adhefarmapexhub/herramientas.html` y `adhefarmapexhub/modelo.html` (archivos presentes en el repositorio).

## Dependencias externas de las herramientas (no de neumoCMO)

- **EvidenceGap Radar** consulta PubMed/ClinicalTrials.gov a través de un Cloudflare Worker propio de esa herramienta.
- **RxPlain** puede consultar CIMA/AEMPS de forma opcional.

## Clasificación CMO propuesta (pendiente de validación)

| Herramienta | C | M | O | Fundamento |
|---|---|---|---|---|
| SIAF-CMO Respiratorio | ● | | | La estratificación es el eje de la dimensión Capacidad en CMO-MAPEX |
| MAPEX-ADHEFAR Hub | ● | ● | ● | Aborda las tres dimensiones (clasificador de barreras CMO) |
| RxPlain | | ● | | Clasificación ya asignada en el catálogo de SIAF-CMO |
| EvidenceGap Radar | ● | ● | ● | Clasificación ya asignada en el catálogo de SIAF-CMO |

**Incoherencia a resolver**: el Hub ADHEFAR define C/M/O como barreras del paciente (habilidades, creencias, entorno), mientras que la landing usa la lectura de CMO-MAPEX como modelo de atención (estratificar, alinear objetivos, seguimiento longitudinal). Conviene fijar una única definición.
