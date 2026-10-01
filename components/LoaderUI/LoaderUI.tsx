'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { useThreeJsContext } from '@/contexts/ThreeJsContext';

const LoaderUI = () => {
  const { progress, active, total } = useProgress();
  const { setIntroReady } = useThreeJsContext();
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [display, setDisplay] = useState(0);
  const displayRef = useRef(0);
  const progressRef = useRef(0);
  const assetsReadyRef = useRef(false);

  // Cible du lerp + flag "textures prêtes"
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

      // Wipe seulement quand le compteur affiché a rattrapé ~100
      if (assetsReadyRef.current && displayRef.current >= 99.5) {
        displayRef.current = 100;
        setDisplay(100);
        setIsExiting(true);
        setIntroReady(true); // Home lance l’entrée des titres en sync avec le wipe
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
        transition: 'clip-path 1s cubic-bezier(0.76, 0, 0.24, 1)',
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
        }}
      >
        {Math.round(display)}%
      </span>
    </div>
  );
};

export default LoaderUI;
