'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { useThreeJsContext } from '@/contexts/ThreeJsContext';
import { INTRO } from '@/utils/introTiming';

const LoaderUI = () => {
  const { progress, active, total } = useProgress();
  const { setIntroReady } = useThreeJsContext();
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [display, setDisplay] = useState(0);
  const displayRef = useRef(0);
  const progressRef = useRef(0);
  const assetsReadyRef = useRef(false);

  useEffect(() => {
    if (total > 0 && !active && progress >= 100) {
      assetsReadyRef.current = true;
      progressRef.current = 100;
    } else {
      progressRef.current = progress;
    }
  }, [progress, active, total]);

  useEffect(() => {
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
  }, [setIntroReady]);

  if (hasLoaded) return null;

  return (
    <div
      className="fixed inset-0 z-[200] bg-white"
      style={{
        transition: `clip-path ${INTRO.wipeDuration}s ${INTRO.wipeEase}`,
        clipPath: isExiting ? 'inset(0 0 100% 0)' : 'inset(0%)',
      }}
      onTransitionEnd={(e) => {
        if (e.propertyName === 'clip-path') setHasLoaded(true);
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
  );
};

export default LoaderUI;
