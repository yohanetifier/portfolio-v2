'use client';

import { useThreeJsContext } from '@/contexts/ThreeJsContext';
import { useFinePointer } from '@/utils/useFinePointer';
import gsap from 'gsap';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

const SELECTOR = 'a, button, [data-cursor]';

/** Pages où le trail 3D remplace le curseur idle */
function hasThreeCursor(pathname: string | null) {
  return pathname === '/' || (pathname?.startsWith('/work') ?? false);
}

export default function CursorFollow() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { setCursorHover } = useThreeJsContext();
  const pathname = usePathname();
  const finePointer = useFinePointer();
  const useIdleDot = !hasThreeCursor(pathname);
  const xTo = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const yTo = useRef<ReturnType<typeof gsap.quickTo> | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !finePointer) {
      setCursorHover(false);
      return;
    }

    gsap.set(root, {
      xPercent: -50,
      yPercent: -50,
      scale: 1 / 2,
      opacity: useIdleDot ? 1 : 0,
    });

    xTo.current = gsap.quickTo(root, 'x', {
      duration: 0.35,
      ease: 'power3.out',
    });
    yTo.current = gsap.quickTo(root, 'y', {
      duration: 0.35,
      ease: 'power3.out',
    });

    const setActive = (on: boolean) => {
      setCursorHover(on);
      gsap.to(root, {
        scale: on ? 1 : 1 / 2,
        opacity: on || useIdleDot ? 1 : 0,
        duration: 0.35,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    };

    const onMove = (e: PointerEvent) => {
      xTo.current?.(e.clientX);
      yTo.current?.(e.clientY);
    };

    const onPointerOver = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.(SELECTOR);
      if (!el) return;
      setActive(true);
    };

    const onPointerOut = (e: PointerEvent) => {
      const from = (e.target as Element | null)?.closest?.(SELECTOR);
      const to = (e.relatedTarget as Element | null)?.closest?.(SELECTOR);
      if (from && !to) setActive(false);
    };

    window.addEventListener('pointermove', onMove);
    document.addEventListener('pointerover', onPointerOver);
    document.addEventListener('pointerout', onPointerOut);

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onPointerOver);
      document.removeEventListener('pointerout', onPointerOut);
      setCursorHover(false);
    };
  }, [setCursorHover, useIdleDot, finePointer]);

  if (!finePointer) return null;

  return <div ref={rootRef} className="cursor-follow" aria-hidden />;
}
