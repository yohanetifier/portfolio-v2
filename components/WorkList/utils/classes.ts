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

const STARTING_CLASSES = [
  'w-[16.641vw] h-[19.943vw] absolute right-[50%] rotate-[-14deg] z-[7]',
  'w-[16.641vw] h-[19.943vw] absolute top-[48%] lg:top-[40%] z-[6]',
  'w-[24.573vw] h-[15.526vw] rotate-[8deg] absolute top-[42%] lg:top-[30%] z-[5]',
  'w-[16.641vw] h-[19.943vw] absolute top-[40%] lg:top-[25%] z-10 rotate-[1deg] z-[4]',
  'w-[16.641vw] h-[19.943vw] absolute top-[25%] z-10 rotate-[1deg] z-[4]',
] as const;

export function getStartingClass(index: number) {
  return (
    STARTING_CLASSES[index] ??
    'opacity-0 w-[16.641vw] h-[19.943vw] absolute pointer-events-none'
  );
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
  const cycles = Math.max(1, Math.ceil(count / GRID_PATTERN.length));

  return {
    rows: BASE_ROWS + (cycles - 1) * ROW_CYCLE,
    height: `${BASE_HEIGHT_VH * cycles}vh`,
  };
}
