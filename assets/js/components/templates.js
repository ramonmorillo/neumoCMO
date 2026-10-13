/**
 * Plantillas HTML de los componentes de la landing.
 * Funciones puras: reciben datos del catálogo y devuelven cadenas HTML.
 */
import { escapeHtml as e } from '../utils.js';

const NEW_TAB = '<span class="visually-hidden">(se abre en una pestaña nueva)</span>';

/** Ruta del sprite de iconos compartido (relativa a la raíz del sitio). */
export const ICON_SPRITE = 'assets/img/icons.svg';

export const icon = (name, cls = 'icon') =>
  `<svg class="${cls}" aria-hidden="true"><use href="${ICON_SPRITE}#i-${e(name)}"/></svg>`;

const externalAttrs = 'target="_blank" rel="noopener noreferrer"';

function cmoBadges(ids, dimensions) {
  return dimensions
    .filter((d) => ids.includes(d.id))
    .map((d) => `<span class="cmo-badge tone-${d.tone}" title="${e(d.name)}">${e(d.letter)}<span class="visually-hidden"> ${e(d.name)}</span></span>`)
    .join('');
}

export function taskCard(task, toolsById) {
  const tool = task.toolId ? toolsById.get(task.toolId) : null;
  const kind = task.roadmapId ? 'soon' : task.internal ? 'internal' : 'external';
  const attrs = kind === 'external' ? externalAttrs : '';
  const meta = {
    soon: '<span class="task-tool is-soon">Próximamente</span>',
    internal: `<span class="task-tool">${e(task.internal || '')}</span>`,
    external: `<span class="task-tool">${e(tool?.name || '')}</span>`,
  }[kind];
  return `
    <li>
      <a class="task-card${kind === 'soon' ? ' is-soon' : ''}" href="${e(task.href)}" ${attrs}>
        <span class="task-icon">${icon(task.icon)}</span>
        <span class="task-body">
          <span class="task-title">${e(task.title)}</span>
          <span class="task-hint">${e(task.hint)}</span>
          ${meta}
        </span>
        ${icon(kind === 'external' ? 'external' : 'arrow', 'icon task-go')}
        ${kind === 'external' ? NEW_TAB : ''}
      </a>
    </li>`;
}

export function featuredCard(tool, dimensions) {
  return `
    <article class="tool-card" aria-labelledby="tool-${e(tool.id)}">
      <div class="tool-card-top">
        <span class="tool-icon">${icon(tool.icon)}</span>
        <span class="cmo-badges" aria-label="Dimensiones CMO">${cmoBadges(tool.cmo, dimensions)}</span>
      </div>
      <h3 id="tool-${e(tool.id)}">${e(tool.name)}</h3>
      <p class="tool-tagline">${e(tool.tagline)}</p>
      <p class="tool-desc">${e(tool.description)}</p>
      <ul class="tool-features">
        ${tool.features.map((f) => `<li>${e(f)}</li>`).join('')}
      </ul>
      <div class="tool-actions">
        <a class="btn btn-primary btn-sm" href="${e(tool.url)}" ${externalAttrs}>Abrir herramienta ${icon('external')}${NEW_TAB}</a>
        <a class="btn btn-link btn-sm" href="${e(tool.source)}" ${externalAttrs}>${icon('code')} Repositorio${NEW_TAB}</a>
      </div>
    </article>`;
}

export function cmoColumn(dimension, tools, roadmap) {
  const items = tools.filter((t) => t.cmo.includes(dimension.id));
  const future = roadmap.filter((r) => r.cmo.includes(dimension.id));
  return `
    <article class="cmo-col tone-${e(dimension.tone)}" aria-labelledby="cmo-${e(dimension.id)}">
      <header class="cmo-col-head">
        <span class="cmo-letter" aria-hidden="true">${e(dimension.letter)}</span>
        <h3 id="cmo-${e(dimension.id)}">${e(dimension.name)}</h3>
      </header>
      <p>${e(dimension.summary)}</p>
      <ul class="cmo-items">
        ${items
          .map(
            (t) => `<li><a href="${e(t.url)}" ${externalAttrs}>${icon(t.icon)}<span>${e(t.name)}</span>${NEW_TAB}</a></li>`
          )
          .join('')}
        ${future
          .map((r) => `<li class="is-soon"><a href="#futuro">${icon(r.icon)}<span>${e(r.name)}</span><em>próximamente</em></a></li>`)
          .join('')}
      </ul>
    </article>`;
}

export function filterButton(category, active) {
  return `<button type="button" class="chip" data-category="${e(category.id)}" aria-pressed="${active}">${e(category.label)}</button>`;
}

export function catalogItem(tool, categoryLabel, dimensions) {
  return `
    <li class="catalog-item">
      <span class="tool-icon tool-icon-sm">${icon(tool.icon)}</span>
      <div class="catalog-body">
        <h3>${e(tool.name)} <span class="cat-label">${e(categoryLabel)}</span></h3>
        <p>${e(tool.tagline)}</p>
      </div>
      <span class="cmo-badges" aria-label="Dimensiones CMO">${cmoBadges(tool.cmo, dimensions)}</span>
      <a class="btn btn-ghost btn-sm" href="${e(tool.url)}" ${externalAttrs}>Abrir ${icon('external')}<span class="visually-hidden"> ${e(tool.name)} (se abre en una pestaña nueva)</span></a>
    </li>`;
}

export function resourceItem(resource) {
  return `
    <li>
      <a class="resource-card" href="${e(resource.url)}" ${externalAttrs}>
        <span class="resource-type">${e(resource.type)} · ${e(resource.publisher)}</span>
        <span class="resource-title">${e(resource.title)}</span>
        <span class="resource-note">${e(resource.note)}</span>
        ${icon('external', 'icon resource-go')}${NEW_TAB}
      </a>
    </li>`;
}

export function roadmapCard(item, dimensions) {
  return `
    <li class="roadmap-card" id="futuro-${e(item.id)}">
      <span class="tool-icon">${icon(item.icon)}</span>
      <h3>${e(item.name)}</h3>
      <p>${e(item.description)}</p>
      <div class="roadmap-foot">
        <span class="cmo-badges" aria-label="Dimensiones CMO">${cmoBadges(item.cmo, dimensions)}</span>
        <span class="soon-pill">En diseño</span>
      </div>
    </li>`;
}
