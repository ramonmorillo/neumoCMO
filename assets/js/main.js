/**
 * neumoCMO · Punto de entrada
 * Renderiza las secciones a partir del catálogo y conecta la interacción
 * (navegación móvil, búsqueda y filtros). Sin dependencias externas.
 */
import { CMO_DIMENSIONS, CATEGORIES, TOOLS, TASKS, RESOURCES, ROADMAP } from './data/catalog.js';
import { filterTools } from './utils.js';
import * as tpl from './components/templates.js';

const $ = (selector, root = document) => root.querySelector(selector);
const slot = (name) => $(`[data-render="${name}"]`);

const toolsById = new Map(TOOLS.map((t) => [t.id, t]));
const categoryLabel = new Map(CATEGORIES.map((c) => [c.id, c.label]));

function renderStatic() {
  slot('tasks').innerHTML = TASKS.map((t) => tpl.taskCard(t, toolsById)).join('');
  slot('featured').innerHTML = TOOLS.map((t) => tpl.featuredCard(t, CMO_DIMENSIONS)).join('');
  slot('cmo').innerHTML = CMO_DIMENSIONS.map((d) => tpl.cmoColumn(d, TOOLS, ROADMAP)).join('');
  slot('resources').innerHTML = RESOURCES.map(tpl.resourceItem).join('');
  slot('roadmap').innerHTML = ROADMAP.map((r) => tpl.roadmapCard(r, CMO_DIMENSIONS)).join('');
}

function initCatalog() {
  const state = { query: '', category: 'todas' };
  const input = $('#catalog-search');
  const filters = slot('filters');
  const list = slot('catalog');
  const status = $('#catalog-status');
  const all = [{ id: 'todas', label: 'Todas' }, ...CATEGORIES];

  const draw = () => {
    filters.innerHTML = all.map((c) => tpl.filterButton(c, c.id === state.category)).join('');
    const results = filterTools(TOOLS, state);
    list.innerHTML = results.length
      ? results.map((t) => tpl.catalogItem(t, categoryLabel.get(t.category), CMO_DIMENSIONS)).join('')
      : '<li class="catalog-empty">No hay herramientas que coincidan. Prueba con otro término o categoría.</li>';
    status.textContent = `${results.length} de ${TOOLS.length} herramientas`;
  };

  input.addEventListener('input', () => {
    state.query = input.value;
    draw();
  });
  filters.addEventListener('click', (event) => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    state.category = button.dataset.category;
    draw();
    filters.querySelector(`[data-category="${state.category}"]`)?.focus();
  });
  draw();
}

function initNav() {
  const toggle = $('.nav-toggle');
  const nav = $('#site-nav');
  const label = $('.visually-hidden', toggle);
  const use = $('use', toggle);
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    label.textContent = open ? 'Cerrar menú' : 'Abrir menú';
    use.setAttribute('href', open ? '#i-close' : '#i-menu');
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });
}

renderStatic();
initCatalog();
initNav();
