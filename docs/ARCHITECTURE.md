# Arquitectura de neumoCMO

## Principios

1. **Estático y sin backend**: HTML + CSS + JavaScript (módulos ES) servidos por GitHub Pages. Sin API de pago, sin Supabase, sin analítica, sin cookies.
2. **Datos separados de la presentación**: todo el contenido vive en `assets/js/data/catalog.js`. La interfaz se genera a partir de él.
3. **Sin dependencias en tiempo de ejecución** ni recursos de terceros (fuentes, CDN). La tipografía usa la pila del sistema. La única librería de terceros (generador de QR, MIT) se sirve desde el propio repositorio.
4. **Las herramientas se integran por enlace**, nunca copiando ni modificando su lógica.

## Estructura

```
index.html                       Landing: estructura semántica y pie legal
biblioteca.html                  Biblioteca Respiratoria CMO (ver docs/LIBRARY.md)
assets/data/recursos.json        Catálogo de recursos externos (datos editables)
assets/js/library/               Módulos de la biblioteca (validación, filtros, hoja, QR)
assets/js/components/nav.js      Menú móvil compartido
assets/vendor/qrcode-generator/  Generador de QR local (MIT)
assets/img/icons.svg             Sprite de iconos compartido
assets/
  css/tokens.css                 Paleta, tipografía, espaciado (variables CSS)
  css/main.css                   Componentes, secciones y responsive
  js/data/catalog.js             Herramientas, tareas, dimensiones CMO, recursos, hoja de ruta
  js/utils.js                    Funciones puras (escape, normalización, filtro)
  js/components/templates.js     Plantillas HTML de cada componente
  js/main.js                     Renderizado e interacción (menú, búsqueda, filtros)
  img/favicon.svg                Marca propia (sin logotipos institucionales)
tests/                           node:test — integridad del catálogo y del HTML
scripts/e2e-smoke.mjs            Recorrido en Chromium (escritorio y móvil)
.github/workflows/               CI y despliegue en Pages
```

## Flujo de renderizado

`index.html` contiene contenedores vacíos con `data-render="<sección>"`. `main.js` importa el catálogo y rellena cada contenedor con las plantillas de `templates.js`. Todo texto interpolado pasa por `escapeHtml`.

## Cómo ampliar

| Quiero… | Edito |
|---|---|
| Añadir una herramienta | Objeto nuevo en `TOOLS` (campos obligatorios validados por `tests/catalog.test.mjs`) |
| Añadir una tarea de consulta | `TASKS` (debe apuntar a una herramienta existente o a la hoja de ruta) |
| Añadir un recurso | `RESOURCES` |
| Activar una funcionalidad futura | Crear su página/módulo, moverla de `ROADMAP` a `TOOLS` y actualizar el test de hoja de ruta |
| Añadir un icono | `<symbol id="i-nombre">` en `assets/img/icons.svg` (el test comprueba que existe) |
| Añadir un recurso a la biblioteca | `assets/data/recursos.json` (ver `docs/LIBRARY.md`) |
| Cambiar la paleta | `assets/css/tokens.css` |

Las futuras funcionalidades internas (Next Best Action, Consulta Builder, técnica inhalatoria, seguimiento longitudinal) pueden añadirse como páginas o módulos dentro de `assets/js/features/<nombre>/` sin alterar la landing.

## Accesibilidad

Enlace «Saltar al contenido», jerarquía de encabezados con un único `h1`, secciones con `aria-labelledby`, menú móvil con `aria-expanded` y cierre con Escape, filtros con `aria-pressed`, recuento de resultados en región `aria-live`, foco visible, objetivos táctiles ≥ 40 px, `prefers-reduced-motion` respetado y aviso de apertura en pestaña nueva para lectores de pantalla.
