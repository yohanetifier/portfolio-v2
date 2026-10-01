import SplitType from 'split-type';
import gsap from 'gsap';

export const lettersAndSymbols = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
  '!',
  '@',
  '#',
  '$',
  '%',
  '^',
  '&',
  '*',
  '-',
  '_',
  '+',
  '=',
  ';',
  ':',
  '<',
  '>',
  ',',
];

export const animateText = (ref: HTMLElement) => {
  const splitText = new SplitType(ref, { types: 'chars' });
  const chars = splitText.chars;

  chars!.forEach((char, position) => {
    const initialHTML = char.innerHTML;
    let repeatCount = 0;

    gsap.fromTo(
      char,
      {
        opacity: 0,
      },
      {
        duration: 0.03,
        onStart: () => {
          gsap.set(char, { '--opa': 1 });
        },
        onComplete: () => {
          gsap.set(char, { innerHTML: initialHTML, delay: 0.03 });
        },
        repeat: 3,
        onRepeat: () => {
          repeatCount++;
          if (repeatCount === 1) {
            gsap.set(char, { '--opa': 0 });
          }
        },
        repeatRefresh: true,
        repeatDelay: 0.04,
        delay: (position + 1) * 1,
        innerHTML: () =>
          lettersAndSymbols[
            Math.floor(Math.random() * lettersAndSymbols.length)
          ],
        opacity: 1,
      },
    );
  });
};
