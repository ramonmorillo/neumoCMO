// Prueba E2E de humo: sirve el sitio en local y lo recorre con Chromium
// en escritorio y móvil. Requiere Playwright disponible (no es dependencia
// del proyecto): `npm i --no-save playwright` o una instalación global.
// Uso: npm run test:e2e   (capturas en E2E_OUT, por defecto ./e2e-output)
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = fileURLToPath(new URL('..', import.meta.url));
const out = process.env.E2E_OUT || join(root, 'e2e-output');
const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  ({ chromium } = require(join(process.env.NODE_PATH || '/usr/local/lib/node_modules', 'playwright')));
}

const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };
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

const failures = [];
const check = (cond, msg) => { if (!cond) failures.push(msg); console.log(`${cond ? 'ok  ' : 'FAIL'} ${msg}`); };

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
for (const vp of [{ name: 'desktop', width: 1366, height: 900 }, { name: 'mobile', width: 375, height: 812 }]) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
  await page.goto(base, { waitUntil: 'load' });

  // Navegación (con la página recién cargada) por teclado: el primer Tab lleva al enlace de salto
  await page.keyboard.press('Tab');
  check(await page.evaluate(() => document.activeElement.className) === 'skip-link', `[${vp.name}] enlace «Saltar al contenido» accesible por teclado`);

  check(errors.length === 0, `[${vp.name}] sin errores de consola (${errors.join(' | ')})`);
  check(await page.locator('.task-card').count() === 6, `[${vp.name}] 6 tareas «¿Qué necesitas hacer hoy?»`);
  check(await page.locator('.tool-card').count() === 4, `[${vp.name}] 4 herramientas destacadas`);
  check(await page.locator('.cmo-col').count() === 3, `[${vp.name}] 3 columnas CMO`);
  check(await page.locator('.roadmap-card').count() === 4, `[${vp.name}] 4 funcionalidades futuras`);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(overflow <= 0, `[${vp.name}] sin desplazamiento horizontal (exceso ${overflow}px)`);
  const smallTargets = await page.$$eval('a.btn, button, .task-card, .cmo-items a', (els) =>
    els.filter((el) => el.offsetParent && el.getBoundingClientRect().height < 40).length);
  check(smallTargets === 0, `[${vp.name}] objetivos táctiles ≥40px (${smallTargets} menores)`);

  // Búsqueda y filtros
  await page.fill('#catalog-search', 'infografia');
  check(await page.locator('.catalog-item').count() === 1, `[${vp.name}] búsqueda «infografia» → 1 resultado`);
  await page.fill('#catalog-search', 'xyz-sin-resultados');
  check(await page.locator('.catalog-empty').isVisible(), `[${vp.name}] estado vacío visible`);
  await page.fill('#catalog-search', '');
  await page.click('[data-category="evidencia"]');
  check(await page.locator('.catalog-item').count() === 1, `[${vp.name}] filtro «Evidencia» → 1 resultado`);
  check(await page.getAttribute('[data-category="evidencia"]', 'aria-pressed') === 'true', `[${vp.name}] aria-pressed en filtro activo`);
  await page.click('[data-category="todas"]');

  if (vp.name === 'mobile') {
    check(!(await page.locator('#site-nav').isVisible()), '[mobile] menú cerrado por defecto');
    await page.click('.nav-toggle');
    check(await page.locator('#site-nav').isVisible(), '[mobile] menú se abre');
    check(await page.getAttribute('.nav-toggle', 'aria-expanded') === 'true', '[mobile] aria-expanded=true');
    await page.screenshot({ path: join(out, 'mobile-menu.png') });
    await page.click('#site-nav a[href="#catalogo"]');
    check(!(await page.locator('#site-nav').isVisible()), '[mobile] menú se cierra al navegar');
  }

  // Todos los enlaces externos abren en pestaña nueva y no hay href vacíos
  const badLinks = await page.$$eval('a', (as) => as.filter((a) => !a.getAttribute('href') ||
    (/^https?:/.test(a.href) && !a.href.startsWith(location.origin) && a.target !== '_blank' && !a.closest('noscript'))).map((a) => a.outerHTML));
  check(badLinks.length === 0, `[${vp.name}] enlaces externos con target=_blank (${badLinks.length} incorrectos)`);

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: join(out, `${vp.name}-full.png`), fullPage: true });
  await page.close();
}
await browser.close();
server.close();

if (failures.length) {
  console.error(`\n${failures.length} comprobación(es) fallida(s)`);
  process.exit(1);
}
console.log('\nE2E OK · capturas en', out);
