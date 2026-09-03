export const lockScroll = () => {
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
};

export const unlockScroll = () => {
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
};
