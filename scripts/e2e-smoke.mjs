// Prueba E2E de humo: sirve el sitio en local y lo recorre con Chromium en
// escritorio y móvil (landing + Biblioteca Respiratoria). Requiere Playwright
// disponible (no es dependencia del proyecto): `npm i --no-save playwright`
// o una instalación global (NODE_PATH). Las peticiones a Internet se bloquean.
// Uso: npm run test:e2e   (capturas y PDF en E2E_OUT, por defecto ./e2e-output)
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import jsQR from 'jsqr';

const root = fileURLToPath(new URL('..', import.meta.url));
const out = process.env.E2E_OUT || join(root, 'e2e-output');
const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  ({ chromium } = require(join(process.env.NODE_PATH || '/usr/local/lib/node_modules', 'playwright')));
}

const types = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json',
};
const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  const file = join(root, path.endsWith('/') ? `${path}index.html` : path);
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404).end('404');
  }
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}/`;
await mkdir(out, { recursive: true });

const catalog = JSON.parse(await readFile(join(root, 'assets/data/recursos.json'), 'utf8'));
// Datos de prueba: marca como verificados tres recursos para pacientes para
// ejercitar selección y hoja con independencia del estado real del catálogo.
const FIXTURE_IDS = catalog.resources.filter((r) => r.audiences.includes('paciente')).slice(0, 3).map((r) => r.id);
const fixture = structuredClone(catalog);
for (const r of fixture.resources) if (FIXTURE_IDS.includes(r.id)) Object.assign(r, { status: 'verificado', lastChecked: '2026-10-13' });

const failures = [];
const check = (cond, msg) => { if (!cond) failures.push(msg); console.log(`${cond ? 'ok  ' : 'FAIL'} ${msg}`); };

async function newPage(browser, vp) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && errors.push(`${m.type()}: ${m.text()}`));
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
  return { page, errors };
}

async function commonChecks(page, label) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(overflow <= 0, `[${label}] sin desplazamiento horizontal (exceso ${overflow}px)`);
  const small = await page.$$eval('a.btn, button, .task-card, .cmo-items a, .filter-fieldset label', (els) =>
    els.filter((el) => el.offsetParent && el.getBoundingClientRect().height < 40).map((el) => el.textContent.trim().slice(0, 30)));
  check(small.length === 0, `[${label}] objetivos táctiles ≥40px (${small.join(' | ')})`);
  const bad = await page.$$eval('a', (as) => as.filter((a) => !a.getAttribute('href') ||
    (/^https?:/.test(a.href) && !a.href.startsWith(location.origin) && a.target !== '_blank' && !a.closest('noscript'))).map((a) => a.outerHTML.slice(0, 80)));
  check(bad.length === 0, `[${label}] enlaces externos con target=_blank (${bad.length} incorrectos)`);
  const brokenIcons = await page.$$eval('use', (uses) => uses.map((u) => u.getAttribute('href')).filter((h) => !h.startsWith('assets/img/icons.svg#i-')));
  check(brokenIcons.length === 0, `[${label}] iconos desde el sprite compartido (${brokenIcons.join(', ')})`);
}

/** Rasteriza en el navegador el SVG de cada QR y lo decodifica con jsQR. */
async function decodeSheetQrs(page) {
  const images = await page.$$eval('.sheet-qr svg', (svgs) => Promise.all(svgs.map((svg) => new Promise((resolve) => {
    const size = 400;
    const img = new Image();
    img.onload = () => {
      const canvas = Object.assign(document.createElement('canvas'), { width: size, height: size });
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      resolve(Array.from(ctx.getImageData(0, 0, size, size).data));
    };
    img.onerror = () => resolve(null);
    const xml = new XMLSerializer().serializeToString(svg);
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
  }))));
  return images.map((px) => (px ? jsQR(new Uint8ClampedArray(px), 400, 400)?.data ?? null : null));
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
for (const vp of [{ name: 'desktop', width: 1366, height: 900 }, { name: 'mobile', width: 375, height: 812 }]) {
  // ------------------------------------------------------------ Landing
  {
    const { page, errors } = await newPage(browser, vp);
    await page.goto(base, { waitUntil: 'load' });
    await page.keyboard.press('Tab');
    check(await page.evaluate(() => document.activeElement.className) === 'skip-link', `[${vp.name}] landing: «Saltar al contenido» por teclado`);
    check(await page.locator('.task-card').count() === 6, `[${vp.name}] landing: 6 tareas`);
    check(await page.locator('.tool-card').count() === 4, `[${vp.name}] landing: 4 herramientas destacadas`);
    check(await page.locator('.cmo-col').count() === 3, `[${vp.name}] landing: 3 columnas CMO`);
    check(await page.locator('.roadmap-card').count() === 4, `[${vp.name}] landing: 4 funcionalidades futuras`);
    check(await page.locator('#biblioteca a[href="biblioteca.html"]').count() === 1, `[${vp.name}] landing: acceso a la biblioteca`);
    check(await page.locator('.task-card[href^="biblioteca.html?categoria=tecnica-inhalatoria"]').count() === 1, `[${vp.name}] landing: tarea técnica inhalatoria → biblioteca filtrada`);
    await page.fill('#catalog-search', 'infografia');
    check(await page.locator('.catalog-item').count() === 1, `[${vp.name}] landing: búsqueda de herramientas`);
    await page.fill('#catalog-search', '');
    if (vp.name === 'mobile') {
      await page.click('.nav-toggle');
      check(await page.locator('#site-nav').isVisible(), '[mobile] landing: menú se abre');
      await page.screenshot({ path: join(out, 'mobile-menu.png') });
      await page.click('#site-nav a[href="#catalogo"]');
      check(!(await page.locator('#site-nav').isVisible()), '[mobile] landing: menú se cierra al navegar');
    }
    await commonChecks(page, `${vp.name} landing`);
    check(errors.length === 0, `[${vp.name}] landing: sin errores ni avisos de consola (${errors.join(' | ')})`);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: join(out, `${vp.name}-landing.png`), fullPage: true });
    await page.close();
  }

  // ------------------------------------------------------- Biblioteca (datos reales)
  {
    const { page, errors } = await newPage(browser, vp);
    await page.goto(`${base}biblioteca.html`, { waitUntil: 'networkidle' });
    const total = catalog.resources.filter((r) => r.status !== 'no-disponible').length;
    check(await page.locator('.res-card').count() === total, `[${vp.name}] biblioteca: ${total} recursos visibles por defecto`);
    check(await page.locator('.own-tool').count() === 4, `[${vp.name}] biblioteca: 4 herramientas propias diferenciadas`);
    check(await page.locator('.res-card .origin-pill:text("Recurso externo")').count() === total, `[${vp.name}] biblioteca: recursos marcados como externos`);
    const pending = await page.locator('.res-card.status-pendiente').count();
    check(await page.locator('.res-card.status-pendiente [data-toggle-select]').count() === 0, `[${vp.name}] biblioteca: pendientes (${pending}) no seleccionables`);
    check(await page.locator('.res-card.status-pendiente .link-unverified').count() === pending, `[${vp.name}] biblioteca: pendientes marcados «Enlace sin verificar»`);
    if (vp.name === 'mobile') {
      check(!(await page.locator('#filters-panel').isVisible()), '[mobile] biblioteca: filtros plegados por defecto');
      await page.click('.filters-toggle');
      check(await page.locator('#filters-panel').isVisible(), '[mobile] biblioteca: filtros se despliegan');
    }
    await page.check('#f-patologia-epoc');
    const epoc = catalog.resources.filter((r) => r.pathologies.includes('epoc') && r.status !== 'no-disponible').length;
    check(await page.locator('.res-card').count() === epoc, `[${vp.name}] biblioteca: filtro EPOC → ${epoc}`);
    check(page.url().includes('patologia=epoc'), `[${vp.name}] biblioteca: filtro reflejado en la URL`);
    await page.check('#f-categoria-cuestionarios');
    const epocCuest = catalog.resources.filter((r) => r.pathologies.includes('epoc') && r.categories.includes('cuestionarios')).length;
    check(await page.locator('.res-card').count() === epocCuest, `[${vp.name}] biblioteca: EPOC + Cuestionarios (AND) → ${epocCuest}`);
    await page.reload({ waitUntil: 'networkidle' });
    check(await page.locator('.res-card').count() === epocCuest, `[${vp.name}] biblioteca: filtros persisten al recargar (URL)`);
    await page.locator('.chip-removable').first().click();
    check(await page.locator('.chip-removable').count() === 1, `[${vp.name}] biblioteca: quitar filtro desde chip`);
    await page.click('[data-action="clear-filters"]');
    await page.fill('#lib-search', 'cpap');
    await page.waitForTimeout(300);
    check(await page.locator('.res-card').count() >= 1, `[${vp.name}] biblioteca: búsqueda «cpap»`);
    await page.fill('#lib-search', 'zzz-sin-resultados');
    await page.waitForTimeout(300);
    check(await page.locator('.catalog-empty').isVisible(), `[${vp.name}] biblioteca: estado vacío`);
    await page.goto(`${base}biblioteca.html?categoria=tecnica-inhalatoria`, { waitUntil: 'networkidle' });
    const inh = catalog.resources.filter((r) => r.categories.includes('tecnica-inhalatoria')).length;
    check(await page.locator('.res-card').count() === inh, `[${vp.name}] biblioteca: enlace profundo ?categoria=tecnica-inhalatoria → ${inh}`);
    await commonChecks(page, `${vp.name} biblioteca`);
    check(errors.length === 0, `[${vp.name}] biblioteca: sin errores ni avisos de consola (${errors.join(' | ')})`);
    await page.goto(`${base}biblioteca.html`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: join(out, `${vp.name}-biblioteca.png`), fullPage: true });
    await page.close();
  }

  // ------------------------------------------------ Biblioteca (selección y hoja)
  {
    const { page, errors } = await newPage(browser, vp);
    await page.route('**/assets/data/recursos.json', (route) => route.fulfill({ contentType: 'application/json', body: JSON.stringify(fixture) }));
    await page.addInitScript(() => { window.__printed = 0; window.print = () => { window.__printed += 1; }; });
    await page.goto(`${base}biblioteca.html`, { waitUntil: 'networkidle' });
    check(await page.locator('[data-action="generate"]').isDisabled(), `[${vp.name}] hoja: «Generar» desactivado sin selección`);
    const [id1, id2, id3] = FIXTURE_IDS;
    for (const id of [id1, id2, id3]) await page.click(`#r-${id} [data-toggle-select]`);
    check(await page.locator('.sel-item').count() === 3, `[${vp.name}] hoja: 3 recursos seleccionados`);
    await page.locator('#explorar').scrollIntoViewIfNeeded();
    await page.evaluate(() => document.getElementById('explorar').scrollIntoView());
    await page.waitForTimeout(200);
    check(await page.locator('[data-render="tray"]').isVisible(), `[${vp.name}] hoja: bandeja de selección visible al explorar`);
    check(await page.getAttribute(`#r-${id1} [data-toggle-select]`, 'aria-pressed') === 'true', `[${vp.name}] hoja: botón con aria-pressed`);
    await page.click(`#r-${id3} [data-toggle-select]`);
    check(await page.locator('.sel-item').count() === 2, `[${vp.name}] hoja: deseleccionar desde la tarjeta`);
    await page.click(`.sel-item [data-move="${id2}"][data-dir="-1"]`);
    const order = await page.$$eval('.sel-name', (els) => els.map((e) => e.textContent));
    const name = (id) => fixture.resources.find((r) => r.id === id).name;
    check(order[0] === name(id2) && order[1] === name(id1), `[${vp.name}] hoja: reordenar selección`);
    await page.reload({ waitUntil: 'networkidle' });
    check(await page.locator('.sel-item').count() === 2, `[${vp.name}] hoja: selección conservada en la sesión`);
    await page.locator('#preparar').scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    check(!(await page.locator('[data-render="tray"]').isVisible()), `[${vp.name}] hoja: bandeja oculta en «Preparar»`);
    await page.click('[data-action="generate"]');
    check(await page.locator('.sheet-item').count() === 2, `[${vp.name}] hoja: 2 elementos en la hoja`);
    check(await page.locator('.sheet-qr svg').count() === 2, `[${vp.name}] hoja: 2 códigos QR`);
    const decoded = await decodeSheetQrs(page);
    const expected = [id2, id1].map((id) => fixture.resources.find((r) => r.id === id).url);
    check(JSON.stringify(decoded) === JSON.stringify(expected), `[${vp.name}] hoja: QR decodificados = URL de origen (${decoded.join(' , ')})`);
    const sheetText = await page.locator('.sheet').innerText();
    check(/Fuente:/.test(sheetText) && /Hoja generada el/.test(sheetText), `[${vp.name}] hoja: fuentes y fecha de generación`);
    check(await page.locator('main input:not([type="search"]):not([type="checkbox"]), main textarea').count() === 0, `[${vp.name}] hoja: sin campos de datos del paciente`);
    await page.click('[data-action="print"]');
    check(await page.evaluate(() => window.__printed) === 1, `[${vp.name}] hoja: «Imprimir / Guardar PDF» invoca la impresión`);
    await page.emulateMedia({ media: 'print' });
    const visibleOutside = await page.evaluate(() => [...document.querySelectorAll('h1, .res-card, .site-footer, .prep-selection, .site-header')].filter((el) => el.getClientRects().length > 0).length);
    check(visibleOutside === 0, `[${vp.name}] hoja: al imprimir solo se muestra la hoja`);
    if (vp.name === 'desktop') {
      const pdf = await page.pdf({ path: join(out, 'hoja-educativa.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
      const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
      check(pages === 1, `[desktop] hoja: PDF local de 2 recursos en ${pages} página(s), esperado 1`);
    }
    await page.emulateMedia({ media: 'screen' });
    await page.locator('#preparar').screenshot({ path: join(out, `${vp.name}-hoja.png`) });
    check(errors.length === 0, `[${vp.name}] hoja: sin errores ni avisos de consola (${errors.join(' | ')})`);
    await page.close();
  }
}
await browser.close();
server.close();

if (failures.length) {
  console.error(`\n${failures.length} comprobación(es) fallida(s)`);
  process.exit(1);
}
console.log('\nE2E OK · capturas en', out);
