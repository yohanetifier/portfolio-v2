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

export const holdScroll = () => {
  held = true;
  lockScroll();
};

export const releaseScroll = () => {
  held = false;
  unlockScroll();
};
