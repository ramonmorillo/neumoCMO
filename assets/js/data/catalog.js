/**
 * neumoCMO · Catálogo de contenidos
 * ----------------------------------------------------------------------------
 * Fuente única de verdad de la landing. Para añadir una herramienta, un
 * recurso o una funcionalidad futura basta con editar este archivo: la
 * interfaz se genera a partir de él (ver assets/js/main.js).
 *
 * Reglas editoriales (ver docs/CONTENT_GUIDE.md):
 *  - Solo se describen funcionalidades comprobadas en el repositorio de cada
 *    herramienta. No se inventan capacidades ni URLs.
 *  - Cada herramienta declara `source` (repositorio) y `evidence` (de dónde
 *    se ha obtenido la URL pública) para mantener la trazabilidad.
 *  - La clasificación CMO es una propuesta editorial pendiente de validación.
 */

/** Dimensiones CMO tal como se usan en la landing. */
export const CMO_DIMENSIONS = [
  {
    id: 'capacidad',
    letter: 'C',
    name: 'Capacidad',
    summary:
      'Atender a cada paciente según sus necesidades: estratificar, priorizar y planificar la intensidad de la atención farmacéutica.',
    tone: 'navy',
  },
  {
    id: 'motivacion',
    letter: 'M',
    name: 'Motivación',
    summary:
      'Alinear con el paciente los objetivos farmacoterapéuticos y abordar creencias y barreras, con información comprensible y decisión compartida.',
    tone: 'teal',
  },
  {
    id: 'oportunidad',
    letter: 'O',
    name: 'Oportunidad',
    summary:
      'Acompañar al paciente cuando y donde lo necesita: seguimiento longitudinal, coordinación y uso de la evidencia para mejorar el proceso asistencial.',
    tone: 'sky',
  },
];

/** Categorías del catálogo (filtros). */
export const CATEGORIES = [
  { id: 'estratificacion', label: 'Estratificación' },
  { id: 'adherencia', label: 'Adherencia' },
  { id: 'educacion', label: 'Educación al paciente' },
  { id: 'evidencia', label: 'Evidencia e investigación' },
];

/**
 * Herramientas integradas.
 * `cmo` indica las dimensiones en las que la herramienta aporta de forma
 * principal (propuesta editorial; ver docs/TOOLS_VERIFICATION.md).
 */
export const TOOLS = [
  {
    id: 'cmo-respiratorio',
    name: 'SIAF-CMO Respiratorio',
    tagline: 'Estratificación CMO del paciente respiratorio',
    description:
      'Aplicación de apoyo a la estratificación farmacéutica según la adaptación del modelo CMO-MAPEX al paciente con patologías respiratorias: puntuación, prioridad (P1–P3), necesidades, intervenciones por nivel e informe para la historia clínica.',
    features: [
      'Valoración guiada en 7 pasos',
      'Prioridad P1/P2/P3 y excepciones',
      'Informe copiable y PDF',
      'Datos solo en el navegador',
    ],
    url: 'https://ramonmorillo.github.io/cmorespiratorio/',
    source: 'https://github.com/ramonmorillo/cmorespiratorio',
    evidence:
      'README del repositorio (publicación en GitHub Pages bajo /cmorespiratorio/) y <base href="/cmorespiratorio/"> en index.html.',
    category: 'estratificacion',
    cmo: ['capacidad'],
    icon: 'lungs',
    status: 'operativa',
    keywords: ['estratificar', 'prioridad', 'P1', 'P2', 'P3', 'asma', 'EPOC', 'MAPEX', 'informe'],
  },
  {
    id: 'mapex-adhefar-hub',
    name: 'MAPEX-ADHEFAR Hub',
    tagline: 'Adherencia en consultas externas',
    description:
      'Hub operativo basado en la Guía MAPEX-ADHEFAR para medir, monitorizar y mejorar la adherencia: calculadora PDC/MPR, checklists de visita, guion ADHEFAR-EM, clasificador de barreras CMO, casos prácticos e implantación.',
    features: [
      'Calculadora PDC/MPR',
      'Clasificador de barreras CMO',
      'Algoritmo ADHEFAR-EM de 7 pasos',
      'Casos prácticos (incluye asma grave)',
    ],
    url: 'https://ramonmorillo.github.io/adhefarmapexhub/',
    source: 'https://github.com/ramonmorillo/adhefarmapexhub',
    evidence:
      'Workflow .github/workflows/pages.yml (despliegue de la raíz en GitHub Pages desde main).',
    category: 'adherencia',
    cmo: ['capacidad', 'motivacion', 'oportunidad'],
    icon: 'pulse',
    status: 'operativa',
    keywords: ['adherencia', 'PDC', 'MPR', 'barreras', 'entrevista', 'checklist', 'ADHEFAR', 'PROM', 'PREM'],
  },
  {
    id: 'rxplain',
    name: 'RxPlain',
    tagline: 'Traducción farmacoterapéutica para el paciente',
    description:
      'Convierte el tratamiento completo en una infografía comprensible, priorizada y revisable por el farmacéutico: objetivos, forma de toma, qué es normal notar, cuándo avisar y precauciones. Búsqueda opcional en CIMA/AEMPS.',
    features: [
      'Adaptación por alfabetización en salud',
      'Señales de alarma diferenciadas',
      'Infografía imprimible / PDF',
      'Validación profesional del contenido',
    ],
    url: 'https://ramonmorillo.github.io/rxplain/',
    source: 'https://github.com/ramonmorillo/rxplain',
    evidence:
      'Enlace operativo registrado en el catálogo de SIAF-CMO (ramonmorillo/SIAF-CMO, index.html).',
    category: 'educacion',
    cmo: ['motivacion'],
    icon: 'message',
    status: 'operativa',
    keywords: ['infografía', 'educación', 'paciente', 'CIMA', 'AEMPS', 'alfabetización', 'información'],
  },
  {
    id: 'evidencegap-radar',
    name: 'EvidenceGap Radar',
    tagline: 'Paisaje de evidencia de una pregunta clínica',
    description:
      'Explora rápidamente la evidencia disponible para una pregunta PICO-lite combinando señales de PubMed y ClinicalTrials.gov: query reproducible, publicaciones por año, tipos de estudio, revisiones sistemáticas y ensayos activos.',
    features: [
      'Query builder PICO con sinónimos',
      'Autocompletado MeSH',
      'Radar PubMed + ClinicalTrials.gov',
      'Ejemplos docentes precargados',
    ],
    url: 'https://ramonmorillo.github.io/evidencegap-radar/',
    source: 'https://github.com/ramonmorillo/evidencegap-radar',
    evidence:
      'Enlace registrado en el catálogo de SIAF-CMO y en about.html del propio repositorio.',
    category: 'evidencia',
    cmo: ['capacidad', 'motivacion', 'oportunidad'],
    icon: 'radar',
    status: 'operativa',
    keywords: ['evidencia', 'PubMed', 'ensayos', 'PICO', 'MeSH', 'investigación', 'revisión', 'docencia'],
  },
];

/**
 * «¿Qué necesitas hacer hoy en tu consulta?»
 * Cada tarea enlaza a una herramienta (y, si existe, a una sección concreta
 * verificada en su repositorio) o a una funcionalidad de la hoja de ruta.
 */
export const TASKS = [
  {
    id: 'estratificar',
    title: 'Estratificar a un paciente',
    hint: 'Prioridad P1–P3 y plan de intervenciones',
    toolId: 'cmo-respiratorio',
    href: 'https://ramonmorillo.github.io/cmorespiratorio/',
    icon: 'layers',
  },
  {
    id: 'adherencia',
    title: 'Medir y abordar la adherencia',
    hint: 'PDC/MPR, checklists y barreras CMO',
    toolId: 'mapex-adhefar-hub',
    href: 'https://ramonmorillo.github.io/adhefarmapexhub/herramientas.html',
    icon: 'pulse',
  },
  {
    id: 'explicar',
    title: 'Explicar el tratamiento',
    hint: 'Infografía clara y revisable para el paciente',
    toolId: 'rxplain',
    href: 'https://ramonmorillo.github.io/rxplain/',
    icon: 'message',
  },
  {
    id: 'evidencia',
    title: 'Consultar la evidencia',
    hint: 'Radar PubMed y ClinicalTrials.gov',
    toolId: 'evidencegap-radar',
    href: 'https://ramonmorillo.github.io/evidencegap-radar/',
    icon: 'radar',
  },
  {
    id: 'modelo',
    title: 'Repasar el modelo CMO',
    hint: 'Pilares, algoritmo y decálogo de implantación',
    toolId: 'mapex-adhefar-hub',
    href: 'https://ramonmorillo.github.io/adhefarmapexhub/modelo.html',
    icon: 'compass',
  },
  {
    id: 'inhalatoria',
    title: 'Revisar la técnica inhalatoria',
    hint: 'Próximamente en neumoCMO',
    roadmapId: 'tecnica-inhalatoria',
    href: '#futuro',
    icon: 'wind',
  },
];

/** Recursos metodológicos y de evidencia (enlaces citados en los repositorios). */
export const RESOURCES = [
  {
    id: 'modelo-cmo-respiratorio',
    type: 'Documento de referencia',
    title: 'Adaptación del Modelo de Atención Farmacéutica CMO al paciente con patologías respiratorias',
    publisher: 'SEFH · MAPEX',
    url: 'https://www.sefh.es/mapex/images/modelo-CMO-al-paciente-con-patologias-respiratorias.pdf',
    note: 'Base metodológica de SIAF-CMO Respiratorio.',
  },
  {
    id: 'mapex',
    type: 'Portal',
    title: 'Proyecto MAPEX',
    publisher: 'SEFH',
    url: 'https://www.sefh.es/mapex/',
    note: 'Acceso a la Guía MAPEX-ADHEFAR y a la documentación oficial del proyecto.',
  },
  {
    id: 'mapex-documentacion',
    type: 'Repositorio documental',
    title: 'Documentación MAPEX',
    publisher: 'SEFH',
    url: 'https://www.sefh.es/mapex/documentacion.php',
    note: 'Documentos de posicionamiento y modelos de la iniciativa.',
  },
  {
    id: 'qpex',
    type: 'Calidad',
    title: 'Q-PEX',
    publisher: 'SEFH · MAPEX',
    url: 'https://www.sefh.es/mapex/q-pex.php',
    note: 'Referencia de calidad para las consultas de atención farmacéutica.',
  },
  {
    id: 'reglas-clinicas',
    type: 'Trazabilidad',
    title: 'Reglas clínicas y mapeo de fuentes de SIAF-CMO Respiratorio',
    publisher: 'Repositorio cmorespiratorio',
    url: 'https://github.com/ramonmorillo/cmorespiratorio/blob/main/CLINICAL_RULES.md',
    note: 'Variables, puntos y criterios de prioridad implementados, con su origen documental.',
  },
  {
    id: 'siaf-cmo',
    type: 'Ecosistema',
    title: 'SIAF-CMO · Hub CMO-MAPEX-DEFT-AI',
    publisher: 'Ramón Morillo',
    url: 'https://ramonmorillo.github.io/SIAF-CMO/',
    note: 'Catálogo general de herramientas CMO del que neumoCMO es el entorno respiratorio.',
  },
];

/** Espacio reservado para futuras funcionalidades. */
export const ROADMAP = [
  {
    id: 'next-best-action',
    name: 'Next Best Action',
    description:
      'Propuesta priorizada de la siguiente actuación farmacéutica a partir de la estratificación y del plan ya registrados.',
    cmo: ['capacidad', 'motivacion'],
    icon: 'target',
  },
  {
    id: 'consulta-builder',
    name: 'Consulta Builder',
    description:
      'Preparación estructurada de la consulta: objetivos, herramientas y materiales necesarios para cada visita.',
    cmo: ['capacidad', 'oportunidad'],
    icon: 'clipboard',
  },
  {
    id: 'tecnica-inhalatoria',
    name: 'Técnica inhalatoria',
    description:
      'Apoyo a la revisión y educación en el uso correcto de los dispositivos de inhalación.',
    cmo: ['capacidad', 'motivacion'],
    icon: 'wind',
  },
  {
    id: 'seguimiento-longitudinal',
    name: 'Seguimiento longitudinal',
    description:
      'Visión temporal de la evolución del paciente entre consultas, coherente con la dimensión Oportunidad.',
    cmo: ['oportunidad'],
    icon: 'route',
  },
];
