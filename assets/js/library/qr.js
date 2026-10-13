/**
 * Envoltorio del generador de QR local (assets/vendor/qrcode-generator).
 * Se carga como script clásico y expone `qrcode` en el ámbito global.
 */
export function qrSvg(text, { qrcode = globalThis.qrcode } = {}) {
  if (typeof qrcode !== 'function') throw new Error('Generador de QR no disponible');
  qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
  const qr = qrcode(0, 'M'); // versión automática, corrección de errores media
  qr.addData(text, 'Byte');
  qr.make();
  return qr.createSvgTag({ cellSize: 4, margin: 16, scalable: true, alt: `Código QR de ${text}` });
}
