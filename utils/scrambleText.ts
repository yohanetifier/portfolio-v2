import { lettersAndSymbols } from '@/common/utils/animateText';

export const scrambleText = (text: string, progress: number) => {
  const textLength = text.length;
  const factor = 100 / textLength;
  const revealedCount = Math.floor(progress / factor);
  return text
    .split('')
    .map((char, i) => {
      if (char === ' ' || i < revealedCount) {
        return char;
      } else {
        return lettersAndSymbols[
          Math.floor(Math.random() * lettersAndSymbols.length)
        ];
      }
    })

    .join('');
};
