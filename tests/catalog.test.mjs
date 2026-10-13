// Integridad del catálogo: evita enlaces rotos por errores de edición,
// identificadores duplicados o referencias a categorías/dimensiones inexistentes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CMO_DIMENSIONS, CATEGORIES, TOOLS, TASKS, RESOURCES, ROADMAP } from '../assets/js/data/catalog.js';
import { filterTools, escapeHtml, normalize } from '../assets/js/utils.js';

const cmoIds = new Set(CMO_DIMENSIONS.map((d) => d.id));
const categoryIds = new Set(CATEGORIES.map((c) => c.id));
const toolIds = new Set(TOOLS.map((t) => t.id));
const roadmapIds = new Set(ROADMAP.map((r) => r.id));

const unique = (list) => new Set(list).size === list.length;

test('las cuatro herramientas iniciales están integradas', () => {
  const repos = TOOLS.map((t) => t.source).sort();
  assert.deepEqual(repos, [
    'https://github.com/ramonmorillo/adhefarmapexhub',
    'https://github.com/ramonmorillo/cmorespiratorio',
    'https://github.com/ramonmorillo/evidencegap-radar',
    'https://github.com/ramonmorillo/rxplain',
  ]);
});

test('identificadores únicos en cada colección', () => {
  for (const list of [CMO_DIMENSIONS, CATEGORIES, TOOLS, TASKS, RESOURCES, ROADMAP]) {
    assert.ok(unique(list.map((x) => x.id)));
  }
});

test('cada herramienta tiene campos completos, URL https y trazabilidad', () => {
  for (const t of TOOLS) {
    for (const key of ['name', 'tagline', 'description', 'url', 'source', 'evidence', 'icon']) {
      assert.ok(t[key], `${t.id}: falta ${key}`);
    }
    assert.match(t.url, /^https:\/\/ramonmorillo\.github\.io\/[\w-]+\/$/, `${t.id}: URL pública inesperada`);
    assert.match(t.source, /^https:\/\/github\.com\/ramonmorillo\/[\w-]+$/);
    assert.ok(categoryIds.has(t.category), `${t.id}: categoría desconocida`);
    assert.ok(t.cmo.length > 0 && t.cmo.every((c) => cmoIds.has(c)), `${t.id}: dimensión CMO desconocida`);
    assert.ok(t.features.length >= 2);
  }
});

test('cada tarea apunta a una herramienta o a la hoja de ruta existente', () => {
  for (const task of TASKS) {
    if (task.roadmapId) {
      assert.ok(roadmapIds.has(task.roadmapId), task.id);
      assert.equal(task.href, '#futuro');
    } else {
      assert.ok(toolIds.has(task.toolId), task.id);
      const tool = TOOLS.find((t) => t.id === task.toolId);
      assert.ok(task.href.startsWith(tool.url), `${task.id}: el enlace no pertenece a ${tool.name}`);
    }
  }
});

test('recursos y hoja de ruta bien formados', () => {
  for (const r of RESOURCES) assert.match(r.url, /^https:\/\//, r.id);
  for (const r of ROADMAP) assert.ok(r.cmo.every((c) => cmoIds.has(c)), r.id);
  assert.deepEqual(
    ROADMAP.map((r) => r.id),
    ['next-best-action', 'consulta-builder', 'tecnica-inhalatoria', 'seguimiento-longitudinal']
  );
});

test('búsqueda: sin acentos, multi-término y por categoría', () => {
  assert.equal(filterTools(TOOLS).length, TOOLS.length);
  assert.deepEqual(filterTools(TOOLS, { query: 'INFOGRAFIA' }).map((t) => t.id), ['rxplain']);
  assert.deepEqual(filterTools(TOOLS, { query: 'pubmed pico' }).map((t) => t.id), ['evidencegap-radar']);
  assert.deepEqual(filterTools(TOOLS, { category: 'adherencia' }).map((t) => t.id), ['mapex-adhefar-hub']);
  assert.equal(filterTools(TOOLS, { query: 'adherencia', category: 'evidencia' }).length, 0);
  assert.equal(filterTools(TOOLS, { query: '   ' }).length, TOOLS.length);
});

test('utilidades', () => {
  assert.equal(escapeHtml('<a href="x">&\'</a>'), '&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;');
  assert.equal(normalize('  Motivación '), 'motivacion');
});
