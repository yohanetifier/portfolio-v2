/**
 * Chorégraphie intro (loader wipe → wrecks → titres).
 * Une seule scène : t=0 = début du wipe.
 */
export const INTRO = {
  /** Durée du clip-path wipe */
  wipeDuration: 1.15,
  /** CSS ease du wipe — proche power2.inOut / expo */
  wipeEase: 'cubic-bezier(0.76, 0, 0.24, 1)',

  /** Wrecks : entrent tôt pendant le wipe (ancrage visuel) */
  wrecksDelay: 0.2,
  wrecksDuration: 1.2,
  wrecksStagger: 0.12,
  wrecksEase: 'power3.out',

  /** Titres : nettement après les wrecks, fin de wipe / post-wipe */
  titlesDelay: 1,
  titlesDuration: 1.05,
  titlesEase: 'power3.out',
  titlesY: 22,
} as const;
