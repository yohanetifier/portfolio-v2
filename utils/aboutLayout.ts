import { getNotFoundProjectLayout } from '@/components/NotFound/notFoundLayout';

/**
 * Page About : les images des projets changent de disposition à chaque section
 * (places de la 404, portrait, lettres C, S et R, anneau). Formes géométriques
 * → calculées, pour n images (9 ici, 12 chez le DA).
 */

export const ABOUT = {
  /** Hauteur d'une carte = largeur × ratio */
  ratio: 1.22,
  /** Le portrait : largeur = hauteur × portraitRatio */
  portraitRatio: 0.8,
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
  | 'letterC'
  | 'letterS'
  | 'letterR'
  | 'ring';

const isMobile = (W: number) => W < 768;

/** Ordinateur : la place libre à droite du texte (colonne de texte jusqu'à
 *  56 % de la largeur) — sa largeur et son centre, en part de l'écran */
const FREE_W = 0.38;
const FREE_CX = 0.78;

/** Largeur de référence d'une carte */
const base = (W: number) =>
  isMobile(W) ? W * 0.26 : Math.min(Math.max(W * 0.115, 120), 190);

/** Nombre « au hasard » mais toujours le même pour une carte : -1 à 1 */
const noise = (i: number, seed: number) => {
  const s = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return (s - Math.floor(s)) * 2 - 1;
};

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

/** Le portrait découpé en cols × rows tuiles (9 images → 3 × 3) */
const portraitGrid = (n: number) => {
  const cols = Math.ceil(Math.sqrt(n * ABOUT.portraitRatio));
  return { cols, rows: Math.ceil(n / cols) };
};

/**
 * Le morceau du portrait que montre la carte i : sa place dans la photo
 * entière (0 → 1, y vers le haut comme les uv du shader) et sa taille.
 */
export function getPortraitTile(i: number, n: number) {
  const { cols, rows } = portraitGrid(n);
  const col = i % cols;
  const row = Math.floor(i / cols);
  return {
    x: col / cols,
    // La rangée 0 est en haut de l'écran, donc en haut de la photo (y = 1)
    y: 1 - (row + 1) / rows,
    w: 1 / cols,
    h: 1 / rows,
  };
}

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
    // Les mêmes places que la page 404 : réparties sur tout l'écran, qui
    // dérivent doucement
    case 'hero': {
      const { x, y, w, h } = getNotFoundProjectLayout(i, W, H, n);
      return {
        // Le calcul de la 404 part du centre de l'écran, y vers le haut
        x: W / 2 + x + Math.sin(t * 0.35 + i * 1.7) * 14,
        y: H / 2 - y + Math.cos(t * 0.3 + i * 2.3) * 12,
        w,
        h,
        rotation: noise(i, 2) * 0.06,
        opacity: 1,
        amp: 1,
        mix: 0,
      };
    }

    // Les cartes deviennent les tuiles d'un portrait (cols × rows)
    case 'portrait': {
      const Ph = mobile
        ? Math.min(H * 0.56, W * 0.84 * 1.25)
        : Math.min(H * 0.72, W * 0.36 * 1.25);
      const Pw = Ph * ABOUT.portraitRatio;
      const cx = mobile ? W * 0.5 : W * 0.68;
      const cy = mobile ? H * 0.64 : H * 0.53;
      const { cols, rows } = portraitGrid(n);
      const tw = Pw / cols;
      const th = Ph / rows;
      // + 0,5 px : pas de fine ligne entre deux tuiles
      return {
        x: cx - Pw / 2 + ((i % cols) + 0.5) * tw,
        y: cy - Ph / 2 + (Math.floor(i / cols) + 0.5) * th,
        w: tw + 0.5,
        h: th + 0.5,
        rotation: 0,
        // Mobile : le portrait passe derrière le texte (plus long que la
        // largeur ne permet d'éviter), en transparence comme les autres sections
        opacity: mobile ? 0.25 : 1,
        amp: 0,
        mix: 1,
      };
    }

    // Ma philosophie : les cartes dessinent un grand C, l'initiale de
    // « Comprendre » et de « Construire ». Elles suivent un arc de cercle
    // ouvert à droite, chacune penchée le long de la courbe.
    case 'letterC': {
      const cx = mobile ? W * 0.5 : FREE_CX * W;
      const cy = mobile ? H * 0.62 : H * 0.52;
      const R = mobile
        ? Math.min(W * 0.32, H * 0.24)
        : Math.min(FREE_W * W * 0.4, H * 0.32);
      // Ouverture de 100° à droite : de -50° (en haut à droite) à +50° (en bas
      // à droite) en passant par le haut, la gauche et le bas (y vers le bas)
      const OPEN = (50 * Math.PI) / 180;
      const sweep = Math.PI * 2 - OPEN * 2;
      const a = -OPEN - (n > 1 ? (i / (n - 1)) * sweep : 0);
      // Cartes jointives le long de l'arc (un léger chevauchement)
      const s = Math.min((R * sweep) / n * 1.1, b * 1.3);
      // Penchée le long de la courbe, jamais la tête en bas
      let rotation = a + Math.PI / 2;
      rotation = Math.atan(Math.tan(rotation));
      return {
        x: cx + Math.cos(a) * R,
        y: cy + Math.sin(a) * R,
        w: s,
        h: s * 0.75,
        rotation,
        opacity: mobile ? 0.25 : 1,
        amp: 0.3,
        mix: 0,
      };
    }

    // Mes expertises (« Des idées aux solutions ») : les cartes dessinent un
    // S, l'initiale de « Solutions ». Deux arcs de cercle de rayon r posés l'un
    // sur l'autre : celui du haut tourne vers la gauche, celui du bas vers la
    // droite ; ils se rejoignent au centre.
    case 'letterS': {
      const cx = mobile ? W * 0.5 : FREE_CX * W;
      const cy = mobile ? H * 0.6 : H * 0.5;
      // Hauteur du S : 4 rayons + une carte
      const r = mobile
        ? Math.min(W * 0.22, H * 0.13)
        : Math.min(FREE_W * W * 0.3, (H * 0.8) / 4.6);
      const ARC = (240 * Math.PI) / 180;
      const START = (30 * Math.PI) / 180;
      // u : distance parcourue sur le S (angle), de 0 à 2 arcs
      const u = n > 1 ? (i / (n - 1)) * ARC * 2 : 0;
      let x: number;
      let y: number;
      let a: number;
      if (u <= ARC) {
        // Arc du haut : de -30° (en haut à droite) par le haut et la gauche,
        // jusqu'au centre du S (y vers le bas : -90° = en haut)
        a = -START - u;
        x = cx + Math.cos(a) * r;
        y = cy - r + Math.sin(a) * r;
      } else {
        // Arc du bas : du centre du S par la droite et le bas, jusqu'en bas à
        // gauche
        a = -Math.PI / 2 + (u - ARC);
        x = cx + Math.cos(a) * r;
        y = cy + r + Math.sin(a) * r;
      }
      // Cartes jointives le long du S (un léger chevauchement)
      const s = Math.min(((r * ARC * 2) / n) * 1.1, b * 1.3);
      return {
        x,
        y,
        w: s,
        h: s * 0.75,
        // Penchée le long de la courbe, jamais la tête en bas
        rotation: Math.atan(Math.tan(a + Math.PI / 2)),
        opacity: mobile ? 0.18 : 1,
        amp: 0.5,
        mix: 0,
      };
    }

    // Ma méthode (« De votre besoin à sa réalisation ») : les cartes
    // dessinent un R, l'initiale de « Réalisation ». Un seul trait continu : la
    // barre verticale (de bas en haut), le haut de la boucle, la boucle (un
    // demi-cercle de rayon r), puis la jambe en diagonale jusqu'en bas à droite.
    case 'letterR': {
      const cx = mobile ? W * 0.5 : FREE_CX * W;
      const cy = mobile ? H * 0.6 : H * 0.5;
      // Hauteur du R : 4 r (+ une carte) ; largeur : 1,6 r
      const r = mobile
        ? Math.min(W * 0.2, H * 0.13)
        : Math.min(FREE_W * W * 0.4, (H * 0.8) / 4.6);
      const left = cx - 0.8 * r;
      const top = cy - 2 * r;
      const bar = 0.6 * r;
      // Les 4 morceaux du trait et leur longueur
      const leg = Math.hypot(r, 2 * r);
      const parts = [4 * r, bar, Math.PI * r, leg];
      const total = parts.reduce((sum, length) => sum + length, 0);
      // d : distance parcourue sur le trait jusqu'à la carte i
      let d = n > 1 ? (i / (n - 1)) * total : 0;
      let x: number;
      let y: number;
      let a: number; // direction du trait à cet endroit (radians, y vers le bas)
      if (d <= parts[0]) {
        // Barre verticale, de bas en haut
        x = left;
        y = top + 4 * r - d;
        a = -Math.PI / 2;
      } else if ((d -= parts[0]) <= parts[1]) {
        // Haut de la boucle, vers la droite
        x = left + d;
        y = top;
        a = 0;
      } else if ((d -= parts[1]) <= parts[2]) {
        // Boucle : demi-cercle par la droite, du haut jusqu'au milieu du R
        const angle = -Math.PI / 2 + d / r;
        x = left + bar + Math.cos(angle) * r;
        y = top + r + Math.sin(angle) * r;
        a = angle + Math.PI / 2;
      } else {
        // Jambe : du milieu du R jusqu'en bas à droite
        const t = Math.min((d - parts[2]) / leg, 1);
        x = left + bar + t * r;
        y = top + 2 * r + t * 2 * r;
        a = Math.atan2(2 * r, r);
      }
      // Cartes jointives le long du trait (un léger chevauchement)
      const s = Math.min((total / n) * 1.1, b * 1.3);
      return {
        x,
        y,
        w: s,
        h: s * 0.75,
        // Penchée dans le sens du trait, jamais la tête en bas
        rotation: Math.atan(Math.tan(a)),
        opacity: mobile ? 0.3 : 1,
        amp: 0.4,
        mix: 0,
      };
    }

    // Contact : un anneau autour du mail, qui tourne lentement
    case 'ring': {
      let a = (i / n) * Math.PI * 2 + t * 0.12 - Math.PI / 2;
      if (mobile) {
        // Mobile : le texte prend toute la largeur → pas de cartes sur les
        // côtés. Une moitié en arc au-dessus (de -140° à -40°), l'autre en
        // dessous (de 40° à 140°), sans rotation dans le temps
        const top = Math.ceil(n / 2);
        const onTop = i < top;
        const k = onTop ? i : i - top;
        const count = onTop ? top : n - top;
        const from = onTop ? -140 : 40;
        a = ((from + (count > 1 ? k / (count - 1) : 0.5) * 100) * Math.PI) / 180;
      }
      return card(
        W / 2 + Math.cos(a) * W * 0.36,
        H / 2 + Math.sin(a) * H * (mobile ? 0.38 : 0.36),
        b * (mobile ? 0.8 : 0.7),
        { rotation: Math.cos(a) * 0.08, amp: 0.8, opacity: mobile ? 0.45 : 1 },
      );
    }
  }
}

/** Le menu mobile a lancé About : ses cartes y volent directement depuis
 *  l'éventail (au lieu de revenir d'abord dans la page quittée) */
export const aboutFromMenu = { current: false };

/**
 * Page Contact : l'anneau tourne comme à la fin d'About. t : secondes de
 * rotation, avancées par le Scene seulement quand il a la main sur les images
 * (en pause pendant le menu, une transition…), remises à 0 hors de Contact.
 * Lu aussi par la grille fantôme pour que le survol suive les images.
 */
export const contactRing = { t: 0 };

/** Places des images sur l'anneau de Contact à l'instant t (px écran) */
export function getContactRingRects(n: number, W: number, H: number, t = contactRing.t) {
  return Array.from({ length: n }, (_, i) => {
    const card = getAboutCard('ring', i, n, W, H, t);
    return new DOMRect(card.x - card.w / 2, card.y - card.h / 2, card.w, card.h);
  });
}

/**
 * Ancres : pour chaque section, le défilement (px) où elle est centrée à l'écran,
 * et sa disposition. Mesurées par About, lues par le Scene à chaque image (un
 * objet modifié en place, pas un état : rien à re-rendre).
 */
export const aboutAnchors: {
  current: { at: number; layout: AboutLayoutName }[];
} = { current: [] };

/** Mesure les sections marquées data-about-layout (au montage, au resize) */
export function measureAboutAnchors() {
  const H = window.innerHeight;
  const max = document.documentElement.scrollHeight - H;
  const sections = document.querySelectorAll<HTMLElement>('[data-about-layout]');
  aboutAnchors.current = Array.from(sections).map((el) => {
    const rect = el.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    return {
      // Section centrée ; jamais au-delà du bas de la page (dernière section)
      at: Math.min(Math.max(top + rect.height / 2 - H / 2, 0), max),
      layout: el.dataset.aboutLayout as AboutLayoutName,
    };
  });
}

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Lent au départ et à l'arrivée, rapide au milieu */
const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Pose de la carte i pour un défilement scrollY : entre deux sections, les
 * cartes glissent de l'une à l'autre, chacune un peu après la précédente.
 */
export function stateAt(
  i: number,
  n: number,
  scrollY: number,
  W: number,
  H: number,
  t = 0,
): AboutCard | null {
  const anchors = aboutAnchors.current;
  if (anchors.length === 0) return null;

  // A : dernière section dépassée, B : la suivante
  let k = 0;
  while (k < anchors.length - 1 && scrollY >= anchors[k + 1].at) k++;
  const A = anchors[k];
  const B = anchors[Math.min(k + 1, anchors.length - 1)];
  const a = getAboutCard(A.layout, i, n, W, H, t);
  if (A === B || B.at <= A.at) return a;
  const b = getAboutCard(B.layout, i, n, W, H, t);

  // raw : de 0 (section A centrée) à 1 (section B centrée)
  const raw = clamp01((scrollY - A.at) / (B.at - A.at));
  // Départ décalé : la dernière carte part 0,2 après la première, quel que soit n
  const e = ease(clamp01((raw - 0.1 - (i / n) * 0.2) / 0.7));
  // À mi-chemin, les cartes penchent (une à gauche, une à droite) : un vol
  const flight = Math.sin(e * Math.PI);

  return {
    x: lerp(a.x, b.x, e),
    y: lerp(a.y, b.y, e),
    w: lerp(a.w, b.w, e),
    h: lerp(a.h, b.h, e),
    rotation: lerp(a.rotation, b.rotation, e) + flight * 0.14 * (i % 2 ? 1 : -1),
    opacity: lerp(a.opacity, b.opacity, e),
    amp: lerp(a.amp, b.amp, e) + flight * 0.9,
    mix: lerp(a.mix, b.mix, e),
  };
}
