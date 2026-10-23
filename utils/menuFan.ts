/** Menu mobile : les images du site se rangent en éventail en bas du menu */

export const MENU_FAN = {
  /** Centre vertical de l'éventail, en part de la hauteur de l'écran (si on n'a
   *  pas pu mesurer l'espace libre du menu) */
  centerY: 0.68,
  /** Largeur d'une carte, en part de la largeur de l'écran ; hauteur = largeur × ratio */
  cardWidth: 0.32,
  ratio: 1.34,
  /** Écart entre la 1re et la dernière carte, en part de la largeur de l'écran */
  spread: 0.4,
  /** Angle entre la 1re et la dernière carte (degrés) */
  angle: 52,
  /** Les cartes du bord descendent un peu : arc de cercle. Descente des cartes
   *  du bord = arc × 0,25 (px), quel que soit le nombre de cartes */
  arc: 128,
  /** Marge minimale avec les liens et le trait du pied de page (px) */
  margin: 16,
} as const;

/**
 * Plus grande largeur de carte pour que l'éventail tienne dans space (px de haut),
 * centré dessus. Le point le plus bas est le coin d'une carte du bord (t = ±0,5) :
 * centre de l'éventail + arc × 0,25 + demi-carte penchée. Une carte de largeur w
 * penchée de a descend de w/2 × sin(a) + h/2 × cos(a) sous son centre.
 */
function fitCardWidth(space: number) {
  const a = ((MENU_FAN.angle / 2) * Math.PI) / 180;
  // Descente du coin, par pixel de largeur de carte
  const perWidth = Math.sin(a) / 2 + (MENU_FAN.ratio * Math.cos(a)) / 2;
  const room = space / 2 - MENU_FAN.margin - MENU_FAN.arc * 0.25;
  return room / perWidth;
}

/**
 * Place de la carte i sur n : centre et taille (px écran), rotation (degrés,
 * sens des aiguilles d'une montre : les cartes de droite penchent à droite)
 */
export function getFanCard(
  i: number,
  n: number,
  width: number,
  height: number,
  /** Centre vertical voulu (px), sinon MENU_FAN.centerY */
  centerY = height * MENU_FAN.centerY,
  /** Hauteur de l'espace libre (px) : les cartes rapetissent s'il est trop petit */
  space?: number,
) {
  // k : de -(n-1)/2 (1re carte) à +(n-1)/2 (dernière), 0 au milieu
  const k = i - (n - 1) / 2;
  const step = n > 1 ? 1 / (n - 1) : 0;
  // t : de -0,5 à +0,5 quel que soit n → même éventail pour 9, 12 ou 20 cartes
  const t = k * step;
  const maxWidth = width * MENU_FAN.cardWidth;
  const w = space ? Math.min(maxWidth, fitCardWidth(space)) : maxWidth;
  return {
    cx: width / 2 + t * width * MENU_FAN.spread,
    cy: centerY + t * t * MENU_FAN.arc,
    w,
    h: w * MENU_FAN.ratio,
    rotation: t * MENU_FAN.angle,
  };
}
