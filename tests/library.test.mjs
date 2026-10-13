// Biblioteca Respiratoria: catálogo, validador, filtros, hoja y QR.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import jsQR from 'jsqr';
import { validateCatalog, validateResource, normalizeUrl } from '../assets/js/library/validate.js';
import { filterResources, facetCounts, emptyState, stateToParams, paramsToState, isSheetEligible, FILTER_GROUPS } from '../assets/js/library/filter.js';
import { buildSheetHtml } from '../assets/js/library/sheet.js';
import { qrSvg } from '../assets/js/library/qr.js';

// Se ejecuta como script clásico, igual que en el navegador (<script defer>).
const sandbox = {};
vm.runInNewContext(readFileSync(new URL('../assets/vendor/qrcode-generator/qrcode.js', import.meta.url), 'utf8'), sandbox);
const { qrcode } = sandbox;
const catalog = JSON.parse(readFileSync(new URL('../assets/data/recursos.json', import.meta.url), 'utf8'));
const { taxonomies, resources } = catalog;

const base = () => ({
  id: 'demo', name: 'Demo', description: 'Descripción', organization: 'Org', url: 'https://example.org/a',
  pathologies: ['asma'], categories: ['educacion-sanitaria'], audiences: ['paciente'], format: 'web',
  language: 'es', status: 'verificado', lastChecked: '2026-10-13', contentUpdated: null,
  commercial: { status: 'no-evaluada', note: '' },
});

test('el catálogo real es válido y sin duplicados', () => {
  const { valid, invalid, duplicates } = validateCatalog(catalog);
  assert.deepEqual(invalid, []);
  assert.deepEqual(duplicates, []);
  assert.equal(valid.length, resources.length);
});

test('el catálogo cubre patologías más allá del asma', () => {
  for (const p of ['asma', 'epoc', 'bronquiectasias', 'fibrosis-pulmonar', 'apnea-sueno']) {
    assert.ok(resources.some((r) => r.pathologies.includes(p)), `sin recursos de ${p}`);
  }
});

test('ningún recurso declara verificación sin fecha ni fechas inventadas', () => {
  for (const r of resources) {
    if (r.status === 'verificado') assert.ok(r.lastChecked, r.id);
    if (r.status === 'pendiente') assert.equal(r.lastChecked, null, `${r.id}: pendiente con fecha de comprobación`);
  }
});

test('validador: detecta registros incompletos, URL incorrectas y valores fuera de taxonomía', () => {
  const errs = (patch) => validateResource({ ...base(), ...patch }, taxonomies);
  assert.deepEqual(errs({}), []);
  assert.ok(errs({ name: '' }).some((e) => e.includes('name')));
  assert.ok(errs({ url: 'notaurl' }).some((e) => e.includes('URL mal formada')));
  assert.ok(errs({ url: 'http://example.org' }).some((e) => e.includes('https')));
  assert.ok(errs({ pathologies: ['gripe'] }).some((e) => e.includes('patología')));
  assert.ok(errs({ format: 'podcast' }).some((e) => e.includes('formato')));
  assert.ok(errs({ status: 'verificado', lastChecked: null }).some((e) => e.includes('lastChecked')));
  assert.ok(errs({ lastChecked: '2026-02-30' }).some((e) => e.includes('lastChecked')));
  assert.ok(errs({ commercial: { status: 'si', note: '' } }).some((e) => e.includes('nota')));
  assert.ok(errs({ id: 'Mal Id' }).some((e) => e.includes('slug')));
});

test('validador: detecta duplicados por id, URL normalizada y nombre', () => {
  const a = base();
  const sameUrl = { ...base(), id: 'b', name: 'Otro', url: 'https://www.example.org/a/' };
  const sameName = { ...base(), id: 'c', name: 'DEMO', url: 'https://example.org/c' };
  const sameId = { ...base(), name: 'Tercero', url: 'https://example.org/d' };
  const { invalid, duplicates } = validateCatalog({ taxonomies, resources: [a, sameUrl, sameName, sameId] });
  assert.equal(duplicates.length, 3);
  assert.deepEqual(invalid.map((i) => i.id), ['b', 'c', 'demo']);
  assert.equal(normalizeUrl('https://www.Example.org/a/#x'), 'example.org/a');
});

const sample = [
  { ...base(), id: 'a1', name: 'Inhaladores vídeo', pathologies: ['asma', 'epoc'], categories: ['tecnica-inhalatoria'], format: 'video', language: 'en' },
  { ...base(), id: 'a2', name: 'Guía EPOC', pathologies: ['epoc'], categories: ['guias-clinicas'], audiences: ['farmaceutico'] },
  { ...base(), id: 'a3', name: 'Folleto CPAP', pathologies: ['apnea-sueno'], status: 'pendiente', lastChecked: null },
];

test('filtros: OR dentro del grupo, AND entre grupos y búsqueda sin acentos', () => {
  const s = (patch) => ({ ...emptyState(), ...patch });
  const ids = (st) => filterResources(sample, st).map((r) => r.id);
  assert.deepEqual(ids(s({})), ['a1', 'a2', 'a3']);
  assert.deepEqual(ids(s({ patologia: ['asma', 'apnea-sueno'] })), ['a1', 'a3']);
  assert.deepEqual(ids(s({ patologia: ['epoc'], formato: ['video'] })), ['a1']);
  assert.deepEqual(ids(s({ q: 'VIDEO inhaladores' })), ['a1']);
  assert.deepEqual(ids(s({ estado: ['pendiente'] })), ['a3']);
  assert.deepEqual(ids(s({ idioma: ['en'], destinatario: ['farmaceutico'] })), []);
});

test('facetas: el recuento ignora el propio grupo y respeta los demás', () => {
  const counts = facetCounts(sample, { ...emptyState(), patologia: ['epoc'] });
  assert.equal(counts.patologia.asma, 1);
  assert.equal(counts.patologia['apnea-sueno'], 1);
  assert.equal(counts.formato.video, 1);
  assert.equal(counts.formato.web, 1);
});

test('parámetros de URL: ida y vuelta, descartando valores desconocidos', () => {
  const st = { ...emptyState(), q: 'cpap', patologia: ['apnea-sueno'], categoria: ['adherencia'] };
  const back = paramsToState(stateToParams(st), taxonomies);
  assert.deepEqual(back, st);
  const dirty = paramsToState(new URLSearchParams('patologia=asma,<script>&formato=x'), taxonomies);
  assert.deepEqual(dirty.patologia, ['asma']);
  assert.deepEqual(dirty.formato, []);
  assert.equal(FILTER_GROUPS.length, 6);
});

test('hoja: solo recursos verificados para paciente o cuidador', () => {
  assert.equal(isSheetEligible(sample[0]), true);
  assert.equal(isSheetEligible(sample[1]), false, 'solo farmacéutico');
  assert.equal(isSheetEligible(sample[2]), false, 'pendiente');
});

test('hoja: incluye fuentes, URL, QR y fecha, escapa HTML y no pide datos del paciente', () => {
  const item = { ...sample[0], name: 'Vídeo <b>x</b>', organization: 'Asthma + Lung UK' };
  const html = buildSheetHtml([item], { qrSvg: (u) => `<svg data-qr="${u}"></svg>`, date: new Date('2026-10-13T10:00:00Z'), labels: { en: 'Inglés' } });
  assert.match(html, /Fuente: Asthma \+ Lung UK/);
  assert.match(html, /Idioma: Inglés/);
  assert.match(html, /https:\/\/example\.org\/a/);
  assert.match(html, /data-qr="https:\/\/example\.org\/a"/);
  assert.match(html, /13 de octubre de 2026/);
  assert.match(html, /Vídeo &lt;b&gt;x&lt;\/b&gt;/);
  assert.doesNotMatch(html, /<input|<textarea|paciente:|NHC|DNI/i);
});

test('QR: el código generado localmente se decodifica a la URL exacta', () => {
  qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
  const urls = resources.map((r) => r.url).concat('https://example.org/ruta?con=parámetros&y=ñ');
  for (const url of urls) {
    const qr = qrcode(0, 'M');
    qr.addData(url, 'Byte');
    qr.make();
    const n = qr.getModuleCount();
    const scale = 4;
    const quiet = 4;
    const size = (n + quiet * 2) * scale;
    const data = new Uint8ClampedArray(size * size * 4).fill(255);
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      if (!qr.isDark(r, c)) continue;
      for (let y = 0; y < scale; y++) for (let x = 0; x < scale; x++) {
        const i = (((r + quiet) * scale + y) * size + (c + quiet) * scale + x) * 4;
        data[i] = data[i + 1] = data[i + 2] = 0;
      }
    }
    const decoded = jsQR(data, size, size);
    assert.ok(decoded, `QR ilegible para ${url}`);
    assert.equal(decoded.data, url);
  }
  const svg = qrSvg('https://example.org', { qrcode });
  assert.match(svg, /^<svg[^>]*viewBox="0 0 \d+ \d+"/);
  assert.match(svg, /Código QR de https:\/\/example\.org/);
});
