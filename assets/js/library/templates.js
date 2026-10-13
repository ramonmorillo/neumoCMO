/**
 * Plantillas HTML de la Biblioteca Respiratoria (funciones puras).
 */
import { escapeHtml as e } from '../utils.js';
import { icon } from '../components/templates.js';
import { FILTER_GROUPS, isSheetEligible, sheetIneligibleReason } from './filter.js';

const NEW_TAB = '<span class="visually-hidden"> (se abre en una pestaña nueva)</span>';
const EXTERNAL = 'target="_blank" rel="noopener noreferrer"';
const FORMAT_ICON = { video: 'video', documento: 'file', web: 'globe', 'herramienta-interactiva': 'tool' };
const STATUS_ICON = { verificado: 'check', pendiente: 'clock', 'no-disponible': 'alert' };

/** Diccionario id → etiqueta para cada taxonomía. */
export function labelMaps(taxonomies) {
  return Object.fromEntries(
    Object.entries(taxonomies).map(([k, list]) => [k, Object.fromEntries(list.map((t) => [t.id, t.label]))])
  );
}

export function formatIsoDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return d ? `${d}/${m}/${y}` : m ? `${m}/${y}` : y;
}

export function stats(resources) {
  const by = (s) => resources.filter((r) => r.status === s).length;
  const lastChecked = resources.map((r) => r.lastChecked).filter(Boolean).sort().at(-1);
  return `
    <div><dt>Recursos</dt><dd>${resources.length}</dd></div>
    <div><dt>Verificados</dt><dd>${by('verificado')}</dd></div>
    <div><dt>Pendientes</dt><dd>${by('pendiente')}</dd></div>
    <div><dt>Última comprobación</dt><dd>${lastChecked ? e(formatIsoDate(lastChecked)) : 'Sin comprobar'}</dd></div>`;
}

export function ownTool(tool) {
  return `
    <li>
      <a class="own-tool" href="${e(tool.url)}" ${EXTERNAL}>
        <span class="tool-icon tool-icon-sm">${icon(tool.icon)}</span>
        <span class="own-tool-body">
          <span class="origin-pill is-own">Herramienta neumoCMO</span>
          <span class="own-tool-name">${e(tool.name)}</span>
          <span class="own-tool-tag">${e(tool.tagline)}</span>
        </span>
        ${icon('external', 'icon own-tool-go')}${NEW_TAB}
      </a>
    </li>`;
}

export function filterGroups(taxonomies, state, counts) {
  return FILTER_GROUPS.map((g) => {
    const options = (taxonomies[g.taxonomy] || [])
      .map((opt) => {
        const id = `f-${g.key}-${opt.id}`;
        const checked = state[g.key].includes(opt.id);
        const n = counts[g.key]?.[opt.id] || 0;
        return `
          <li>
            <input type="checkbox" id="${e(id)}" name="${e(g.key)}" value="${e(opt.id)}" ${checked ? 'checked' : ''}>
            <label for="${e(id)}"><span>${e(opt.label)}</span><span class="facet-count" aria-label="${n} resultados">${n}</span></label>
          </li>`;
      })
      .join('');
    return `
      <fieldset class="filter-fieldset">
        <legend>${e(g.label)}</legend>
        <ul role="list">${options}</ul>
      </fieldset>`;
  }).join('');
}

export function activeFilters(state, labels) {
  const chips = [];
  if (state.q) chips.push({ key: 'q', value: '', text: `«${state.q}»` });
  for (const g of FILTER_GROUPS) {
    for (const v of state[g.key]) chips.push({ key: g.key, value: v, text: labels[g.taxonomy]?.[v] || v });
  }
  if (!chips.length) return '';
  return chips
    .map(
      (c) => `<button type="button" class="chip chip-removable" data-remove-key="${e(c.key)}" data-remove-value="${e(c.value)}">
        ${e(c.text)} ${icon('close')}<span class="visually-hidden">Quitar filtro</span></button>`
    )
    .join('');
}

function tags(list, map) {
  return list.map((v) => `<li>${e(map?.[v] || v)}</li>`).join('');
}

export function resourceCard(r, labels, selected) {
  const eligible = isSheetEligible(r);
  const statusLabel = labels.statuses[r.status];
  const commercial = r.commercial.status === 'si'
    ? `<p class="commercial is-yes">${icon('alert')} Vinculación comercial: ${e(r.commercial.note)}</p>`
    : r.commercial.status === 'no-identificada'
      ? `<p class="commercial">${icon('building')} ${e(labels.commercial['no-identificada'])}${r.commercial.note ? ` · ${e(r.commercial.note)}` : ''}</p>`
      : `<p class="commercial">${icon('building')} ${e(labels.commercial['no-evaluada'])}</p>`;

  let open = '';
  if (r.status === 'verificado') {
    open = `<a class="btn btn-ghost btn-sm" href="${e(r.url)}" ${EXTERNAL}>Abrir recurso ${icon('external')}<span class="visually-hidden"> ${e(r.name)} (se abre en una pestaña nueva)</span></a>`;
  } else if (r.status === 'pendiente') {
    open = `<a class="btn btn-link btn-sm link-unverified" href="${e(r.url)}" ${EXTERNAL}>${icon('alert')} Enlace sin verificar<span class="visually-hidden"> de ${e(r.name)} (se abre en una pestaña nueva)</span></a>`;
  }
  const add = eligible
    ? `<button type="button" class="btn btn-sm ${selected ? 'btn-selected' : 'btn-primary'}" data-toggle-select="${e(r.id)}" aria-pressed="${selected}">
        ${icon(selected ? 'check' : 'plus')} ${selected ? 'En la hoja' : 'Añadir a la hoja'}<span class="visually-hidden">: ${e(r.name)}</span></button>`
    : `<p class="not-eligible">${e(sheetIneligibleReason(r))}</p>`;

  return `
    <li class="res-card status-${e(r.status)}" id="r-${e(r.id)}">
      <div class="res-top">
        <span class="res-format" title="${e(labels.formats[r.format])}">${icon(FORMAT_ICON[r.format] || 'globe')}<span>${e(labels.formats[r.format])}</span></span>
        <span class="status-badge is-${e(r.status)}">${icon(STATUS_ICON[r.status])} ${e(statusLabel)}</span>
      </div>
      <h3 class="res-title">${e(r.name)}</h3>
      <p class="res-org"><span class="origin-pill">Recurso externo</span> ${e(r.organization)}</p>
      <p class="res-desc">${e(r.description)}</p>
      <ul class="res-tags" aria-label="Clasificación">
        ${tags(r.pathologies, labels.pathologies)}
        ${tags(r.categories, labels.categories)}
        ${tags(r.audiences, labels.audiences)}
        <li>${e(labels.languages[r.language] || r.language)}</li>
      </ul>
      <dl class="res-meta">
        <div><dt>Enlace comprobado</dt><dd>${r.lastChecked ? e(formatIsoDate(r.lastChecked)) : 'No'}</dd></div>
        <div><dt>Contenido actualizado</dt><dd>${r.contentUpdated ? e(formatIsoDate(r.contentUpdated)) : 'Desconocido'}</dd></div>
      </dl>
      ${commercial}
      <div class="res-actions">${open}${add}</div>
    </li>`;
}

export function selectionItem(r, index, total) {
  return `
    <li class="sel-item">
      <span class="sel-num">${index + 1}</span>
      <span class="sel-body"><span class="sel-name">${e(r.name)}</span><span class="sel-org">${e(r.organization)}</span></span>
      <span class="sel-actions">
        <button type="button" class="icon-btn" data-move="${e(r.id)}" data-dir="-1" ${index === 0 ? 'disabled' : ''}>${icon('up')}<span class="visually-hidden">Subir ${e(r.name)}</span></button>
        <button type="button" class="icon-btn" data-move="${e(r.id)}" data-dir="1" ${index === total - 1 ? 'disabled' : ''}>${icon('down')}<span class="visually-hidden">Bajar ${e(r.name)}</span></button>
        <button type="button" class="icon-btn" data-toggle-select="${e(r.id)}">${icon('close')}<span class="visually-hidden">Quitar ${e(r.name)}</span></button>
      </span>
    </li>`;
}
