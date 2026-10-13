/**
 * Menú de navegación móvil compartido por todas las páginas.
 * Requiere .nav-toggle (con .visually-hidden y <use>) y #site-nav.
 */
import { ICON_SPRITE } from './templates.js';

export function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;
  const label = toggle.querySelector('.visually-hidden');
  const use = toggle.querySelector('use');
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    label.textContent = open ? 'Cerrar menú' : 'Abrir menú';
    use.setAttribute('href', `${ICON_SPRITE}#i-${open ? 'close' : 'menu'}`);
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });
}
