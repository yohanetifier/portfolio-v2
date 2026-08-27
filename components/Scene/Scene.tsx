'use client';

import { ProjectItem, useThreeJsContext } from '@/contexts/ThreeJsContext';
import React, { useEffect, useRef, useState } from 'react';
import Plane from '../Plane/Plane';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { getPositions } from '../WorkList/utils/getPositions';
import { useHeaderContext } from '@/contexts/HeaderContext';
import { usePathname } from 'next/navigation';
import { getProjectPath } from '@/utils/getProjectPath';
import { clearFlag, getFlag } from '@/utils/fromWorkList';

type Props = {
  projectsDetails: ProjectItem[];
};

const Scene = ({ projectsDetails }: Props) => {
  const { viewport, size } = useThree();
  const { selectedIndex, setSelectedIndex, projectSelectedCoords, scrollY } =
    useThreeJsContext();

  const [settledIndex, setSettledIndex] = useState<number | null>();
  const { isReturning, setIsReturning, reset, setReset } = useHeaderContext();
  const workPath = getProjectPath(usePathname());
  const initCoords = useRef<Record<string, number>>({});
  const groupRefArray = useRef<(THREE.Group | null)[]>([]);
  const projectsAtTheBottom = useRef<Record<string, number>>({});
  const projectsAtTheTop = useRef<Record<string, number>>({});
  const projectsAtTheBottomRef = useRef<THREE.Group[]>([]);
  const projectsAtTheTopRef = useRef<THREE.Group[]>([]);

  useEffect(() => {
    const fromWorkList = getFlag();

    if (reset) {
      setSelectedIndex(null);
      setSettledIndex(null);
      setIsReturning(false);
      setReset(false);
    }
    if (selectedIndex === null) return;
    const tl = gsap.timeline({
      onComplete: () => {
        setSettledIndex(selectedIndex!);
      },
    });

    if (!groupRefArray.current) return;
    if (!groupRefArray.current[selectedIndex]) return;

    if (!isReturning) {
      if (
        groupRefArray.current[selectedIndex].position.x === 0.0 &&
        groupRefArray.current[selectedIndex].position.y === 0.0 &&
        groupRefArray.current[selectedIndex].position.y === 0.0
      ) {
        const initItemSelected = projectsDetails[selectedIndex];
        const centerX =
          initItemSelected.rects.left + initItemSelected.rects.width / 2;
        const centerY =
          initItemSelected.rects.top + initItemSelected.rects.height / 2;
        const worldX = (centerX / size.width - 0.5) * viewport.width;
        const worldY = -(centerY / size.height - 0.5) * viewport.height;

        const baseLocationItemSelected = new THREE.Group();

        baseLocationItemSelected.position.x = worldX;
        baseLocationItemSelected.position.y = worldY;
        const groupRefArrayFilter = groupRefArray.current.filter(
          (_, i) => i !== selectedIndex,
        );

        if (!fromWorkList) {
          groupRefArrayFilter.forEach((element) => {
            initCoords.current[element.uuid] = element?.position.y;
          });
        }

        const { childAtTheBottom, childAtTheTop } = getPositions(
          groupRefArrayFilter,
          baseLocationItemSelected,
        );
        projectsAtTheBottomRef.current = childAtTheBottom;
        projectsAtTheTopRef.current = childAtTheTop;
        projectsAtTheBottomRef.current.forEach((element) => {
          projectsAtTheBottom.current[element.uuid] = element.position.y;
        });
        projectsAtTheTopRef.current.forEach((element) => {
          projectsAtTheTop.current[element.uuid] = element.position.y;
        });
      } else {
        const { childAtTheBottom, childAtTheTop } = getPositions(
          groupRefArray.current,
          groupRefArray.current[selectedIndex],
        );
        projectsAtTheBottomRef.current = childAtTheBottom;
        projectsAtTheTopRef.current = childAtTheTop;
      }

      projectsAtTheBottomRef.current.forEach((element) => {
        projectsAtTheBottom.current[element.uuid] = element.position.y;
      });

      projectsAtTheTopRef.current.forEach((element) => {
        projectsAtTheTop.current[element.uuid] = element.position.y;
      });

      tl.to(groupRefArray.current[selectedIndex]!.scale, {
        x: viewport.width,
        y: viewport.height,
        duration: 1,
      }).to(
        groupRefArray.current[selectedIndex]!.position,
        { x: 0, y: 0, duration: 1 },
        '<',
      );

      projectsAtTheBottomRef.current.forEach((element) => {
        tl.to(element.position, { y: -viewport.height }, '<');
      });
      projectsAtTheTopRef.current.forEach((element) => {
        tl.to(
          element.position,
          {
            y: viewport.height,
          },
          '<',
        );
      });
    } else {
      if (!projectSelectedCoords) return;
      const centerX =
        projectSelectedCoords.left + projectSelectedCoords.width / 2;
      const centerY =
        projectSelectedCoords.top + projectSelectedCoords.height / 2;
      const worldX = (centerX / size.width - 0.5) * viewport.width;
      const worldY = -(centerY / size.height - 0.5) * viewport.height;
      const worldW =
        (projectSelectedCoords.width / size.width) * viewport.width;
      const worldH =
        (projectSelectedCoords.height / size.height) * viewport.height;
      const reverseTl = gsap.timeline({
        onComplete: () => {
          setSelectedIndex(null);
          setSettledIndex(null);
          setIsReturning(false);
          // sessionStorage.removeItem('fromWorkList');
          clearFlag();
        },
      });
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
          },
          '<',
        );

      if (fromWorkList) {
        projectsAtTheBottomRef.current.forEach((element, i) => {
          reverseTl.to(
            element.position,
            {
              y: projectsAtTheBottom.current[element.uuid],
              // onComplete: () => {
              //   sessionStorage.removeItem('fromWorkList');
              // },
            },
            '<',
          );
        });

        projectsAtTheTopRef.current.forEach((element) => {
          reverseTl.to(
            element.position,
            {
              y: projectsAtTheTop.current[element.uuid],
            },
            '<',
          );
        });
      } else {
        projectsAtTheBottomRef.current.forEach((element) => {
          reverseTl.to(
            element.position,
            {
              y:
                initCoords.current[element.uuid] +
                (scrollY! / size.height) * viewport.height,
              // onComplete: () => {
              //   setSelectedIndex(null);
              //   setSettledIndex(null);
              //   setIsReturning(false);
              // },
            },
            '<',
          );
        });
        projectsAtTheTopRef.current.forEach((element) => {
          reverseTl.to(
            element.position,
            {
              y:
                initCoords.current[element.uuid] +
                (scrollY! / size.height) * viewport.height,
            },
            '<',
          );
        });
      }
    }
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
          position={
            selectedIndex === i && workPath
              ? [0.0, 0.0, 0]
              : [worldX, worldY, 0]
          }
          scale={[worldW, worldH, 1]}
          ref={(el) => {
            groupRefArray.current[i] = el;
          }}
        >
          <Plane imageUrl={imageUrl} isSelected={settledIndex === i} />
        </group>
      );
    });
  }
};

export default Scene;
