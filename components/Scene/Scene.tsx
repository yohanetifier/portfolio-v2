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

type Props = {
  projectsDetails: ProjectItem[];
};

const Scene = ({ projectsDetails }: Props) => {
  const { viewport, size } = useThree();
  // const groupRefArray = useRef<(THREE.Group | null)[]>([]);
  const {
    selectedIndex,
    setSelectedIndex,
    projectSelectedCoords,
    scrollY,
    projectsAtTheBottom,
    projectsAtTheTop,
    projectsAtTheBottomRef,
    projectsAtTheTopRef,
    groupRefArray,
  } = useThreeJsContext();
  const [settledIndex, setSettledIndex] = useState<number | null>();
  const { isReturning, setIsReturning, reset, setReset } = useHeaderContext();
  const workPath = getProjectPath(usePathname());

  useEffect(() => {
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
      window.scrollTo(0, scrollY!);

      // if (projectSelectedCoords) {
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

      projectsDetails.forEach(({ rects }, i) => {
        if (i === selectedIndex) return;
        const centerY = rects.top + rects.height / 2;
        const worldY = -(centerY / size.height - 0.5) * viewport.height;
        console.log('projectAtTheBottom', projectsAtTheBottom.current);
        console.log('projectAtTheTop', projectsAtTheTop.current);
        console.log('worldY', worldY);
        reverseTl.to(
          groupRefArray.current[i]?.position,
          {
            y: worldY,
          },
          '<',
        );
      });

      // projectsAtTheTopRef.current.forEach((el) => {
      //   const i = groupRefArray.current.indexOf(el);
      //   // worldY depuis projectsDetails[i]
      //   reverseTl.to(el.position, { y: worldY }, '<');
      // });

      // projectsAtTheBottomRef.current.forEach((element, i) => {
      //   console.log(
      //     'projectsAtTheBottom.current[element.uuid]',
      //     projectsAtTheBottom.current[element.uuid],
      //   );
      //   reverseTl.to(
      //     element.position,
      //     {
      //       y: projectsAtTheBottom.current[element.uuid],
      //       onComplete: () => {
      //         setSelectedIndex(null);
      //         setSettledIndex(null);
      //         setIsReturning(false);
      //       },
      //     },
      //     '<',
      //   );
      // });

      // projectsAtTheTopRef.current.forEach((element, i) => {
      //   reverseTl.to(
      //     element.position,
      //     {
      //       y: projectsAtTheTop.current[element.uuid],
      //     },
      //     '<',
      //   );
      // });

      // reverseTl.to(childAtTheBottom[0].position, {
      //   y: bottomprojects['element-0'],
      // });

      // } else {
      //   window.scrollTo(0, scrollY!);
      //   const projectSelected = projectsDetails[selectedIndex];
      //   const centerX =
      //     projectSelected.rects.left + projectSelected.rects.width / 2;
      //   const centerY =
      //     projectSelected.rects.top + projectSelected.rects.height / 2;
      //   const worldX = (centerX / size.width - 0.5) * viewport.width;
      //   const worldY = -(centerY / size.height - 0.5) * viewport.height;
      //   const worldW =
      //     (projectSelected.rects.width / size.width) * viewport.width;
      //   const worldH =
      //     (projectSelected.rects.height / size.height) * viewport.height;
      //   const reverseTl = gsap.timeline();
      //   reverseTl
      //     .to(groupRefArray.current[selectedIndex]!.position, {
      //       x: worldX,
      //       y: worldY,
      //     })
      //     .to(
      //       groupRefArray.current[selectedIndex]!.scale,
      //       {
      //         x: worldW,
      //         y: worldH,
      //         onComplete: () => {
      //           setSelectedIndex(null);
      //           setSettledIndex(null);
      //           setIsReturning(false);
      //           // setSettledIndex(null);
      //         },
      //       },
      //       '<',
      //     );

      // }
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
          // visible={selectedIndex === null || selectedIndex === i}
          key={i}
          // position={selectedIndex === i ? [0.0, 0.0, 0.0] : [worldX, worldY, 0]}
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
  // else {
  //   return (
  //     <group position={[0, 0, 0]} scale={[viewport.width, viewport.height, 1]}>
  //       <Plane imageUrl={projectImageSelected} isSelected={true} />
  //     </group>
  //   );
  // }
};

export default Scene;
