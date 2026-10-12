/**
 * Paquet de cartes de l'intro (Home) : toutes les images empilées au centre.
 * La dernière carte (index le plus grand) est au-dessus — ordre de dessin Three.js.
 */

/** Inclinaison de chaque carte, en degrés (léger désordre du paquet) */
const DECK_TILT_DEG = [-3, 2.4, -1.2, 3.4, -2.6, 1.4, -3.6, 2.8, -0.8];

/** Décalage vertical entre deux cartes (px) : le bord des cartes du dessous dépasse */
export const DECK_STEP_PX = 2.5;

/** Rotation de la carte dans le paquet, en radians (rotation.z Three.js) */
export function getDeckRotation(index: number): number {
  return (DECK_TILT_DEG[index % DECK_TILT_DEG.length] * Math.PI) / 180;
}

/** Mélange : la carte du dessus glisse sur le côté puis repasse sous le paquet */
export const DECK_SHUFFLE = {
  intervalMs: 1500,
  /** Sortie : décalage à droite (× largeur de carte), montée (px), rotation (rad) */
  outX: 0.85,
  liftPx: 40,
  outRotation: 0.12,
  outDuration: 0.45,
  backDuration: 0.5,
  ease: 'power3.out',
} as const;

/** Éventail : au survol, les cartes s'ouvrent autour d'un pivot situé sous le paquet */
export const DECK_FAN = {
  /** Zone de survol autour du paquet (× largeur / × hauteur de carte) */
  hoverX: 1.2,
  hoverY: 0.9,
  /** Écart entre deux cartes (°) et inclinaison qui suit la souris (°) */
  spreadDeg: 5,
  followDeg: 6,
  /** Rayon du pivot (× hauteur de carte) */
  radius: 1.9,
  /** Lissage par frame à 60 fps : ouverture / suivi souris, et poses des cartes */
  openSmoothing: 0.08,
  poseSmoothing: 0.16,
} as const;
