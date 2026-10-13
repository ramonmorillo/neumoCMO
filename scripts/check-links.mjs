// Comprobación de enlaces de la Biblioteca Respiratoria.
// - Solicita cada URL (GET, redirecciones, tiempo límite) y registra código
//   HTTP, URL final, tipo de contenido y <title> (para revisar que el enlace
//   corresponde al recurso).
// - Por defecto solo informa. Con --write actualiza recursos.json:
//     2xx  → status «verificado» y lastChecked = hoy
//     404/410 → status «no-disponible» y lastChecked = hoy
//     otros (403, 5xx, red) → sin cambios (no concluyente)
//   Revise siempre el título antes de confirmar el cambio.
// - Con --probes comprueba también scripts/link-probes.json.
// Uso: npm run check:links [-- --write] [-- --probes]
// Requiere acceso a Internet (p. ej. GitHub Actions o equipo local).
import { readFile, writeFile, appendFile } from 'node:fs/promises';

const args = new Set(process.argv.slice(2));
const dataFile = new URL('../assets/data/recursos.json', import.meta.url);
const catalog = JSON.parse(await readFile(dataFile, 'utf8'));
const targets = catalog.resources.map((r) => ({ id: r.id, url: r.url, kind: 'recurso' }));
if (args.has('--probes')) {
  const probes = JSON.parse(await readFile(new URL('./link-probes.json', import.meta.url), 'utf8'));
  targets.push(...probes.probes.map((p) => ({ id: p.id, url: p.url, kind: 'sonda' })));
}

const UA = 'Mozilla/5.0 (compatible; neumoCMO-linkcheck/1.0; +https://github.com/ramonmorillo/neumoCMO)';
const today = new Date().toISOString().slice(0, 10);

async function check(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'user-agent': UA, accept: 'text/html,application/pdf;q=0.9,*/*;q=0.8', 'accept-language': 'es-ES,es;q=0.9,en;q=0.7' },
    });
    const type = res.headers.get('content-type') || '';
    let title = '';
    if (type.includes('html')) {
      const text = (await res.text()).slice(0, 200000);
      title = (text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').replace(/\s+/g, ' ').trim().slice(0, 140);
    } else {
      await res.body?.cancel();
    }
    return { code: res.status, finalUrl: res.url, type: type.split(';')[0], title };
  } catch (error) {
    return { code: 0, finalUrl: '', type: '', title: '', error: error.name === 'AbortError' ? 'timeout' : error.cause?.code || error.message };
  } finally {
    clearTimeout(timer);
  }
}

const results = [];
for (const t of targets) {
  const r = await check(t.url);
  results.push({ ...t, ...r });
  console.log(`${String(r.code).padEnd(3)} ${t.kind.padEnd(7)} ${t.id.padEnd(34)} ${r.type.padEnd(16)} ${r.title || r.error || ''}${r.finalUrl && r.finalUrl !== t.url ? `  → ${r.finalUrl}` : ''}`);
}

const ok = results.filter((r) => r.code >= 200 && r.code < 300).length;
const gone = results.filter((r) => r.code === 404 || r.code === 410).length;
console.log(`\nResumen ${today}: ${ok} OK · ${gone} no disponibles · ${results.length - ok - gone} no concluyentes · total ${results.length}`);
console.log(`JSON:${JSON.stringify({ date: today, results })}`);

if (process.env.GITHUB_STEP_SUMMARY) {
  const rows = results.map((r) => `| ${r.kind} | ${r.id} | ${r.code || r.error} | ${(r.title || '').replace(/\|/g, '/')} |`).join('\n');
  await appendFile(process.env.GITHUB_STEP_SUMMARY, `## Comprobación de enlaces (${today})\n\n| Tipo | Id | HTTP | Título |\n|---|---|---|---|\n${rows}\n`);
}

if (args.has('--write')) {
  for (const res of catalog.resources) {
    const r = results.find((x) => x.id === res.id);
    if (!r) continue;
    if (r.code >= 200 && r.code < 300) Object.assign(res, { status: 'verificado', lastChecked: today });
    else if (r.code === 404 || r.code === 410) Object.assign(res, { status: 'no-disponible', lastChecked: today });
  }
  await writeFile(dataFile, `${JSON.stringify(catalog, null, 2)}\n`);
  console.log('recursos.json actualizado. Revise los títulos antes de confirmar el cambio.');
}
