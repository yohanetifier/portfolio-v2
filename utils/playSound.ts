/** Joue un SFX (déclencher dans un geste user — clic / tap). */
export function playSound(
  src: string,
  volume = 0.08,
): void {
  const audio = new Audio(src);
  audio.volume = volume;
  void audio.play().catch(() => {});
}

export const OPEN_WHOOSH = '/sounds/open-whoosh.wav';
