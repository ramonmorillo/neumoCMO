# Biblioteca Respiratoria CMO · guía de mantenimiento

## Archivos

| Archivo | Función |
|---|---|
| `biblioteca.html` | Página de la biblioteca |
| `assets/data/recursos.json` | **Única fuente de datos**: taxonomías y recursos |
| `assets/js/library/validate.js` | Validación (campos, taxonomías, URL, fechas, duplicados) |
| `assets/js/library/filter.js` | Búsqueda, filtros combinables, facetas, parámetros de URL, elegibilidad para la hoja |
| `assets/js/library/sheet.js` | HTML de la hoja educativa |
| `assets/js/library/qr.js` | Envoltorio del generador de QR local |
| `assets/js/library/templates.js` | Plantillas de tarjetas, filtros y selección |
| `assets/js/library/main.js` | Carga, eventos y estado de la página |
| `assets/css/library.css` | Estilos de pantalla e impresión |
| `assets/vendor/qrcode-generator/` | qrcode-generator 1.4.4 (MIT), sin modificar. SHA-256 `18ae399f…bf1780` |
| `scripts/validate-resources.mjs` | `npm run validate:resources` |
| `scripts/check-links.mjs` | `npm run check:links [-- --write] [-- --probes]` |
| `scripts/link-probes.json` | URL candidatas que se comprueban pero **no** se muestran |
| `scripts/symbaloo-audit.mjs` | `npm run audit:symbaloo` |
| `AUDITORIA_RECURSOS.md` | Trazabilidad de la selección |

## Añadir un recurso

1. Añadir un objeto a `resources` en `recursos.json`:

```json
{
  "id": "slug-unico",
  "name": "Nombre visible",
  "description": "Para qué sirve en consulta (una o dos frases verificables).",
  "organization": "Organización responsable",
  "url": "https://…",
  "pathologies": ["asma"],
  "categories": ["educacion-sanitaria"],
  "audiences": ["paciente"],
  "format": "documento",
  "language": "es",
  "status": "pendiente",
  "lastChecked": null,
  "contentUpdated": null,
  "commercial": { "status": "no-evaluada", "note": "" },
  "symbalooTile": null,
  "foundVia": "Cómo se localizó"
}
```

2. `npm run validate:resources` (también lo ejecuta la CI).
3. Abrir un PR: el flujo **Comprobación de enlaces** comprobará la URL y mostrará su título.
4. Si el título corresponde al recurso, cambiar a `"status": "verificado"` con `"lastChecked": "AAAA-MM-DD"`. También puede ejecutarse `npm run check:links -- --write` en local y revisar el diff.

No hace falta tocar HTML, CSS ni JavaScript. Para añadir una opción de filtro (p. ej., un idioma), basta con añadirla a `taxonomies`.

## Estados

| Estado | Significado | Comportamiento |
|---|---|---|
| `verificado` | El enlace respondió 2xx y el título corresponde (requiere `lastChecked`) | Botón «Abrir recurso»; seleccionable para la hoja si es para paciente o cuidador |
| `pendiente` | Sin comprobación concluyente | Visible con «Enlace sin verificar»; no seleccionable |
| `no-disponible` | 404/410 o retirado | Oculto por defecto (filtro «Estado del enlace») |

## Hoja educativa

- Solo recursos `verificado` dirigidos a `paciente` o `cuidador`.
- Selección manual, sin recomendaciones automáticas ni campos de datos del paciente.
- La selección se guarda en `sessionStorage` (solo identificadores de recursos) y se borra al cerrar la pestaña.
- Los QR se generan en el navegador (sin servicios externos). La E2E decodifica cada QR y comprueba que coincide con la URL.
- La impresión usa `@media print`: solo la hoja, en A4. «Guardar como PDF» del navegador genera el PDF localmente.

## Compartir una búsqueda

Los filtros se reflejan en la URL, por ejemplo `biblioteca.html?patologia=epoc&categoria=cuestionarios`. La landing usa `biblioteca.html?categoria=tecnica-inhalatoria`.
