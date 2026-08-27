'use client';
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { useThreeJsContext } from '@/contexts/ThreeJsContext';
import Scene from '../Scene/Scene';
import { usePathname } from 'next/navigation';

const FullscreenCanvas = () => {
  const { projectsDetails } = useThreeJsContext();
  const pathname = usePathname();

  return (
    <Canvas
      style={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: '0px',
        left: '0px',
        zIndex: 1,
        pointerEvents: 'none',
        border: '2px solid red',
      }}
      id="fullscreen"
    >
      {pathname.startsWith('/work') || pathname === '/' ? (
        <Scene projectsDetails={projectsDetails} />
      ) : null}
    </Canvas>
  );
};

export default FullscreenCanvas;
