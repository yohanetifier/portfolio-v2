const ROW_CYCLE = 7;
const BASE_ROWS = 10;
const BASE_HEIGHT_VH = 300;

const GRID_PATTERN = [
  {
    className:
      'w-[20.208vw] h-[24.219vw] relative right-[6.25vw] bottom-[5.208vw] z-[10]',
    colStart: 3,
    colEnd: 5,
    rowStart: 3,
  },
  {
    className:
      'w-[20.208vw] h-[24.219vw] relative left-[5.208vw] bottom-[5.208vw] z-[10]',
    colStart: 6,
    colEnd: 9,
    rowStart: 4,
  },
  {
    className:
      'w-[28.542vw] h-[18.854vw] relative left-[6.25vw] bottom-[5.208vw]',
    colStart: 5,
    colEnd: 8,
    rowStart: 2,
  },
  {
    className: 'w-[20.208vw] h-[24.219vw] relative top-[7.813vw]',
    colStart: 7,
    colEnd: 9,
    rowStart: 4,
  },
  {
    className: 'w-[20.208vw] h-[24.219vw] relative bottom-[3.385vw]',
    colStart: 3,
    colEnd: 5,
    rowStart: 5,
  },
  {
    className: 'w-[28.542vw] h-[18.854vw]',
    colStart: 2,
    colEnd: 5,
    rowStart: 7,
  },
  {
    className: 'w-[20.208vw] h-[24.219vw] relative bottom-[5.208vw]',
    colStart: 7,
    colEnd: 9,
    rowStart: 8,
  },
] as const;

export const gridClasses = GRID_PATTERN.map((p) => p.className);

/** Intro : toutes les cartes empilées au centre (paquet) — voir utils/deck.ts */
const DECK_CLASS =
  'absolute left-1/2 top-[44%] md:top-1/2 w-[42vw] h-[50.4vw] md:w-[16.641vw] md:h-[19.943vw]';

export function getStartingClass() {
  return DECK_CLASS;
}

export function getGridPlacement(index: number) {
  const pattern = GRID_PATTERN[index % GRID_PATTERN.length];
  const cycle = Math.floor(index / GRID_PATTERN.length);

  return {
    className: pattern.className,
    style: {
      gridColumnStart: pattern.colStart,
      gridColumnEnd: pattern.colEnd,
      // Shifts the base rowStart down as the list grows.
      gridRowStart: pattern.rowStart + cycle * ROW_CYCLE,
    },
  };
}

export function getGridMetrics(count: number) {
  if (count <= 0) {
    return {
      rows: BASE_ROWS,
      height: `${BASE_HEIGHT_VH}vh`,
    };
  }

  let maxRow = 0;
  for (let i = 0; i < count; i++) {
    maxRow = Math.max(maxRow, getGridPlacement(i).style.gridRowStart);
  }

  // Marge pour les offsets relative (top/bottom) et la hauteur des cards (~24vw)
  const rows = maxRow + 3;
  const vhPerRow = BASE_HEIGHT_VH / BASE_ROWS;

  return {
    rows,
    height: `${rows * vhPerRow}vh`,
  };
}
