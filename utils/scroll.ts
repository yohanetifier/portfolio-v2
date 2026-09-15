import type Lenis from 'lenis';

let lenisInstance: Lenis | null = null;

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
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
  lenisInstance?.start();
};
