import gsap from 'gsap';

/** Page projet : section « projet suivant » (l'image du suivant grandit avec le scroll) */

export const NEXT_PROJECT = {
  /** Hauteur de la piste de scroll (vh) — plus haute = croissance plus lente */
  trackVh: 240,
  /** Largeur de départ de l'image : part de l'écran, plafonnée (desktop) */
  startWidthRatio: 0.36,
  startMaxWidth: 560,
  /** Largeur de départ sur mobile (< 768 px) */
  startWidthRatioMobile: 0.64,
  /** hauteur = largeur × ratio */
  ratio: 0.64,
  /** Centre vertical de départ, en part de l'écran */
  startCenterY: 0.6,
  /** Courbe de croissance de l'image */
  growEase: 'power2.inOut',
  /** Les textes sont partis à ce stade de la progression */
  textsOutAt: 0.33,
  /** Montée du titre sur toute la piste (px) */
  titleRise: 90,
  /** Le compteur apparaît quand la section a parcouru ce stade de son entrée */
  counterInAt: 0.5,
  /** Le compteur disparaît juste avant le plein écran */
  counterOutAt: 0.96,
  /** Changement de projet : l'image est plein écran */
  swapAt: 0.995,
} as const;

/**
 * Partagé entre la section (DOM, ScrollTrigger) et le Scene (WebGL), lu à chaque
 * image : un objet mutable plutôt qu'un état React, pour ne pas re-rendre 60 fois/s.
 */
export const nextProjectStore: {
  /** Piste inscrite (sert à vérifier « c'est encore moi ? »), null hors page projet */
  el: HTMLElement | null;
  /** Index du projet suivant, -1 = pas de suivant à afficher */
  index: number;
  /** Entrée de la section dans l'écran : 0 = sous l'écran, 1 = en haut */
  enter: number;
  /** Section épinglée : 0 = image petite, 1 = plein écran */
  progress: number;
  /** Arrivée par le scroll : la nouvelle page fait entrer son titre */
  justSwapped: boolean;
} = { el: null, index: -1, enter: 0, progress: 0, justSwapped: false };

const grow = gsap.parseEase(NEXT_PROJECT.growEase);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Rectangle écran de l'image du suivant, à partir des deux progressions :
 * - enter : elle monte avec la section (le haut de la section est à (1 - enter) × hauteur)
 * - progress : section épinglée, elle grandit jusqu'au plein écran
 */
export function getNextRect(
  enter: number,
  progress: number,
  width: number,
  height: number,
) {
  const w0 =
    width < 768
      ? width * NEXT_PROJECT.startWidthRatioMobile
      : Math.min(width * NEXT_PROJECT.startWidthRatio, NEXT_PROJECT.startMaxWidth);
  const h0 = w0 * NEXT_PROJECT.ratio;
  const cy0 = (1 - enter) * height + height * NEXT_PROJECT.startCenterY;

  const e = grow(progress);
  const w = lerp(w0, width, e);
  const h = lerp(h0, height, e);
  const cy = lerp(cy0, height / 2, e);

  return new DOMRect(width / 2 - w / 2, cy - h / 2, w, h);
}

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

/**
 * Progressions mesurées sur la piste elle-même (mêmes bornes que les ScrollTrigger).
 * Lu à chaque image par le Scene : jamais périmé, même si iOS ramène la page en
 * haut sans envoyer d'événement scroll (les ScrollTrigger gardent alors l'ancienne valeur).
 */
export function measureTrack(el: HTMLElement, viewportHeight: number) {
  const { top, height } = el.getBoundingClientRect();
  return {
    // 'top bottom' → 'top top' : le haut de la piste monte du bas au haut de l'écran
    enter: clamp01(1 - top / viewportHeight),
    // 'top top' → 'bottom bottom' : la piste défile sous l'écran
    progress: clamp01(-top / Math.max(height - viewportHeight, 1)),
  };
}

/** Rectangle tel qu'il est enregistré dans le localStorage (DOMRect sérialisé) */
type SavedRect = {
  x: number;
  y: number;
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
};
type SavedItem = { rects: SavedRect; imageUrl: string };

/**
 * Retour vers Works après un ou plusieurs « projet suivant » : la disposition
 * enregistrée correspond au scroll du départ. Si la case du projet affiché n'est
 * pas visible à ce scroll, on décale le scroll (et toutes les cases) pour la centrer.
 */
export function focusWorksLayout(
  items: SavedItem[],
  index: number,
  scroll: number,
  viewportHeight: number,
) {
  const r = items[index]?.rects;
  if (!r) return null;

  const visible = r.top >= 0 && r.top + r.height <= viewportHeight;
  let delta = visible ? 0 : r.top + r.height / 2 - viewportHeight / 2;

  // Bornes : pas au-dessus du haut de la page…
  delta = Math.max(delta, -scroll);
  // … ni plus bas que la dernière case (la page descend au moins jusque-là)
  if (delta > 0) {
    const lastBottom = Math.max(...items.map((it) => it.rects.top + it.rects.height));
    delta = Math.min(delta, Math.max(lastBottom - viewportHeight, 0));
  }

  const shifted = items.map((it) => ({
    ...it,
    rects: {
      ...it.rects,
      y: it.rects.y - delta,
      top: it.rects.top - delta,
      bottom: it.rects.bottom - delta,
    },
  }));
  return { items: shifted, scroll: scroll + delta };
}
