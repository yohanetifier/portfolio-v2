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
  /** Les cartes du bord descendent un peu : arc de cercle (px) */
  arc: 2,
} as const;

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
) {
  // k : de -(n-1)/2 (1re carte) à +(n-1)/2 (dernière), 0 au milieu
  const k = i - (n - 1) / 2;
  const step = n > 1 ? 1 / (n - 1) : 0;
  const w = width * MENU_FAN.cardWidth;
  return {
    cx: width / 2 + k * step * width * MENU_FAN.spread,
    cy: centerY + k * k * MENU_FAN.arc,
    w,
    h: w * MENU_FAN.ratio,
    rotation: k * step * MENU_FAN.angle,
  };
}
