// Comprobaciones estáticas de index.html: anclas internas, iconos,
// accesibilidad básica y ausencia de recursos de terceros no previstos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { TASKS, ROADMAP } from '../assets/js/data/catalog.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const library = readFileSync(new URL('../biblioteca.html', import.meta.url), 'utf8');
const sprite = readFileSync(new URL('../assets/img/icons.svg', import.meta.url), 'utf8');
const libTemplates = readFileSync(new URL('../assets/js/library/templates.js', import.meta.url), 'utf8');
const spriteIds = new Set([...sprite.matchAll(/<symbol id="([^"]+)"/g)].map((m) => m[1]));
const templates = readFileSync(new URL('../assets/js/components/templates.js', import.meta.url), 'utf8');
const catalog = readFileSync(new URL('../assets/js/data/catalog.js', import.meta.url), 'utf8');
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));

test('documento en español con título, descripción y viewport', () => {
  assert.match(html, /<html lang="es">/);
  assert.match(html, /<title>[^<]+<\/title>/);
  assert.match(html, /<meta name="description" content="[^"]{50,}">/);
  assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
});

test('todas las anclas internas existen', () => {
  const anchors = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
  anchors.push(...TASKS.filter((t) => t.href.startsWith('#')).map((t) => t.href.slice(1)));
  for (const a of anchors) assert.ok(ids.has(a), `ancla rota: #${a}`);
});

test('todos los iconos usados están definidos en el sprite compartido', () => {
  const used = new Set([
    ...[...(html + library).matchAll(/icons\.svg#i-([\w-]+)"/g)].map((m) => m[1]),
    ...[...(templates + libTemplates).matchAll(/icon\('([\w-]+)'/g)].map((m) => m[1]),
    ...[...catalog.matchAll(/icon: '([\w-]+)'/g)].map((m) => m[1]),
    'close', 'menu', 'video', 'file', 'globe', 'tool', 'check', 'clock', 'alert',
  ]);
  for (const name of used) assert.ok(spriteIds.has(`i-${name}`), `icono sin definir: ${name}`);
  assert.doesNotMatch(html + library, /href="#i-/, 'referencia a sprite inline obsoleta');
});

test('biblioteca: anclas internas, h1 único y enlaces locales existentes', () => {
  const libIds = new Set([...library.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of library.matchAll(/href="#([^"]+)"/g)) assert.ok(libIds.has(m[1]), `ancla rota en biblioteca: #${m[1]}`);
  assert.equal((library.match(/<h1[\s>]/g) || []).length, 1);
  assert.match(library, /<html lang="es">/);
  for (const m of library.matchAll(/(?:src|href)="([^"#?]+)/g)) {
    const s = m[1];
    if (/^https?:/.test(s)) continue;
    assert.ok(existsSync(new URL(`../${s}`, import.meta.url)), `no existe: ${s}`);
  }
  for (const m of [...library.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)]) assert.match(m[0], /rel="noopener noreferrer"/);
  assert.doesNotMatch(library, /<script[^>]+src="https?:/);
  assert.doesNotMatch(library, /<input[^>]+(name|id)="[^"]*(paciente|nhc|dni|cip|nombre)/i, 'no debe pedir datos del paciente');
});

test('un único h1 y estructura de secciones etiquetadas', () => {
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1);
  for (const id of ['hoy', 'destacadas', 'cmo', 'catalogo', 'recursos', 'futuro']) {
    assert.match(html, new RegExp(`<section[^>]*id="${id}"[^>]*aria-labelledby="${id}-title"`), id);
    assert.ok(ids.has(`${id}-title`), `${id}-title`);
  }
});

test('accesibilidad: enlace de salto, botón de menú y búsqueda etiquetada', () => {
  assert.match(html, /class="skip-link" href="#contenido"/);
  assert.match(html, /class="nav-toggle"[^>]*aria-expanded="false"[^>]*aria-controls="site-nav"/);
  assert.match(html, /<label for="catalog-search"/);
});

test('los enlaces externos que abren pestaña nueva usan rel="noopener noreferrer"', () => {
  for (const source of [html, templates]) {
    for (const m of source.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
      assert.match(m[0], /rel="noopener noreferrer"/, m[0]);
    }
  }
  assert.match(templates, /const externalAttrs = 'target="_blank" rel="noopener noreferrer"'/);
});

test('sin scripts, fuentes ni hojas de estilo de terceros', () => {
  const srcs = [...html.matchAll(/(?:src|href)="([^"#?]+)/g)].map((m) => m[1]);
  const local = srcs.filter((s) => !/^https?:/.test(s));
  for (const s of local) assert.ok(existsSync(new URL(`../${s}`, import.meta.url)), `no existe: ${s}`);
  assert.doesNotMatch(html, /<script[^>]+src="https?:/);
  assert.doesNotMatch(html, /<link[^>]+rel="stylesheet"[^>]+href="https?:/);
});

test('las funcionalidades futuras son las solicitadas', () => {
  assert.equal(ROADMAP.length, 4);
});
