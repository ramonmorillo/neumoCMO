# neumoCMO

Entorno digital de apoyo a la consulta del farmacéutico de hospital que atiende a pacientes con enfermedades respiratorias, basado en la metodología **CMO** (Capacidad, Motivación y Oportunidad).

neumoCMO es una **landing estática** que centraliza herramientas, recursos y futuras funcionalidades. No incorpora algoritmos clínicos propios: enlaza a herramientas existentes sin modificar su lógica.

## Herramientas integradas (v0.1.0)

| Herramienta | Finalidad | Acceso |
|---|---|---|
| SIAF-CMO Respiratorio | Estratificación CMO del paciente respiratorio (P1–P3) | <https://ramonmorillo.github.io/cmorespiratorio/> |
| MAPEX-ADHEFAR Hub | Medición y mejora de la adherencia en consultas externas | <https://ramonmorillo.github.io/adhefarmapexhub/> |
| RxPlain | Infografías de tratamiento para el paciente | <https://ramonmorillo.github.io/rxplain/> |
| EvidenceGap Radar | Paisaje de evidencia (PubMed + ClinicalTrials.gov) | <https://ramonmorillo.github.io/evidencegap-radar/> |

El origen de cada URL está documentado en [`docs/TOOLS_VERIFICATION.md`](docs/TOOLS_VERIFICATION.md).

## Biblioteca Respiratoria CMO (v0.2.0)

`biblioteca.html`: recursos externos seleccionados con búsqueda y filtros combinables (patología, destinatario, categoría, formato, idioma y estado del enlace), distinción entre herramientas propias y recursos externos, y la función **«Preparar recursos para mi paciente»**, que genera una hoja imprimible con códigos QR creados en el navegador. Los datos están en [`assets/data/recursos.json`](assets/data/recursos.json). Mantenimiento: [`docs/LIBRARY.md`](docs/LIBRARY.md). Trazabilidad: [`AUDITORIA_RECURSOS.md`](AUDITORIA_RECURSOS.md).

## Uso local

```bash
npm ci                       # única dependencia de desarrollo: jsqr (pruebas de QR)
npm test                     # pruebas unitarias y de estructura (Node ≥ 22)
npm run validate:resources   # valida recursos.json
npm run check:links          # comprueba enlaces (requiere Internet)
npm run serve     # http://localhost:8080 (los módulos ES requieren servidor HTTP)
npm run test:e2e  # recorrido en Chromium escritorio + móvil (requiere Playwright)
```

## Publicación

GitHub Pages mediante `.github/workflows/pages.yml` al hacer push a `main`. Requiere activar en *Settings → Pages → Source: GitHub Actions*. URL prevista: <https://ramonmorillo.github.io/neumoCMO/>.

## Documentación

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): estructura y cómo ampliar.
- [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md): reglas editoriales.
- [`docs/TOOLS_VERIFICATION.md`](docs/TOOLS_VERIFICATION.md): trazabilidad de herramientas y URLs.

## Limitaciones de uso

Herramienta de apoyo profesional: no diagnóstica, no prescriptiva y no sustitutiva del juicio clínico. No es un producto sanitario certificado y está pendiente de validación asistencial. No contiene ni recoge datos de pacientes.

Autoría: Ramón Morillo · 2026
