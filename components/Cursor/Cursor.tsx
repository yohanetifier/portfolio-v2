import { useThreeJsContext } from '@/contexts/ThreeJsContext';
import { useFrame, useThree } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';

const CURSORS = 6;

const Cursor = () => {
  const meshRef = useRef<THREE.Mesh[]>([]);
  const { mouseCoords } = useThreeJsContext();
  const { viewport, size } = useThree();
  const cursors = Array.from({ length: CURSORS });
  const oldPosition = useRef([]);

  useFrame(() => {
    if (mouseCoords.x === null || mouseCoords.y === null || !meshRef.current)
      return;
    const worldX = (mouseCoords.x / size.width - 0.5) * viewport.width;
    const worldY = -(mouseCoords.y / size.height - 0.5) * viewport.height;
    meshRef.current[0].position.x =
      meshRef.current[0].position.x +
      (worldX - meshRef.current[0].position.x) * 0.1;
    meshRef.current[0].position.y =
      meshRef.current[0].position.y +
      (worldY - meshRef.current[0].position.y) * 0.1;
    meshRef.current[0].scale.set(0.6, 0.6, 0.6);
    oldPosition.current.push({
      x: meshRef.current[0].position.x,
      y: meshRef.current[0].position.y,
    });
    if (oldPosition.current.length > 20) {
      oldPosition.current.shift();
    }

    if (oldPosition.current.length > 10) {
      for (let i = 1; i < cursors.length; i++) {
        meshRef.current[i].position.x = oldPosition.current[i * 3].x;
        meshRef.current[i].position.y = oldPosition.current[i * 3].y;
        meshRef.current[i].scale.set(
          Number(`0.${i}`),
          Number(`0.${i}`),
          Number(`0.${i}`),
        );
      }
    }
  });

  return (
    <>
      {cursors.map((_, i) => {
        return (
          <mesh
            key={i}
            ref={(el) => (meshRef.current[i] = el)}
            scale={[0.2, 0.2, 0.2]}
          >
            <circleGeometry />
            <meshBasicMaterial
              depthTest={false}
              color={'red'}
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
