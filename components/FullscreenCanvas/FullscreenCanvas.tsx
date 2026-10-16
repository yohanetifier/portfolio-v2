'use client';
import React, { useContext } from 'react';
import { Canvas } from '@react-three/fiber';
import { useThreeJsContext } from '@/contexts/ThreeJsContext';
import Scene from '../Scene/Scene';
import { usePathname } from 'next/navigation';
import Cursor from '../Cursor/Cursor';
import { useFinePointer } from '@/utils/useFinePointer';
import { ThemeContext } from '@/contexts/MenuProvider';

const FullscreenCanvas = () => {
  const { projectsDetails, isLostPage, isAnimating } = useThreeJsContext();
  const pathname = usePathname();
  const finePointer = useFinePointer();
  const { isOpen: menuOpen, fanRaised } = useContext(ThemeContext);
  // Catch-all /xxx = vraie page 404 (pas not-found.tsx) → garder le canvas
  const isLostRoute =
    isLostPage ||
    (pathname !== '/' &&
      pathname !== '/contact' &&
      !pathname.startsWith('/work') &&
      !pathname.startsWith('/blogs'));

  const showScene =
    pathname.startsWith('/work') ||
    pathname === '/' ||
    pathname === '/contact' ||
    isLostRoute ||
    isAnimating;

  // Trail 3D seulement home + worklist — page projet = HTML au-dessus du canvas
  const showThreeCursor =
    finePointer && (pathname === '/' || pathname === '/work');

  return (
    <Canvas
      style={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: '0px',
        left: '0px',
        // Menu mobile : entre son voile (z-90) et son texte (z-96), pour
        // l'éventail, jusqu'à la fin du retour des images à la fermeture.
        // Au-dessus du HTML pendant les transitions (évite flash worklist/projet)
        zIndex: menuOpen || fanRaised ? 95 : isAnimating ? 20 : 1,
      }}
      id="fullscreen"
    >
      {showScene ? (
        <>
          {showThreeCursor ? <Cursor /> : null}
          <Scene projectsDetails={projectsDetails} />
        </>
      ) : null}
    </Canvas>
  );
};

export default FullscreenCanvas;
