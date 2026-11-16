/**
 * Page About : les images des projets changent de disposition à chaque section
 * (nuage, portrait, dispersion, colonnes, paquet, grille, anneau). Formes
 * géométriques → calculées, pour n images (9 ici, 12 chez le DA).
 */

export const ABOUT = {
  /** Hauteur d'une carte = largeur × ratio */
  ratio: 1.22,
  /** Le portrait : largeur = hauteur × portraitRatio */
  portraitRatio: 0.8,
  /** Écart entre les cartes des grilles (px) */
  gap: 14,
} as const;

/** Ce que le Scene applique à une image : centre et taille (px écran),
 *  rotation (radians), opacité, ondulation, et part du portrait (0 = image du
 *  projet, 1 = sa tuile du portrait) */
export type AboutCard = {
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  opacity: number;
  amp: number;
  mix: number;
};

export type AboutLayoutName =
  | 'hero'
  | 'portrait'
  | 'scatter'
  | 'columns'
  | 'deck'
  | 'grid'
  | 'ring';

const isMobile = (W: number) => W < 768;

/** Largeur de référence d'une carte */
const base = (W: number) =>
  isMobile(W) ? W * 0.26 : Math.min(Math.max(W * 0.115, 120), 190);

/** Nombre « au hasard » mais toujours le même pour une carte : -1 à 1 */
const noise = (i: number, seed: number) => {
  const s = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return (s - Math.floor(s)) * 2 - 1;
};

/** Angle d'or : chaque carte tourne de 137,5° par rapport à la précédente. Les
 *  cartes se répartissent régulièrement dans un disque, sans se superposer en
 *  ligne, quel que soit n (comme les graines d'un tournesol). */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

const card = (
  x: number,
  y: number,
  w: number,
  rest: Partial<AboutCard> = {},
): AboutCard => ({
  x,
  y,
  w,
  h: w * ABOUT.ratio,
  rotation: 0,
  opacity: 1,
  amp: 0,
  mix: 0,
  ...rest,
});

/** Grille de cols colonnes centrée sur (cx, cy), cartes de largeur s */
const gridCell = (
  i: number,
  n: number,
  cols: number,
  cx: number,
  cy: number,
  s: number,
) => {
  const rows = Math.ceil(n / cols);
  const col = i % cols;
  const row = Math.floor(i / cols);
  const h = s * ABOUT.ratio;
  return {
    x: cx + (col - (cols - 1) / 2) * (s + ABOUT.gap),
    y: cy + (row - (rows - 1) / 2) * (h + ABOUT.gap),
  };
};

/** Largeur de carte pour que rows rangées tiennent dans maxH */
const fitRows = (rows: number, maxH: number, s: number) =>
  Math.min(s, (maxH - (rows - 1) * ABOUT.gap) / rows / ABOUT.ratio);

/**
 * Place de la carte i sur n dans une disposition. t : temps (s), pour la
 * légère dérive du nuage et la rotation de l'anneau.
 */
export function getAboutCard(
  layout: AboutLayoutName,
  i: number,
  n: number,
  W: number,
  H: number,
  t = 0,
): AboutCard {
  const mobile = isMobile(W);
  const b = base(W);

  switch (layout) {
    // Nuage autour de la moitié droite, qui dérive doucement
    case 'hero': {
      const r = Math.sqrt((i + 0.5) / n);
      const a = i * GOLDEN_ANGLE;
      const cx = mobile ? W * 0.5 : W * 0.7;
      const cy = mobile ? H * 0.69 : H * 0.52;
      const rx = mobile ? W * 0.34 : W * 0.24;
      const ry = mobile ? H * 0.22 : H * 0.36;
      return card(
        cx + Math.cos(a) * r * rx + Math.sin(t * 0.35 + i * 1.7) * 14,
        cy + Math.sin(a) * r * ry + Math.cos(t * 0.3 + i * 2.3) * 12,
        b * (0.9 + noise(i, 1) * 0.15),
        { rotation: noise(i, 2) * 0.06, amp: 1 },
      );
    }

    // Les cartes deviennent les tuiles d'un portrait (cols × rows)
    case 'portrait': {
      const Ph = mobile
        ? Math.min(H * 0.56, W * 0.84 * 1.25)
        : Math.min(H * 0.72, W * 0.36 * 1.25);
      const Pw = Ph * ABOUT.portraitRatio;
      const cx = mobile ? W * 0.5 : W * 0.68;
      const cy = mobile ? H * 0.64 : H * 0.53;
      const cols = Math.ceil(Math.sqrt(n * ABOUT.portraitRatio));
      const rows = Math.ceil(n / cols);
      const tw = Pw / cols;
      const th = Ph / rows;
      // + 0,5 px : pas de fine ligne entre deux tuiles
      return {
        x: cx - Pw / 2 + ((i % cols) + 0.5) * tw,
        y: cy - Ph / 2 + (Math.floor(i / cols) + 0.5) * th,
        w: tw + 0.5,
        h: th + 0.5,
        rotation: 0,
        opacity: 1,
        amp: 0,
        mix: 1,
      };
    }

    // Manifeste : éparpillées en deux colonnes lâches, à droite
    case 'scatter': {
      const x = mobile
        ? W * (i % 2 ? 0.78 : 0.22)
        : W * (i % 2 ? 0.86 : 0.67);
      const y = H * (0.15 + (0.7 * (i + 0.5)) / n);
      return card(
        x + noise(i, 3) * W * 0.04,
        y,
        b * (0.85 + noise(i, 4) * 0.15) * (mobile ? 1.2 : 1),
        { rotation: noise(i, 5) * 0.08, amp: 1, opacity: mobile ? 0.2 : 1 },
      );
    }

    // En bref : deux colonnes bien rangées
    case 'columns': {
      const s = fitRows(Math.ceil(n / 2), H * 0.8, b * 0.8);
      const { x, y } = gridCell(i, n, 2, mobile ? W * 0.5 : W * 0.78, H * 0.5, s);
      return card(x, y, s, { amp: 0.5, opacity: mobile ? 0.18 : 1 });
    }

    // Méthode : un paquet de cartes légèrement décalées
    case 'deck': {
      const k = i - (n - 1) / 2;
      // Même étalement total quel que soit n
      const step = n > 1 ? 50 / (n - 1) : 0;
      return card(
        (mobile ? W * 0.55 : W * 0.77) + k * step,
        (mobile ? H * 0.8 : H * 0.5) - k * step * 0.8,
        b * 1.15,
        { rotation: (k / Math.max(n - 1, 1)) * 0.25, amp: 0.4, opacity: mobile ? 0.3 : 1 },
      );
    }

    // Chiffres : grille presque carrée, comme la grille de Contact
    case 'grid': {
      const cols = Math.max(3, Math.ceil(Math.sqrt(n)));
      const s = fitRows(Math.ceil(n / cols), H * 0.7, b * 0.72);
      const { x, y } = gridCell(i, n, cols, mobile ? W * 0.5 : W * 0.76, mobile ? H * 0.8 : H * 0.5, s);
      return card(x, y, s, { amp: 0.3, opacity: mobile ? 0.25 : 1 });
    }

    // Contact : un anneau autour du mail, qui tourne lentement
    case 'ring': {
      const a = (i / n) * Math.PI * 2 + t * 0.12 - Math.PI / 2;
      return card(
        W / 2 + Math.cos(a) * W * 0.36,
        H / 2 + Math.sin(a) * H * (mobile ? 0.38 : 0.36),
        b * (mobile ? 0.8 : 0.7),
        { rotation: Math.cos(a) * 0.08, amp: 0.8, opacity: mobile ? 0.45 : 1 },
      );
    }
  }
}
