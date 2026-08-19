'use client';
import React from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import Plane from '../Plane/Plane';
import { useThreeJsContext } from '@/contexts/ThreeJsContext';
import Scene from '../Scene/Scene';

const FullscreenCanvas = () => {
  const { projectsDetails } = useThreeJsContext();
  return (
    <Canvas
      style={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: '0px',
        left: '0px',
        border: '10px solid red',
        pointerEvents: 'none',
      }}
      // id="fullscreen"
    >
      {/* {projectsDetails.map(({ imageUrl }, i) => (
        <Plane key={i} imageUrl={imageUrl} />
      ))} */}
      <Scene projects={projectsDetails} />
    </Canvas>
  );
};

export default FullscreenCanvas;
