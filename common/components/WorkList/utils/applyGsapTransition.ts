import gsap from 'gsap';
import { Flip } from 'gsap/all';
export const applyGsapTransition = (
  childatTheBottom: HTMLElement[],
  childAtTheTop: HTMLElement[],
  title: string,
  state: Flip.FlipState,
  target: HTMLElement,
  router: any,
) => {
  const tl = gsap.timeline({});

  tl.to(childatTheBottom, {
    y: '100vh',
    rotate: -10,
    duration: 1,
    onComplete: () => {
      router.push(`/work/${title}`);
    },
  }).to(
    childAtTheTop,
    {
      y: '-100vh',
      rotate: 10,
      duration: 1,
    },
    '<',
  );

  Flip.from(state, {
    delay: 0.01,
    duration: 1,
    ease: 'power2.inOut',
    onStart: () => {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
    },
  }).to(target, { filter: 'brightness(0.5)' }, '-=0.5');
};
