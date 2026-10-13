/**
 * Búsqueda y filtros de la biblioteca (funciones puras).
 * Semántica: OR dentro de cada grupo de filtros, AND entre grupos.
 */
import { normalize } from '../utils.js';

/** Grupos de filtro: clave de estado → campo del recurso y si es lista. */
export const FILTER_GROUPS = [
  { key: 'patologia', field: 'pathologies', taxonomy: 'pathologies', label: 'Patología', multi: true },
  { key: 'destinatario', field: 'audiences', taxonomy: 'audiences', label: 'Destinatario', multi: true },
  { key: 'categoria', field: 'categories', taxonomy: 'categories', label: 'Categoría', multi: true },
  { key: 'formato', field: 'format', taxonomy: 'formats', label: 'Formato', multi: false },
  { key: 'idioma', field: 'language', taxonomy: 'languages', label: 'Idioma', multi: false },
  { key: 'estado', field: 'status', taxonomy: 'statuses', label: 'Estado del enlace', multi: false },
];

export function emptyState() {
  return Object.fromEntries([['q', ''], ...FILTER_GROUPS.map((g) => [g.key, []])]);
}

function matchesGroup(resource, group, selected) {
  if (!selected || selected.length === 0) return true;
  const value = resource[group.field];
  return group.multi ? value.some((v) => selected.includes(v)) : selected.includes(value);
}

function matchesQuery(resource, terms) {
  if (terms.length === 0) return true;
  const haystack = normalize(
    [resource.name, resource.description, resource.organization, resource.symbalooTile || ''].join(' ')
  );
  return terms.every((t) => haystack.includes(t));
}

/** Filtra recursos según el estado (texto + grupos). */
export function filterResources(resources, state, { except } = {}) {
  const terms = normalize(state.q || '').split(/\s+/).filter(Boolean);
  return resources.filter(
    (r) =>
      matchesQuery(r, terms) &&
      FILTER_GROUPS.every((g) => g.key === except || matchesGroup(r, g, state[g.key]))
  );
}

/**
 * Recuento por opción para cada grupo, aplicando el resto de filtros
 * (patrón de facetas: la cifra indica cuántos resultados habría al marcarla).
 */
export function facetCounts(resources, state) {
  const counts = {};
  for (const g of FILTER_GROUPS) {
    const pool = filterResources(resources, state, { except: g.key });
    counts[g.key] = {};
    for (const r of pool) {
      const values = g.multi ? r[g.field] : [r[g.field]];
      for (const v of values) counts[g.key][v] = (counts[g.key][v] || 0) + 1;
    }
  }
  return counts;
}

/** Estado → parámetros de URL (para compartir una búsqueda). */
export function stateToParams(state) {
  const params = new URLSearchParams();
  if (state.q) params.set('q', state.q);
  for (const g of FILTER_GROUPS) if (state[g.key]?.length) params.set(g.key, state[g.key].join(','));
  return params;
}

/** Parámetros de URL → estado, ignorando valores fuera de taxonomía. */
export function paramsToState(params, taxonomies) {
  const state = emptyState();
  state.q = (params.get('q') || '').slice(0, 120);
  for (const g of FILTER_GROUPS) {
    const allowed = new Set((taxonomies[g.taxonomy] || []).map((t) => t.id));
    state[g.key] = (params.get(g.key) || '').split(',').filter((v) => allowed.has(v));
  }
  return state;
}

/** ¿Puede el recurso incluirse en una hoja para pacientes? */
export function isSheetEligible(resource) {
  return (
    resource.status === 'verificado' &&
    resource.audiences.some((a) => a === 'paciente' || a === 'cuidador')
  );
}

/** Motivo legible por el que un recurso no puede añadirse a la hoja. */
export function sheetIneligibleReason(resource) {
  if (resource.status !== 'verificado') return 'Solo pueden añadirse recursos con enlace verificado.';
  if (!resource.audiences.some((a) => a === 'paciente' || a === 'cuidador')) {
    return 'Recurso dirigido a profesionales; no se incluye en hojas para pacientes.';
  }
  return '';
}
