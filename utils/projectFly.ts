/**
 * Page projet : flèches ← →. Au survol, l'image du projet voisin apparaît sous
 * les flèches (aperçu) ; au clic, elle vole jusqu'au plein écran.
 */

export const PROJECT_FLY = {
  /** Sortie du contenu de la page (s) */
  textsOut: 0.25,
  /** L'image démarre quand le contenu est presque parti (s) */
  handoff: 0.25,
  /** Vol jusqu'au plein écran (s) */
  duration: 1,
  ease: 'power3.out',
  /** Apparition / disparition de l'aperçu (s) */
  peekIn: 0.45,
  peekOut: 0.25,
  /** L'aperçu grandit depuis cette échelle en apparaissant */
  peekFrom: 0.9,
  /** Taille de l'image : largeur plafonnée, hauteur = largeur × ratio */
  startWidth: 200,
  startWidthRatio: 0.4,
  ratio: 0.66,
  /** Sous les flèches : écart (px) */
  gap: 18,
  /** Marge minimale avec le bord de l'écran, départ du clavier (px) */
  edge: 24,
} as const;

export type FlyRect = { x: number; y: number; w: number; h: number };

/**
 * Partagé entre la barre (DOM, tweens GSAP) et le Scene (WebGL), lu à chaque
 * image : les tweens modifient ces valeurs, le Scene y pose l'image.
 * - index : projet affiché, -1 = aucune image (ni aperçu ni vol)
 * - rect : aperçu, ou départ du vol (px écran)
 * - full : vol, 0 = sur rect, 1 = plein écran. Le Scene calcule le plein écran
 *   avec la taille du canvas : sur iOS, il fait 100vh, plus haut que
 *   window.innerHeight quand la barre d'adresse est affichée.
 */
export const projectFly: {
  index: number;
  rect: FlyRect;
  opacity: number;
  full: number;
} = {
  index: -1,
  rect: { x: 0, y: 0, w: 0, h: 0 },
  opacity: 1,
  full: 0,
};

const imageSize = (width: number) => {
  const w = Math.min(
    PROJECT_FLY.startWidth,
    width * PROJECT_FLY.startWidthRatio,
  );
  return { w, h: w * PROJECT_FLY.ratio };
};

/** Hauteur de l'aperçu sur un écran de cette largeur (pour placer sa légende) */
export const peekHeight = (width: number) => imageSize(width).h;

/** Aperçu des flèches : sous la barre, aligné sur son bord droit (celui des flèches) */
export function getPeekRect(bar: DOMRect, width: number): FlyRect {
  const { w, h } = imageSize(width);
  return { x: bar.right - w, y: bar.bottom + PROJECT_FLY.gap, w, h };
}

/** Aperçu d'un numéro : centré sous lui, sans sortir de l'écran */
export function getPeekRectBelow(anchor: DOMRect, width: number): FlyRect {
  const { w, h } = imageSize(width);
  const { edge, gap } = PROJECT_FLY;
  const x = Math.min(
    Math.max(anchor.left + anchor.width / 2 - w / 2, edge),
    width - w - edge,
  );
  return { x, y: anchor.bottom + gap, w, h };
}

/** Même rectangle, réduit autour de son centre (apparition, disparition) */
export function scaleRect(rect: FlyRect, scale: number): FlyRect {
  const w = rect.w * scale;
  const h = rect.h * scale;
  return { x: rect.x + (rect.w - w) / 2, y: rect.y + (rect.h - h) / 2, w, h };
}

/**
 * Départ du vol sans aperçu : là où l'aperçu se serait affiché (from : sous les
 * flèches ou sous le numéro touché, en mobile) s'il est à l'écran, sinon au bord
 * de l'écran du côté de la direction (clavier, barre partie avec le scroll).
 */
export function getFlyStart(
  dir: 'prev' | 'next',
  from: FlyRect | null,
  width: number,
  height: number,
): FlyRect {
  if (from && from.y + from.h > 0 && from.y < height) return from;
  const { w, h } = imageSize(width);
  const x = dir === 'next' ? width - w - PROJECT_FLY.edge : PROJECT_FLY.edge;
  return { x, y: height / 2 - h / 2, w, h };
}
