import { useThreeJsContext } from '@/contexts/ThreeJsContext';
import { useFrame, useThree } from '@react-three/fiber';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const CURSORS = 6;

const Cursor = () => {
  const meshRef = useRef<THREE.Mesh[]>([]);
  const { mouseCoords, setMouseCoords, cursorHover } = useThreeJsContext();
  const { viewport, size } = useThree();
  const cursors = Array.from({ length: CURSORS });
  const oldPosition = useRef<{ x: number; y: number }[]>([]);

  useFrame(() => {
    if (mouseCoords.x === null || mouseCoords.y === null || !meshRef.current)
      return;

    const visible = !cursorHover;
    for (let i = 0; i < cursors.length; i++) {
      const mesh = meshRef.current[i];
      if (mesh) mesh.visible = visible;
    }
    if (!visible) return;

    const worldX = (mouseCoords.x / size.width - 0.5) * viewport.width;
    const worldY = -(mouseCoords.y / size.height - 0.5) * viewport.height;
    meshRef.current[0].position.x =
      meshRef.current[0].position.x +
      (worldX - meshRef.current[0].position.x) * 0.1;
    meshRef.current[0].position.y =
      meshRef.current[0].position.y +
      (worldY - meshRef.current[0].position.y) * 0.1;
    meshRef.current[0].scale.set(0.05, 0.05, 0.05);
    oldPosition.current.push({
      x: meshRef.current[0].position.x,
      y: meshRef.current[0].position.y,
    });
    if (oldPosition.current.length > 20) {
      oldPosition.current.shift();
    }

    if (oldPosition.current.length > 10) {
      for (let i = 1; i < cursors.length; i++) {
        const scale = i / (cursors.length * 20);
        const sample = oldPosition.current[i * 3];
        if (!sample || !meshRef.current[i]) continue;
        meshRef.current[i].position.x = sample.x;
        meshRef.current[i].position.y = sample.y;
        meshRef.current[i].scale.set(
          Number(scale),
          Number(scale),
          Number(scale),
        );
      }
    }
  });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMouseCoords({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('pointermove', handleMove);
    return () => {
      window.removeEventListener('pointermove', handleMove);
    };
  }, [setMouseCoords]);

  return (
    <>
      {cursors.map((_, i) => {
        return (
          <mesh
            key={i}
            ref={(el) => {
              if (el) meshRef.current[i] = el;
            }}
            scale={[0.2, 0.2, 0.2]}
          >
            <circleGeometry />
            <meshBasicMaterial
              depthTest={false}
              color={'black'}
              transparent
              opacity={i === 0 ? 1 : i / cursors.length}
            />
          </mesh>
        );
      })}
    </>
  );
};

export default Cursor;
