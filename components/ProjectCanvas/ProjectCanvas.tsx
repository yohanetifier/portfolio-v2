'use client';
import React from 'react';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { WavePlane } from '../WavePlane/WavePlane';

export default function ThreeCanvas() {
  return (
    <Canvas camera={{ position: [0, 0, 2] }}>
      <ambientLight intensity={0.5} />
      <WavePlane />
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
}
