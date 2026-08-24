'use client';

import { ProjectItem, useThreeJsContext } from '@/contexts/ThreeJsContext';
import React, { useEffect, useRef, useState } from 'react';
import Plane from '../Plane/Plane';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { getPositions } from '../WorkList/utils/getPositions';
import { useHeaderContext } from '@/contexts/HeaderContext';
import { getProjectsFromLocalStorage } from '@/utils/getProjectsFromLocalStorage';

type Props = {
  projectsDetails: ProjectItem[];
};

const Scene = ({ projectsDetails }: Props) => {
  const { viewport, size } = useThree();
  const groupRefArray = useRef<(THREE.Group | null)[]>([]);
  const { selectedIndex, setSelectedIndex, projectImageSelected } =
    useThreeJsContext();
  const [settledIndex, setSettledIndex] = useState<number | null>();
  const { isReturning, setIsReturning, reset, setReset } = useHeaderContext();

  useEffect(() => {
    if (reset) {
      setSelectedIndex(null);
      setSettledIndex(null);
      setIsReturning(false);
      setReset(false);
    }
    console.log('selectedIndex', selectedIndex);
    if (selectedIndex === null) return;
    const tl = gsap.timeline({
      onComplete: () => {
        setSettledIndex(selectedIndex!);
        // setSelectedIndex(null);
      },
    });

    const { childAtTheBottom, childAtTheTop } = getPositions(
      groupRefArray.current,
      groupRefArray.current[selectedIndex],
    );

    if (!isReturning) {
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
        tl.to(
          element.position,
          {
            y: viewport.height,
          },
          '<',
        );
      });
    } else {
      const projectCoords = getProjectsFromLocalStorage('projectDetails');
      if (projectCoords.rects.length > 0) {
        const projectSelected = projectCoords.rects[selectedIndex];
        const centerX =
          projectSelected.rects.left + projectSelected.rects.width / 2;
        const centerY =
          projectSelected.rects.top + projectSelected.rects.height / 2;
        const worldX = (centerX / size.width - 0.5) * viewport.width;
        const worldY = -(centerY / size.height - 0.5) * viewport.height;
        const worldW =
          (projectSelected.rects.width / size.width) * viewport.width;
        const worldH =
          (projectSelected.rects.height / size.height) * viewport.height;
        const reverseTl = gsap.timeline();
        reverseTl
          .to(groupRefArray.current[selectedIndex]!.position, {
            x: worldX,
            y: worldY,
          })
          .to(
            groupRefArray.current[selectedIndex]!.scale,
            {
              x: worldW,
              y: worldH,
              onComplete: () => {
                setSelectedIndex(null);
                setSettledIndex(null);
                setIsReturning(false);
                // setSettledIndex(null);
              },
            },
            '<',
          );
      } else {
        null;
        // const projectSelected = projectsDetails[selectedIndex];
        // const centerX =
        //   projectSelected.rects.left + projectSelected.rects.width / 2;
        // const centerY =
        //   projectSelected.rects.top + projectSelected.rects.height / 2;
        // const worldX = (centerX / size.width - 0.5) * viewport.width;
        // const worldY = -(centerY / size.height - 0.5) * viewport.height;
        // const worldW =
        //   (projectSelected.rects.width / size.width) * viewport.width;
        // const worldH =
        //   (projectSelected.rects.height / size.height) * viewport.height;
        // const reverseTl = gsap.timeline();
        // reverseTl
        //   .to(groupRefArray.current[selectedIndex]!.position, {
        //     x: worldX,
        //     y: worldY,
        //   })
        //   .to(
        //     groupRefArray.current[selectedIndex]!.scale,
        //     {
        //       x: worldW,
        //       y: worldH,
        //       onComplete: () => {
        //         setSelectedIndex(null);
        //         setSettledIndex(null);
        //         setIsReturning(false);
        //         // setSettledIndex(null);
        //       },
        //     },
        //     '<',
        //   );
      }
    }

    // return () => setSelectedIndex(null);
  }, [selectedIndex, isReturning, reset]);

  if (projectsDetails.length > 0) {
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
          <Plane imageUrl={imageUrl} isSelected={settledIndex === i} />
        </group>
      );
    });
  } else {
    return (
      <group position={[0, 0, 0]} scale={[viewport.width, viewport.height, 1]}>
        <Plane imageUrl={projectImageSelected} isSelected={true} />
      </group>
    );
  }
};

export default Scene;
