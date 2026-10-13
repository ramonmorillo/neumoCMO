/**
 * Hoja educativa imprimible (función pura).
 * Recibe los recursos seleccionados, una función que genera el SVG del QR
 * y la fecha; devuelve el HTML de la hoja. No contiene datos de pacientes.
 */
import { escapeHtml as e } from '../utils.js';

export function formatDate(date) {
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
}

export function buildSheetHtml(resources, { qrSvg, date = new Date(), labels = {} } = {}) {
  const items = resources
    .map(
      (r, i) => `
      <li class="sheet-item">
        <div class="sheet-qr" aria-hidden="true">${qrSvg(r.url)}</div>
        <div class="sheet-text">
          <h3><span class="sheet-num">${i + 1}.</span> ${e(r.name)}</h3>
          <p>${e(r.description)}</p>
          <p class="sheet-source">Fuente: ${e(r.organization)}${r.language !== 'es' ? ` · Idioma: ${e(labels[r.language] || r.language)}` : ''}</p>
          <p class="sheet-url">${e(r.url)}</p>
        </div>
      </li>`
    )
    .join('');
  return `
    <header class="sheet-head">
      <p class="sheet-brand">neumo<strong>CMO</strong> · Farmacia Hospitalaria</p>
      <h2>Recursos de información para usted</h2>
      <p class="sheet-intro">Su farmacéutico/a ha seleccionado estos materiales de fuentes externas para ayudarle a conocer mejor su enfermedad y su tratamiento. Escanee el código QR con la cámara del móvil o escriba la dirección en el navegador.</p>
    </header>
    <ol class="sheet-list">${items}</ol>
    <footer class="sheet-foot">
      <p>Los contenidos pertenecen a las organizaciones indicadas como fuente; neumoCMO no los modifica. Esta información no sustituye las indicaciones de su equipo sanitario. Si tiene dudas, consulte con su farmacéutico/a o su médico/a.</p>
      <p>Hoja generada el ${e(formatDate(date))} con neumoCMO · Biblioteca Respiratoria CMO.</p>
    </footer>`;
}
