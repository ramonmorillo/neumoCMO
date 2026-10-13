# Auditoría de recursos · Biblioteca Respiratoria CMO

Fecha de la auditoría: **13/10/2026** · Responsable de la revisión de contenido: pendiente de asignar.

## 1. Método y limitaciones

| Paso | Qué se hizo | Limitación |
|---|---|---|
| Fuente inicial | Webmix de Symbaloo [asma-para-pacientes](https://www.symbaloo.com/mix/asma-para-pacientes). | Desde el entorno de desarrollo **no fue posible abrir Symbaloo** (red bloqueada) y la búsqueda web no indexa sus mosaicos. Se añadió `npm run audit:symbaloo`, que intenta extraer las URL desde GitHub Actions (ver §5). |
| Localización | Búsqueda web (índice de buscador) de cada mosaico y de recursos para EPOC, bronquiectasias, fibrosis pulmonar y apnea del sueño. | El buscador devuelve URL indexadas, **no comprueba que respondan** ni su contenido actual. |
| Verificación | `npm run check:links` (código HTTP, URL final y `<title>`), ejecutado en GitHub Actions con acceso a Internet. | Un 200 confirma accesibilidad y título, **no la calidad clínica ni la vigencia** del contenido. Algunos sitios bloquean peticiones automáticas (403): se tratan como no concluyentes. |
| Revisión de contenido | — | **Pendiente**. Ningún recurso tiene revisión clínica del contenido; la etiqueta «verificado» se refiere solo al enlace. |

Reglas aplicadas: no se inventan URL, fechas, avales ni propiedades clínicas. Las fechas de actualización del contenido quedan como «desconocido» mientras no se lean en el propio recurso. La vinculación comercial se marca «no evaluada» salvo que se haya identificado.

## 2. Criterios de inclusión

1. **Pertinencia**: útil para la atención farmacéutica, la educación sanitaria o el seguimiento del paciente respiratorio.
2. **Fiabilidad de la fuente**: sociedades científicas, organismos públicos, hospitales del sistema sanitario y asociaciones de pacientes. Material de la industria solo con vinculación comercial declarada y si no existe alternativa independiente.
3. **Accesibilidad**: acceso libre, sin registro, preferentemente en español.
4. **Trazabilidad**: organización responsable identificable y URL original (no copias en agregadores cuando existe la original).
5. **Cobertura**: no solo asma; se priorizan huecos de EPOC, bronquiectasias, fibrosis pulmonar y apnea del sueño.
6. **No duplicar herramientas propias**: lo que cubren SIAF-CMO Respiratorio, MAPEX-ADHEFAR Hub, RxPlain o EvidenceGap Radar se enlaza como herramienta propia.

Se prioriza la calidad frente al volumen: 25 recursos candidatos iniciales, más 3 confirmados por las sondas (28).

## 3. Correspondencia con los mosaicos del Symbaloo

| Mosaico solicitado | Resultado | Recurso en la biblioteca |
|---|---|---|
| ¿Qué es el asma? — SEPAR | Candidato localizado; correspondencia **sin confirmar** | `salamanca-que-es-asma`, `separ-pacientes` |
| Autocuidados — SEPAR | Candidato localizado (SEPAR + SEPARpacientes según el buscador); correspondencia sin confirmar | `separ-autocuidado-asma` |
| Libros para pacientes CON ASMA | **No localizado**. Se identificó un cuaderno alternativo (AAFA) | `aafa-libro-asma-adultos` (alternativa) |
| Síntomas del asma — PortalCLÍNIC | URL construida según la estructura conocida del portal; requiere comprobar el título | `clinic-asma-sintomas` |
| Guía para personas con asma | **Ambiguo**: varios documentos posibles. El candidato (GEMA para pacientes, copia de la AEP) ya no está disponible | `gema-pacientes` (no disponible) |
| En Asma el Cero Cuenta | El dominio enasmaelcerocuenta.es redirige al portal de pacientes de AstraZeneca | **No incluido** (vinculación comercial; ver §5) |
| Asociación de Pacientes FENAER | Identificada | `fenaer` |
| Vídeos de dispositivos inhaladores | Sin equivalente en español verificable. Alternativa en inglés | `asthma-lung-uk-videos` |
| Sistemas de inhalación | **No localizado** | — |
| Limpieza y mantenimiento de inhaladores | Correspondencia **parcial**: la pregunta PreEvid trata la desinfección de cámaras reutilizadas entre pacientes | `murciasalud-limpieza-camara` |
| Guías de dispositivos | **No localizado** | — |
| InhalCheck | **No localizado**. El buscador solo devuelve In-Check DIAL (dispositivo comercial de medición de flujo inspiratorio), que podría no ser el mismo recurso | — |
| Cuestionarios comunicados por pacientes | ACT y CAT (titularidad por confirmar) | `act-cuestionario`, `cat-cuestionario` |
| Medidores Peak-Flow | Candidato MedlinePlus (URL por confirmar) y AsmaVida (SEMERGEN, URL no localizada) | Sondas `probe-medlineplus-peakflow`, `probe-asmavida*` |
| Aplicaciones móviles de seguimiento | AsmaVida (SEMERGEN, 2024, según nota de prensa). **URL de la plataforma no localizada** | Sonda |
| Herramientas de control de síntomas | Ver cuestionarios | — |
| Información sobre medicamentos biológicos | **No se localizó material para pacientes independiente**. Prospectos vía CIMA | `cima` |
| Prospectos y materiales educativos | CIMA (AEMPS) | `cima` |
| Vídeos farmacoterapéuticos de profesionales | **No localizado** | — |
| GINA · GEMASMA · SEAIC · SEPAR | Webs institucionales | `gina-informes`, `gema`, `seaic`, `separ` |
| Guías CPAP | Guía para pacientes con CPAP (H. G. U. Gregorio Marañón · SEPAR) | `cpap-guia-pacientes` |
| Educación en apnea del sueño | MedlinePlus | `medlineplus-apnea` |
| Recursos de Neumocan | neumocan.org presenta un certificado TLS inválido | **No incluido** |

## 4. Recursos añadidos fuera del Symbaloo (cobertura no asma)

| Patología | Recursos |
|---|---|
| EPOC | `controlando-epoc`, `gold`, `medlineplus-epoc`, `cat-cuestionario` |
| Transversal | `separ-pacientes`, `elf-espanol` |
| Bronquiectasias | `copdf-bronquiectasias`, `elf-espanol`; `elf-bronquiectasias-guia-pacientes` (pendiente), `medlineplus-bronquiectasias` (no disponible) |
| Fibrosis pulmonar | `medlineplus-fibrosis`, `afefpi` |
| Apnea del sueño | `cpap-guia-pacientes`, `medlineplus-apnea` |

## 5. Resultados de la comprobación automática de enlaces

Ejecución: workflow **Comprobación de enlaces**, GitHub Actions, **13/10/2026** (run 38365619531 del PR02). Criterios de decisión, aplicados manualmente sobre el registro:

- **Verificado**: HTTP 200 y `<title>` correspondiente al recurso; en PDF (sin título), HTTP 200 con `application/pdf` en la ruta exacta del documento.
- **No disponible**: HTTP 404/410 o redirección a una portada genérica (documento retirado).
- **Pendiente**: 403, redirección a páginas de error o título que no permite confirmar el recurso.

| Id | HTTP | Título / tipo observado | Decisión |
|---|---|---|---|
| gina-informes | 200 | Reports - Global Initiative for Asthma - GINA | Verificado |
| gema | 200 | Gemasma | Verificado |
| gema-pacientes | 200 → portada | Redirige a aeped.es/enfamilia (HTML) | **No disponible** |
| separ | 200 | \| SEPAR | Verificado |
| seaic | 200 | Inicio - Portal SEAIC | Verificado |
| fenaer | 200 | Federación Española de Asociaciones de Pacientes Alérgicos y con Enfermedades Respiratorias | Verificado (URL actualizada a `https://fenaer.es/`) |
| salamanca-que-es-asma | 200 | PDF | Verificado (URL actualizada a `www.`) |
| separ-autocuidado-asma | 200 | PDF | Verificado (URL actualizada a `www.`) |
| clinic-asma-sintomas | 200 | Síntomas del Asma \| PortalCLÍNIC | Verificado |
| aafa-libro-asma-adultos | 200 | PDF | Verificado |
| controlando-epoc | 200 | PDF | Verificado |
| gold | 200 | Global Initiative for Chronic Obstructive Lung Disease - GOLD | Verificado |
| elf-bronquiectasias-guia-pacientes | 403 | Error 403 Forbidden | **Pendiente** (bloqueo a peticiones automáticas) |
| copdf-bronquiectasias | 200 | PDF | Verificado |
| cpap-guia-pacientes | 200 | PDF | Verificado |
| cima | 200 | CIMA. Centro de información de medicamentos | Verificado |
| medlineplus-asma | 200 | Asma \| … \| MedlinePlus en español | Verificado |
| medlineplus-epoc | 200 | EPOC \| … \| MedlinePlus en español | Verificado |
| medlineplus-bronquiectasias | 404 | «MedlinePlus no tiene ésta información en español» | **No disponible** |
| medlineplus-apnea | 200 | Apnea del sueño: MedlinePlus en español | Verificado |
| medlineplus-fibrosis | 200 | Fibrosis pulmonar: MedlinePlus en español | Verificado |
| asthma-lung-uk-videos | 200 | How to use your inhaler \| Asthma + Lung UK | Verificado |
| murciasalud-limpieza-camara | 200 | Preevid: Limpieza y desinfección de cámaras espaciadoras para ser reutilizadas durante la pandemia de COVID-19 | Verificado; **descripción corregida** (trata la reutilización entre pacientes, no la limpieza doméstica) |
| act-cuestionario | 200 → /not-available | Not Available | **Pendiente** (posible restricción geográfica del servidor de CI) |
| cat-cuestionario | 200 | Patient Welcome Page | **Pendiente** (título genérico) |

### Sondas (URL candidatas no publicadas)

| Sonda | Resultado | Decisión |
|---|---|---|
| separ.es/pacientes | 200 · «PACIENTES \| SEPAR» | **Incorporado** como `separ-pacientes` |
| afefpi.org | 200 · dominio de AFEFPI | **Incorporado** como `afefpi` (cubre fibrosis pulmonar) |
| europeanlung.org/es/ | 200 · «European Lung Foundation \| ELF \| Homepage» | **Incorporado** como `elf-espanol` |
| enasmaelcerocuenta.es | 200 → redirige a astrazenecapacientes.es (Asma) | **No incorporado**: portal de un laboratorio (criterio 2) y existen alternativas independientes. Decisión revisable por el responsable. |
| asmavida.es / asmavida.com | Dominio inexistente | URL de AsmaVida sigue sin localizar |
| neumocan.org | Error de certificado TLS | No comprobable; no se enlaza un sitio con certificado inválido |
| clinicbarcelona.org/…/asma | 200 · página general de asma | No incorporada (ya está la página de síntomas) |
| MedlinePlus 000043 | 200 · «Cómo usar su espirómetro» | No incorporada: el título no permite confirmar que sea el medidor de flujo espiratorio máximo; revisar el contenido |
| Nota de prensa AsmaVida (SEMERGEN) | 200 · PDF | Solo como fuente documental |

### Symbaloo

`npm run audit:symbaloo` desde GitHub Actions: HTTP 200, título «ASMA para pacientes - Symbaloo Library», **0 URL externas en el HTML**. El mosaico se carga dinámicamente con JavaScript, así que la correspondencia mosaico → URL de §3 sigue sin confirmar. La vía fiable es exportar el webmix desde la cuenta propietaria.

### Resumen

28 recursos: **23 verificados**, **3 pendientes** y **2 no disponibles** (ocultos por defecto). Verificado significa que el enlace es accesible y corresponde, **no** que se haya revisado su contenido clínico.

## 6. Recursos descartados

| Recurso | Motivo |
|---|---|
| Folleto de apnea del sueño de un fabricante de equipos CPAP | Material de fabricante; existen alternativas independientes. |
| Copias de la guía GEMA para pacientes alojadas en webs de terceros (p. ej., SEFAC) | Duplicado: se mantiene una única copia. Preferible localizar la copia oficial. |
| Artículos científicos sobre técnica inhalatoria (Arch Bronconeumol, etc.) | Dirigidos a investigación; para eso está EvidenceGap Radar. |
| Materiales de aseguradoras de EE. UU. (asma y EPOC en español) | Fuente no sanitaria pública ni científica; contexto asistencial distinto. |
| Notas de prensa y noticias (Redacción Médica, etc.) | No son recursos educativos; solo se usaron para identificar fuentes. |

## 7. Pendientes para la revisión profesional

1. Revisar el contenido y la vigencia de cada recurso «verificado» antes de usarlo con pacientes, y comprobar manualmente los 3 pendientes (ELF bronquiectasias, ACT, CAT).
1. Decidir si se incorpora «En Asma el Cero Cuenta» con vinculación comercial declarada.
2. Confirmar la correspondencia con los mosaicos del Symbaloo (idealmente, exportando sus URL desde la propia cuenta de Symbaloo).
3. Localizar las URL oficiales de: AsmaVida, recursos de Neumocan (certificado inválido), InhalCheck, «Sistemas de inhalación», «Guías de dispositivos», vídeos en español de técnica inhalatoria y material para pacientes sobre biológicos.
4. Confirmar la titularidad y las condiciones de uso de ACT y CAT, y registrar su posible vinculación comercial.
5. Sustituir las copias alojadas por terceros (Althaia, Sacyl, AEP) por las versiones oficiales de SEPAR/GEMA cuando existan.
6. Registrar en `contentUpdated` la fecha de cada documento al revisarlo.
