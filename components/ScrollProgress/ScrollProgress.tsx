'use client';

import { useLenis } from 'lenis/react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { useEffect, useRef } from 'react';

const THUMB_TRAVEL = ((100 - 18) / 18) * 100;
const FADE = { duration: 0.35, ease: 'power3.out' } as const;

export default function ScrollProgress() {
  const rootRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const visible = pathname !== '/' && pathname !== '/contact';

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    gsap.to(el, {
      opacity: visible ? 1 : 0,
      duration: FADE.duration,
      ease: FADE.ease,
      overwrite: 'auto',
    });
  }, [visible]);

  useLenis(({ progress }) => {
    if (!visible || !thumbRef.current) return;
    thumbRef.current.style.transform = `translateY(${progress * THUMB_TRAVEL}%)`;
  });

  return (
    <div ref={rootRef} className="progress" aria-hidden>
      <div className="progress__thumb" ref={thumbRef} />
    </div>
  );
}
