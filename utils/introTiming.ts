/**
 * Chorégraphie intro (loader wipe → paquet de cartes → boutons).
 * Une seule scène : t=0 = début du wipe.
 */
export const INTRO = {
  /** Durée du clip-path wipe */
  wipeDuration: 1.15,
  /** CSS ease du wipe — proche power2.inOut / expo */
  wipeEase: 'cubic-bezier(0.76, 0, 0.24, 1)',

  /** Paquet : les cartes tombent une par une sur le paquet, au centre */
  deckDelay: 0.2,
  deckStagger: 0.09,
  deckDuration: 0.9,
  deckFadeDuration: 0.4,
  deckEase: 'power3.out',
  /** Hauteur de chute (fraction de la hauteur d'écran) et écart horizontal max (px) */
  deckDropHeight: 0.25,
  deckDropSpreadPx: 60,
  /** Rotation aléatoire de départ (± radians) */
  deckDropTilt: 0.25,

  /** Titres : nettement après les wrecks, fin de wipe / post-wipe */
  titlesDelay: 1,
  titlesDuration: 1.05,
  titlesEase: 'power3.out',
  titlesY: 22,
} as const;
