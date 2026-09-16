'use client';
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { useThreeJsContext } from '@/contexts/ThreeJsContext';
import Scene from '../Scene/Scene';
import { usePathname } from 'next/navigation';
import Cursor from '../Cursor/Cursor';
import { useFinePointer } from '@/utils/useFinePointer';

const FullscreenCanvas = () => {
  const { projectsDetails } = useThreeJsContext();
  const pathname = usePathname();
  const finePointer = useFinePointer();
  const showScene = pathname.startsWith('/work') || pathname === '/';

  return (
    <Canvas
      style={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: '0px',
        left: '0px',
        zIndex: 1,
        // pointerEvents: 'auto',
      }}
      id="fullscreen"
    >
      {showScene ? (
        <>
          {finePointer ? <Cursor /> : null}
          <Scene projectsDetails={projectsDetails} />
        </>
      ) : null}
    </Canvas>
  );
};

export default FullscreenCanvas;
