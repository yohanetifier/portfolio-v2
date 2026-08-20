'use client';
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { useThreeJsContext } from '@/contexts/ThreeJsContext';
import Scene from '../Scene/Scene';
import { usePathname } from 'next/navigation';
import Plane from '../Plane/Plane';
import HeroPlane from '../HeroPlane/HeroPlane';

const FullscreenCanvas = () => {
  const { projectsDetails } = useThreeJsContext();
  const pathname = usePathname();
  const projectPath = pathname.split('/')[2];

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
        border: '10px solid red',
      }}
      id="fullscreen"
    >
      {pathname === '/work' ? (
        <Scene projectsDetails={projectsDetails} />
      ) : projectPath ? (
        <HeroPlane />
      ) : null}
    </Canvas>
  );
};

export default FullscreenCanvas;
