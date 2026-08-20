'use client';

import { ProjectItem, useThreeJsContext } from '@/contexts/ThreeJsContext';
import React, { useEffect, useRef } from 'react';
import Plane from '../Plane/Plane';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { getPositions } from '../WorkList/utils/getPositions';

type Props = {
  projectsDetails: ProjectItem[];
};

const Scene = ({ projectsDetails }: Props) => {
  const { viewport, size } = useThree();
  const groupRefArray = useRef<(THREE.Group | null)[]>([]);
  const { selectedIndex, setSelectedIndex } = useThreeJsContext();
  useEffect(() => {
    if (selectedIndex === null) return;
    const tl = gsap.timeline();
    const { childAtTheBottom, childAtTheTop } = getPositions(
      groupRefArray.current,
      groupRefArray.current[selectedIndex],
    );

    console.log('childAtTheTop', childAtTheTop);
    console.log('childAtTheBottom', childAtTheBottom[2].position);

    tl.to(groupRefArray.current[selectedIndex]!.scale, {
      x: viewport.width,
      y: viewport.height,
      duration: 1,
    }).to(
      groupRefArray.current[selectedIndex]!.position,
      { x: 0, y: 0, duration: 1 },
      '<',
    );
    childAtTheBottom.forEach((element) => {
      tl.to(element.position, { y: -viewport.height }, '<');
    });
    childAtTheTop.forEach((element) => {
      tl.to(element.position, { y: viewport.height }, '<');
    });
    // return () => setSelectedIndex(null);
  }, [selectedIndex]);

  return projectsDetails.map(({ rects, imageUrl }, i) => {
    const centerX = rects.left + rects.width / 2;
    const centerY = rects.top + rects.height / 2;
    const worldX = (centerX / size.width - 0.5) * viewport.width;
    const worldY = -(centerY / size.height - 0.5) * viewport.height;
    const worldW = (rects.width / size.width) * viewport.width;
    const worldH = (rects.height / size.height) * viewport.height;
    return (
      <group
        key={i}
        position={[worldX, worldY, 0]}
        scale={[worldW, worldH, 1]}
        ref={(el) => {
          groupRefArray.current[i] = el;
        }}
      >
        <Plane imageUrl={imageUrl} />
      </group>
    );
  });
};

export default Scene;
