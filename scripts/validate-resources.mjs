// Valida assets/data/recursos.json: campos obligatorios, taxonomías, URL,
// fechas, coherencia de estado y duplicados. Sale con código 1 si hay errores.
// Uso: npm run validate:resources
import { readFile } from 'node:fs/promises';
import { validateCatalog } from '../assets/js/library/validate.js';

const file = new URL('../assets/data/recursos.json', import.meta.url);
const catalog = JSON.parse(await readFile(file, 'utf8'));
const { valid, invalid } = validateCatalog(catalog);

const byStatus = valid.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] || 0) + 1 }), {});
console.log(`Recursos válidos: ${valid.length} · ${JSON.stringify(byStatus)}`);
for (const item of invalid) console.error(`✗ ${item.id}: ${item.errors.join('; ')}`);
if (invalid.length) {
  console.error(`\n${invalid.length} recurso(s) con errores.`);
  process.exit(1);
}
console.log('Catálogo correcto.');
