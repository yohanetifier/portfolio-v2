// components/WavePlane.tsx
'use client';
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

export function WavePlane() {
  const meshRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (meshRef.current) {
      const position = meshRef.current.geometry.attributes.position;
      const count = position.count;

      for (let i = 0; i < count; i++) {
        const x = position.getX(i);
        const wave = Math.sin(x * 2 + time * 2) * 0.1;
        position.setZ(i, wave);
      }

      position.needsUpdate = true;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1, 64, 64]} />
      <meshStandardMaterial color="#ffffff" wireframe />
    </mesh>
  );
}
