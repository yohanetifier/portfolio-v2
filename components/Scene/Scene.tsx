'use client';

import { ProjectItem } from '@/contexts/ThreeJsContext';
import React from 'react';
import Plane from '../Plane/Plane';
import { useThree } from '@react-three/fiber';

type Props = {
  projects: ProjectItem[];
};

const Scene = ({ projects }: Props) => {
  const { viewport, size } = useThree();
  return projects.map(({ rects, imageUrl }, i) => {
    const centerX = rects.left + rects.width / 2;
    const centerY = rects.top + rects.height / 2;
    const worldX = (centerX / size.width - 0.5) * viewport.width;
    const worldY = -(centerY / size.height - 0.5) * viewport.height;
    const worldW = (rects.width / size.width) * viewport.width;
    const worldH = (rects.height / size.height) * viewport.height;
    return (
      <group key={i} position={[worldX, worldY, 0]} scale={[worldW, worldH, 1]}>
        <Plane imageUrl={imageUrl} />
      </group>
    );
  });
};

export default Scene;
