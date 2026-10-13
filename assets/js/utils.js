/**
 * Utilidades compartidas sin dependencias del DOM (testables en Node).
 */

/** Escapa texto para interpolarlo con seguridad en HTML. */
export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** Normaliza texto para búsqueda: minúsculas y sin diacríticos. */
export function normalize(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

/**
 * Filtra herramientas por texto libre y categoría.
 * Todas las palabras de la consulta deben aparecer (búsqueda AND) en el
 * nombre, lema, descripción, funcionalidades o palabras clave.
 */
export function filterTools(tools, { query = '', category = 'todas' } = {}) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  return tools.filter((tool) => {
    if (category !== 'todas' && tool.category !== category) return false;
    if (terms.length === 0) return true;
    const haystack = normalize(
      [tool.name, tool.tagline, tool.description, ...tool.features, ...tool.keywords].join(' ')
    );
    return terms.every((term) => haystack.includes(term));
  });
}
