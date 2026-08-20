'use client';
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { useThreeJsContext } from '@/contexts/ThreeJsContext';
import Scene from '../Scene/Scene';
import { usePathname } from 'next/navigation';

const FullscreenCanvas = () => {
  const { projectsDetails } = useThreeJsContext();
  const pathname = usePathname();
  if (pathname !== '/work') return null;

  return (
    <Canvas
      // gl={{ alpha: true }}
      // onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      style={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: '0px',
        left: '0px',
        zIndex: 1,
        pointerEvents: 'none',
      }}
      id="fullscreen"
    >
      <Scene projectsDetails={projectsDetails} />
    </Canvas>
  );
};

export default FullscreenCanvas;
