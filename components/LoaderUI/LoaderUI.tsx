'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { usePathname } from 'next/navigation';
import { useThreeJsContext } from '@/contexts/ThreeJsContext';
import { INTRO } from '@/utils/introTiming';
import { lockScroll, unlockScroll } from '@/utils/scroll';

function isLostPath(pathname: string | null, isLostPage: boolean) {
  if (isLostPage) return true;
  if (!pathname) return false;
  return (
    pathname !== '/' &&
    pathname !== '/contact' &&
    pathname !== '/about' &&
    !pathname.startsWith('/work') &&
    !pathname.startsWith('/blogs')
  );
}

/** Pages sans preload textures — pas de loader % */
function skipLoaderPath(pathname: string | null, isLostPage: boolean) {
  // /about charge des wrecks → laisser le loader (textures)
  return isLostPath(pathname, isLostPage);
}

const LoaderUI = () => {
  const { progress, active, total } = useProgress();
  const { setIntroReady, isLostPage } = useThreeJsContext();
  const pathname = usePathname();
  const skipLoader = skipLoaderPath(pathname, isLostPage);

  const [hasLoaded, setHasLoaded] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [display, setDisplay] = useState(0);
  const displayRef = useRef(0);
  const progressRef = useRef(0);
  const assetsReadyRef = useRef(false);
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  // 404 / lost : pas de loader UX — textures loadent en silence
  useEffect(() => {
    if (!skipLoader) {
      lockScroll();
      return;
    }
    setIntroReady(true);
    setHasLoaded(true);
    unlockScroll();
  }, [skipLoader, setIntroReady]);

  useEffect(() => {
    if (skipLoader) return;
    if (total > 0 && !active && progress >= 100) {
      assetsReadyRef.current = true;
      progressRef.current = 100;
    } else {
      progressRef.current = progress;
    }
  }, [progress, active, total, skipLoader]);

  useEffect(() => {
    if (skipLoader) return;
    let id = 0;
    const tick = () => {
      displayRef.current =
        displayRef.current + (progressRef.current - displayRef.current) * 0.05;

      if (assetsReadyRef.current && displayRef.current >= 99.5) {
        displayRef.current = 100;
        setDisplay(100);
        setIsExiting(true);
        setIntroReady(true);
        return;
      }

      setDisplay(displayRef.current);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [setIntroReady, skipLoader]);

  const finishLoader = () => {
    setHasLoaded(true);
    if (pathnameRef.current === '/') {
      lockScroll();
    } else {
      unlockScroll();
    }
  };

  if (hasLoaded || skipLoader) return null;

  return (
    <>
      <div className="fixed inset-0 z-[199]" aria-hidden />
      <div
        className="fixed inset-0 z-[200] bg-white"
        style={{
          transition: `clip-path ${INTRO.wipeDuration}s ${INTRO.wipeEase}`,
          clipPath: isExiting ? 'inset(0 0 100% 0)' : 'inset(0%)',
          pointerEvents: isExiting ? 'none' : 'auto',
        }}
        onTransitionEnd={(e) => {
          if (e.propertyName === 'clip-path') finishLoader();
        }}
      >
        <span
          className="absolute bottom-[50px] left-[50px] font-fabrikatMono"
          style={{
            fontSize: 'clamp(54px, 9.5vw, 124px)',
            transition: `opacity 0.45s ${INTRO.wipeEase}, transform 0.45s ${INTRO.wipeEase}`,
            opacity: isExiting ? 0 : 1,
            transform: isExiting ? 'translateY(12px)' : 'translateY(0)',
          }}
        >
          {Math.round(display)}%
        </span>
      </div>
    </>
  );
};

export default LoaderUI;
