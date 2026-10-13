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

Se prioriza la calidad frente al volumen: 25 recursos iniciales.

## 3. Correspondencia con los mosaicos del Symbaloo

| Mosaico solicitado | Resultado | Recurso en la biblioteca |
|---|---|---|
| ¿Qué es el asma? — SEPAR | Candidato localizado; correspondencia **sin confirmar** | `salamanca-que-es-asma` |
| Autocuidados — SEPAR | Candidato localizado (SEPAR + SEPARpacientes según el buscador); correspondencia sin confirmar | `separ-autocuidado-asma` |
| Libros para pacientes CON ASMA | **No localizado**. Se identificó un cuaderno alternativo (AAFA) | `aafa-libro-asma-adultos` (alternativa) |
| Síntomas del asma — PortalCLÍNIC | URL construida según la estructura conocida del portal; requiere comprobar el título | `clinic-asma-sintomas` |
| Guía para personas con asma | **Ambiguo**: varios documentos posibles. Se incluye la versión para pacientes de GEMA | `gema-pacientes` (candidato) |
| En Asma el Cero Cuenta | Campaña identificada (impulsada por la Fundación AstraZeneca y avalada por FENAER, según prensa). **URL no localizada** | No incluido · sonda `probe-cero-cuenta` |
| Asociación de Pacientes FENAER | Identificada | `fenaer` |
| Vídeos de dispositivos inhaladores | Sin equivalente en español verificable. Alternativa en inglés | `asthma-lung-uk-videos` |
| Sistemas de inhalación | **No localizado** | — |
| Limpieza y mantenimiento de inhaladores | Respuesta PreEvid (Murcia Salud) sobre cámaras espaciadoras | `murciasalud-limpieza-camara` |
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
| Recursos de Neumocan | Sociedad identificada (neumocan.org según un documento de la FBBVA); recursos para pacientes no localizados | Sonda `probe-neumocan` |

## 4. Recursos añadidos fuera del Symbaloo (cobertura no asma)

| Patología | Recursos |
|---|---|
| EPOC | `controlando-epoc`, `gold`, `medlineplus-epoc`, `cat-cuestionario` |
| Bronquiectasias | `elf-bronquiectasias-guia-pacientes`, `copdf-bronquiectasias`, `medlineplus-bronquiectasias` |
| Fibrosis pulmonar | `medlineplus-fibrosis` (AFEFPI identificada; web pendiente: sonda `probe-afefpi`) |
| Apnea del sueño | `cpap-guia-pacientes`, `medlineplus-apnea` |

## 5. Resultados de la comprobación automática de enlaces

> Se completa con la ejecución del flujo **Comprobación de enlaces** de GitHub Actions sobre este PR. Hasta entonces, todos los recursos están en estado **pendiente de revisión** y no pueden incluirse en hojas para pacientes.

_Pendiente de la primera ejecución en CI._

## 6. Recursos descartados

| Recurso | Motivo |
|---|---|
| Folleto de apnea del sueño de un fabricante de equipos CPAP | Material de fabricante; existen alternativas independientes. |
| Copias de la guía GEMA para pacientes alojadas en webs de terceros (p. ej., SEFAC) | Duplicado: se mantiene una única copia. Preferible localizar la copia oficial. |
| Artículos científicos sobre técnica inhalatoria (Arch Bronconeumol, etc.) | Dirigidos a investigación; para eso está EvidenceGap Radar. |
| Materiales de aseguradoras de EE. UU. (asma y EPOC en español) | Fuente no sanitaria pública ni científica; contexto asistencial distinto. |
| Notas de prensa y noticias (Redacción Médica, etc.) | No son recursos educativos; solo se usaron para identificar fuentes. |

## 7. Pendientes para la revisión profesional

1. Revisar el contenido y la vigencia de cada recurso «verificado» antes de su uso con pacientes.
2. Confirmar la correspondencia con los mosaicos del Symbaloo (idealmente, exportando sus URL desde la propia cuenta de Symbaloo).
3. Localizar las URL oficiales de: AsmaVida, En Asma el Cero Cuenta, recursos de Neumocan, InhalCheck, «Sistemas de inhalación», «Guías de dispositivos», vídeos en español de técnica inhalatoria y material para pacientes sobre biológicos.
4. Confirmar la titularidad y las condiciones de uso de ACT y CAT, y registrar su posible vinculación comercial.
5. Sustituir las copias alojadas por terceros (Althaia, Sacyl, AEP) por las versiones oficiales de SEPAR/GEMA cuando existan.
6. Registrar en `contentUpdated` la fecha de cada documento al revisarlo.
