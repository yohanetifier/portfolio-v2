/** Réglages de la page Works : bascule grille ↔ liste et aperçu de la liste */

/** Glissement des planes d'une vue à l'autre */
export const VIEW_SWITCH = {
  duration: 1,
  /** Décalage entre deux planes (s) */
  stagger: 0.04,
  /**
   * « out » : les images partent dès le relais avec le texte, sans temps mort
   * (un « inOut » démarre trop lentement juste après la sortie des titres)
   */
  ease: 'power3.out',
  /**
   * Grille → liste : moment où le texte commence à entrer (s, depuis le début du
   * glissement). Avec un « out », les images sont visuellement posées bien avant la
   * fin technique du tween — attendre la fin laisserait une page vide.
   */
  revealAt: 0.75,
} as const;

/** Aperçu qui suit la souris au survol d'une ligne (desktop) */
export const LIST_PREVIEW = {
  /** Largeur max (px) */
  maxWidth: 320,
  /** Largeur en part de l'écran, plafonnée par maxWidth */
  widthRatio: 0.22,
  /** hauteur = largeur × ratio */
  ratio: 1.2,
  /** Écart à droite du curseur (px) */
  offsetX: 40,
  /** Marge minimale aux bords de l'écran (px) */
  margin: 16,
  /** Lissage par image à 60 Hz (converti en temps réel, cf. dt du loader) */
  smoothing: 0.14,
} as const;

/** Apparition du texte de la liste, une fois les miniatures en place */
export const LIST_REVEAL = {
  /** Filets entre les lignes, tracés de gauche à droite */
  lineDuration: 0.8,
  /** Montée des titres derrière leur masque */
  titleDuration: 0.9,
  /** Décalage entre deux lignes (s) */
  stagger: 0.06,
  /** Les titres démarrent ce temps après les filets (s) */
  titlesDelay: 0.15,
} as const;

/** Sortie du texte de la liste (vers la grille) — plus courte que l'entrée */
export const LIST_EXIT = {
  /** Numéros et flèches */
  metaDuration: 0.3,
  /** Descente des titres sous leur masque */
  titleDuration: 0.5,
  /** Rétraction des filets vers la droite */
  lineDuration: 0.5,
  /** Décalage entre deux lignes (s) */
  stagger: 0.03,
  /** Les filets démarrent ce temps après les titres (s) */
  linesDelay: 0.15,
  /**
   * Relais (s) : moment de la sortie où les images prennent la suite — plein écran
   * vers un projet, glissement vers la grille. Les titres sont alors visuellement
   * sortis ; les filets finissent pendant le mouvement des images.
   */
  handoffAt: 0.3,
} as const;
