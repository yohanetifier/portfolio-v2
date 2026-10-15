import type Lenis from 'lenis';

let lenisInstance: Lenis | null = null;
/**
 * Blocage prioritaire (arrivée par le « projet suivant ») : les unlockScroll()
 * lancés à la fin d'autres animations (ex. l'amplitude du Plane) ne le lèvent pas.
 */
let held = false;

export const setLenisInstance = (instance: Lenis | null) => {
  lenisInstance = instance;
};

export const getLenis = () => lenisInstance;

export const lockScroll = () => {
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  lenisInstance?.stop();
};

export const unlockScroll = () => {
  if (held) return;
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
  lenisInstance?.start();
};

/**
 * iOS : l'élan d'un swipe continue malgré overflow hidden et écrase scrollTo().
 * Body fixé en haut = plus rien à faire défiler → l'élan s'arrête net.
 * (Seulement page en haut : on ne restaure pas de position de scroll.)
 */
const PIN_BODY = { position: 'fixed', top: '0', left: '0', right: '0' };
const UNPIN_BODY = { position: '', top: '', left: '', right: '' };

export const holdScroll = () => {
  held = true;
  lockScroll();
  Object.assign(document.body.style, PIN_BODY);
};

export const releaseScroll = () => {
  held = false;
  Object.assign(document.body.style, UNPIN_BODY);
  unlockScroll();
};
