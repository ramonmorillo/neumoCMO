// Intenta extraer las URL originales del webmix de Symbaloo usado como
// fuente inicial. Symbaloo genera el mosaico con JavaScript, por lo que la
// extracción puede ser parcial o nula: el resultado se documenta tal cual
// en AUDITORIA_RECURSOS.md, sin completar huecos por suposición.
// Uso: node scripts/symbaloo-audit.mjs [url]
const source = process.argv[2] || 'https://www.symbaloo.com/mix/asma-para-pacientes';
const UA = 'Mozilla/5.0 (compatible; neumoCMO-audit/1.0; +https://github.com/ramonmorillo/neumoCMO)';

try {
  const res = await fetch(source, { headers: { 'user-agent': UA, 'accept-language': 'es-ES,es;q=0.9' } });
  const html = await res.text();
  console.log(`Symbaloo: HTTP ${res.status} · ${html.length} bytes · título: ${(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').trim()}`);
  const decoded = html.replace(/\\u002F/gi, '/').replace(/\\\//g, '/').replace(/&amp;/g, '&');
  const urls = [...new Set(decoded.match(/https?:\/\/[^\s"'<>\\)]+/g) || [])]
    .filter((u) => !/symbaloo\.com|symbalooedu|googleapis|gstatic|google-analytics|googletagmanager|facebook|twitter|cloudfront|doubleclick|schema\.org|w3\.org|cookie|onetrust|fonts\./i.test(u));
  console.log(`URL externas encontradas en el HTML: ${urls.length}`);
  for (const u of urls) console.log(`  ${u}`);
  const names = [...new Set((decoded.match(/"name"\s*:\s*"([^"]{2,80})"/g) || []).map((m) => m.replace(/^"name"\s*:\s*"/, '').replace(/"$/, '')))];
  if (names.length) {
    console.log(`Posibles nombres de mosaico: ${names.length}`);
    for (const n of names) console.log(`  · ${n}`);
  }
} catch (error) {
  console.log(`No se pudo leer Symbaloo: ${error.cause?.code || error.message}`);
}
