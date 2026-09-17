/**
 * Positions 404 — projets répartis sur tout le canvas (pas un paquet au centre).
 * Coordonnées centrées écran (x droite, y haut).
 */
export function getNotFoundProjectLayout(
  index: number,
  vw: number,
  vh: number,
  total = 12,
) {
  const n = Math.max(total, index + 1);
  // Grille assez large pour remplir l’écran
  const cols = Math.ceil(Math.sqrt(n * (vw / vh)));
  const rows = Math.ceil(n / cols);
  const col = index % cols;
  const row = Math.floor(index / cols);

  const w = Math.min(200, vw * 0.14, (vw * 0.82) / cols - 24);
  const h = w * 0.76;

  // Cellules qui couvrent ~toute la largeur / hauteur utile
  const padX = vw * 0.06 + w / 2;
  const padY = vh * 0.1 + h / 2;
  const spanX = vw - padX * 2;
  const spanY = vh - padY * 2;

  const cellW = spanX / Math.max(cols - 1, 1);
  const cellH = spanY / Math.max(rows - 1, 1);

  // Jitter déterministe pour casser l’alignement grille (sans recoller)
  const jx = Math.sin(index * 12.9898) * 0.22;
  const jy = Math.cos(index * 78.233) * 0.22;

  const left = padX + (cols === 1 ? spanX / 2 : col * cellW) + jx * cellW;
  const top = padY + (rows === 1 ? spanY / 2 : row * cellH) + jy * cellH;

  // Centre écran → coords Three (y haut)
  const x = left - vw / 2;
  const y = vh / 2 - top;

  return { x, y, w, h };
}

/** Conversion centre Three → top/left DOM */
export function notFoundLayoutToDom(
  layout: { x: number; y: number; w: number; h: number },
  vw: number,
  vh: number,
) {
  return {
    left: vw / 2 + layout.x - layout.w / 2,
    top: vh / 2 - layout.y - layout.h / 2,
    width: layout.w,
    height: layout.h,
  };
}
