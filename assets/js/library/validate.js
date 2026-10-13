/**
 * Validación del catálogo de la Biblioteca Respiratoria.
 * Funciones puras, compartidas por el navegador (descarta registros
 * inválidos) y por Node (`npm run validate:resources`, pruebas).
 *
 * Detecta: campos obligatorios ausentes, valores fuera de taxonomía,
 * URL mal formadas o no https, fechas inválidas, incoherencias de estado
 * y duplicados (por id, por URL normalizada y por nombre normalizado).
 */

const REQUIRED_TEXT = ['id', 'name', 'description', 'organization', 'url', 'format', 'language', 'status'];
const REQUIRED_LISTS = ['pathologies', 'categories', 'audiences'];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Normaliza una URL para detectar duplicados (sin protocolo, www, barra final ni fragmento). */
export function normalizeUrl(raw) {
  try {
    const u = new URL(raw);
    const host = u.hostname.toLowerCase().replace(/^www\./, '');
    const path = u.pathname.replace(/\/+$/, '');
    return `${host}${path}${u.search}`;
  } catch {
    return String(raw).trim().toLowerCase();
  }
}

/** Normaliza un nombre para detectar duplicados. */
export function normalizeName(raw) {
  return String(raw)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function isValidDate(value) {
  if (!ISO_DATE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(value);
}

/**
 * Valida un recurso frente a las taxonomías.
 * @returns {string[]} lista de errores (vacía si es válido)
 */
export function validateResource(r, taxonomies) {
  const errors = [];
  const ids = (key) => new Set((taxonomies[key] || []).map((t) => t.id));

  for (const key of REQUIRED_TEXT) {
    if (typeof r[key] !== 'string' || !r[key].trim()) errors.push(`falta «${key}»`);
  }
  for (const key of REQUIRED_LISTS) {
    if (!Array.isArray(r[key]) || r[key].length === 0) errors.push(`«${key}» vacío`);
  }
  if (r.id && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(r.id)) errors.push('«id» no es un slug (a-z, 0-9, guiones)');

  if (typeof r.url === 'string' && r.url) {
    try {
      const u = new URL(r.url);
      if (u.protocol !== 'https:') errors.push('la URL debe usar https');
      if (/\s/.test(r.url)) errors.push('la URL contiene espacios sin codificar');
    } catch {
      errors.push('URL mal formada');
    }
  }

  const checkIn = (value, key, label) => {
    if (value !== undefined && !ids(key).has(value)) errors.push(`${label} desconocido: «${value}»`);
  };
  (r.pathologies || []).forEach((v) => checkIn(v, 'pathologies', 'patología'));
  (r.categories || []).forEach((v) => checkIn(v, 'categories', 'categoría'));
  (r.audiences || []).forEach((v) => checkIn(v, 'audiences', 'destinatario'));
  checkIn(r.format, 'formats', 'formato');
  checkIn(r.language, 'languages', 'idioma');
  checkIn(r.status, 'statuses', 'estado');

  if (!r.commercial || typeof r.commercial !== 'object') {
    errors.push('falta «commercial»');
  } else {
    checkIn(r.commercial.status, 'commercial', 'vinculación comercial');
    if (r.commercial.status === 'si' && !String(r.commercial.note || '').trim()) {
      errors.push('vinculación comercial «si» sin nota explicativa');
    }
  }

  if (r.lastChecked !== null && r.lastChecked !== undefined && !isValidDate(r.lastChecked)) {
    errors.push('«lastChecked» no es una fecha AAAA-MM-DD válida');
  }
  if (r.contentUpdated !== null && r.contentUpdated !== undefined && !/^\d{4}(-\d{2}){0,2}$/.test(r.contentUpdated)) {
    errors.push('«contentUpdated» debe ser AAAA, AAAA-MM o AAAA-MM-DD');
  }
  if (r.status === 'verificado' && !r.lastChecked) {
    errors.push('un recurso «verificado» necesita «lastChecked»');
  }
  return errors;
}

/**
 * Valida el catálogo completo.
 * @returns {{ valid: object[], invalid: {id:string, errors:string[]}[], duplicates: string[] }}
 */
export function validateCatalog(catalog) {
  const taxonomies = catalog?.taxonomies || {};
  const resources = Array.isArray(catalog?.resources) ? catalog.resources : [];
  const valid = [];
  const invalid = [];
  const duplicates = [];
  const seen = { id: new Map(), url: new Map(), name: new Map() };

  for (const r of resources) {
    const errors = validateResource(r, taxonomies);
    const keys = { id: r.id, url: normalizeUrl(r.url || ''), name: normalizeName(r.name || '') };
    for (const [kind, key] of Object.entries(keys)) {
      if (!key) continue;
      if (seen[kind].has(key)) {
        const msg = `duplicado por ${kind}: «${r.id}» y «${seen[kind].get(key)}»`;
        errors.push(msg);
        duplicates.push(msg);
      } else {
        seen[kind].set(key, r.id);
      }
    }
    if (errors.length) invalid.push({ id: r.id || '(sin id)', errors });
    else valid.push(r);
  }
  return { valid, invalid, duplicates };
}
