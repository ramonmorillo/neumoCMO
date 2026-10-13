/**
 * Biblioteca Respiratoria CMO · punto de entrada
 * Carga el catálogo JSON, lo valida, renderiza filtros y resultados y
 * gestiona la selección y la hoja imprimible. Todo ocurre en el navegador.
 */
import { TOOLS } from '../data/catalog.js';
import { initNav } from '../components/nav.js';
import { validateCatalog } from './validate.js';
import { emptyState, filterResources, facetCounts, stateToParams, paramsToState, isSheetEligible, FILTER_GROUPS } from './filter.js';
import { buildSheetHtml } from './sheet.js';
import { qrSvg } from './qr.js';
import * as tpl from './templates.js';

const DATA_URL = 'assets/data/recursos.json';
const SELECTION_KEY = 'neumocmo.biblioteca.seleccion';
const DEFAULT_STATUSES = ['verificado', 'pendiente'];

const $ = (sel, root = document) => root.querySelector(sel);
const slot = (name) => $(`[data-render="${name}"]`);

const store = {
  read() {
    try { return JSON.parse(sessionStorage.getItem(SELECTION_KEY) || '[]'); } catch { return []; }
  },
  write(ids) {
    try { sessionStorage.setItem(SELECTION_KEY, JSON.stringify(ids)); } catch { /* sin almacenamiento: solo memoria */ }
  },
};

async function loadCatalog() {
  const res = await fetch(DATA_URL, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`No se pudo cargar el catálogo (${res.status})`);
  const catalog = await res.json();
  const { valid, invalid } = validateCatalog(catalog);
  for (const item of invalid) console.warn(`[Biblioteca] Recurso excluido «${item.id}»: ${item.errors.join('; ')}`);
  return { taxonomies: catalog.taxonomies, resources: valid };
}

function init({ taxonomies, resources }) {
  const labels = tpl.labelMaps(taxonomies);
  const byId = new Map(resources.map((r) => [r.id, r]));
  const params = new URLSearchParams(location.search);
  const state = paramsToState(params, taxonomies);
  if (!params.has('estado')) state.estado = [...DEFAULT_STATUSES];
  let prepInView = false;
  let selection = store.read().filter((id) => byId.has(id) && isSheetEligible(byId.get(id)));

  const search = $('#lib-search');
  const form = slot('filters');
  search.value = state.q;

  slot('stats').innerHTML = tpl.stats(resources);
  slot('own-tools').innerHTML = TOOLS.map(tpl.ownTool).join('');

  const isDefaultStatus = () =>
    state.estado.length === DEFAULT_STATUSES.length && DEFAULT_STATUSES.every((s) => state.estado.includes(s));

  const syncUrl = () => {
    const p = stateToParams(state);
    if (isDefaultStatus()) p.delete('estado');
    const qs = p.toString();
    history.replaceState(null, '', `${location.pathname}${qs ? `?${qs}` : ''}${location.hash}`);
  };

  const renderResults = () => {
    const results = filterResources(resources, state);
    form.innerHTML = tpl.filterGroups(taxonomies, state, facetCounts(resources, state));
    // El estado por defecto (verificado + pendiente) no se muestra como filtro activo.
    slot('active-filters').innerHTML = tpl.activeFilters(isDefaultStatus() ? { ...state, estado: [] } : state, labels);
    slot('resources').innerHTML = results.length
      ? results.map((r) => tpl.resourceCard(r, labels, selection.includes(r.id))).join('')
      : '<li class="catalog-empty">No hay recursos que coincidan. Prueba a quitar algún filtro.</li>';
    $('#lib-status').textContent = `${results.length} de ${resources.length} recursos`;
    const active = FILTER_GROUPS.reduce((n, g) => n + (g.key === 'estado' && isDefaultStatus() ? 0 : state[g.key].length), 0);
    slot('filters-toggle-label').textContent = active ? `Filtros (${active})` : 'Mostrar filtros';
  };

  const renderSelection = () => {
    const items = selection.map((id) => byId.get(id));
    slot('selection').innerHTML = items.length
      ? items.map((r, i) => tpl.selectionItem(r, i, items.length)).join('')
      : '<li class="selection-empty">Aún no hay recursos seleccionados. Usa «Añadir a la hoja» en recursos verificados para pacientes o cuidadores.</li>';
    slot('selection-count').textContent = items.length;
    slot('tray-count').textContent = items.length;
    slot('tray').hidden = items.length === 0 || prepInView;
    $('[data-action="generate"]').disabled = items.length === 0;
    $('[data-action="clear-selection"]').disabled = items.length === 0;
    store.write(selection);
  };

  const resetSheet = () => {
    slot('sheet').innerHTML = '<p class="sheet-empty">La hoja aparecerá aquí al pulsar «Generar hoja».</p>';
    slot('sheet').classList.remove('is-ready');
    $('[data-action="print"]').disabled = true;
  };

  const toggleSelect = (id) => {
    const r = byId.get(id);
    if (!r || !isSheetEligible(r)) return;
    selection = selection.includes(id) ? selection.filter((x) => x !== id) : [...selection, id];
    renderSelection();
    renderResults();
    resetSheet();
  };

  // --- Eventos: búsqueda y filtros
  let debounce;
  search.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => { state.q = search.value.trim(); syncUrl(); renderResults(); }, 150);
  });
  form.addEventListener('change', (event) => {
    const input = event.target;
    if (!input.matches('input[type="checkbox"]')) return;
    const list = state[input.name];
    state[input.name] = input.checked ? [...list, input.value] : list.filter((v) => v !== input.value);
    syncUrl();
    renderResults();
    form.querySelector(`#${CSS.escape(input.id)}`)?.focus();
  });
  form.addEventListener('submit', (event) => event.preventDefault());
  slot('active-filters').addEventListener('click', (event) => {
    const chip = event.target.closest('[data-remove-key]');
    if (!chip) return;
    const { removeKey, removeValue } = chip.dataset;
    if (removeKey === 'q') { state.q = ''; search.value = ''; }
    else state[removeKey] = state[removeKey].filter((v) => v !== removeValue);
    syncUrl();
    renderResults();
    search.focus();
  });
  $('[data-action="clear-filters"]').addEventListener('click', () => {
    Object.assign(state, emptyState(), { estado: [...DEFAULT_STATUSES] });
    search.value = '';
    syncUrl();
    renderResults();
  });
  const filtersToggle = $('.filters-toggle');
  filtersToggle.addEventListener('click', () => {
    const open = filtersToggle.getAttribute('aria-expanded') !== 'true';
    filtersToggle.setAttribute('aria-expanded', String(open));
    form.classList.toggle('is-open', open);
  });

  // --- Eventos: selección
  slot('resources').addEventListener('click', (event) => {
    const btn = event.target.closest('[data-toggle-select]');
    if (!btn) return;
    const id = btn.dataset.toggleSelect;
    toggleSelect(id);
    document.querySelector(`[data-toggle-select="${CSS.escape(id)}"]`)?.focus();
  });
  slot('selection').addEventListener('click', (event) => {
    const remove = event.target.closest('[data-toggle-select]');
    const move = event.target.closest('[data-move]');
    if (remove) toggleSelect(remove.dataset.toggleSelect);
    if (move) {
      const i = selection.indexOf(move.dataset.move);
      const j = i + Number(move.dataset.dir);
      if (i < 0 || j < 0 || j >= selection.length) return;
      [selection[i], selection[j]] = [selection[j], selection[i]];
      renderSelection();
      resetSheet();
      slot('selection').querySelector(`[data-move="${CSS.escape(move.dataset.move)}"][data-dir="${move.dataset.dir}"]:not([disabled])`)?.focus();
    }
  });
  $('[data-action="clear-selection"]').addEventListener('click', () => {
    selection = [];
    renderSelection();
    renderResults();
    resetSheet();
  });

  // --- Eventos: hoja
  $('[data-action="generate"]').addEventListener('click', () => {
    const items = selection.map((id) => byId.get(id));
    const sheet = slot('sheet');
    try {
      sheet.innerHTML = buildSheetHtml(items, { qrSvg, date: new Date(), labels: labels.languages });
      sheet.classList.add('is-ready');
      $('[data-action="print"]').disabled = false;
      sheet.focus();
    } catch (error) {
      console.error(error);
      sheet.innerHTML = '<p class="sheet-empty">No se pudo generar la hoja: el generador de QR no está disponible.</p>';
    }
  });
  $('[data-action="print"]').addEventListener('click', () => window.print());

  // La bandeja se oculta mientras la sección «Preparar» está a la vista.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      prepInView = entry.isIntersecting;
      slot('tray').hidden = selection.length === 0 || prepInView;
    }, { rootMargin: '0px 0px -30% 0px' }).observe($('#preparar'));
  }

  renderResults();
  renderSelection();
}

initNav();
loadCatalog()
  .then(init)
  .catch((error) => {
    console.error(error);
    slot('resources').innerHTML = `<li class="catalog-empty">No se pudo cargar la biblioteca. ${error.message}</li>`;
  });
