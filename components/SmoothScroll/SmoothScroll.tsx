'use client';

import 'lenis/dist/lenis.css';
import { ReactLenis } from 'lenis/react';
import type { LenisRef } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';
import { setLenisInstance } from '@/utils/scroll';
import ScrollProgress from '@/components/ScrollProgress/ScrollProgress';

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    // ReactLenis hydrate la ref après le premier paint
    const id = requestAnimationFrame(() => {
      const lenis = lenisRef.current?.lenis;
      if (!lenis) return;

      setLenisInstance(lenis);
      lenis.on('scroll', ScrollTrigger.update);
    });

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      cancelAnimationFrame(id);
      gsap.ticker.remove(update);
      const lenis = lenisRef.current?.lenis;
      if (lenis) {
        lenis.off('scroll', ScrollTrigger.update);
        lenis.destroy();
      }
      setLenisInstance(null);
    };
  }, []);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        autoRaf: false,
        duration: 1.2,
        smoothWheel: true,
      }}
    >
      {children}
      <ScrollProgress />
    </ReactLenis>
  );
}
