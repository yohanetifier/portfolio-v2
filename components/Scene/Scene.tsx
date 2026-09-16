'use client';

import { ProjectItem, useThreeJsContext } from '@/contexts/ThreeJsContext';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Plane from '../Plane/Plane';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { getPositions } from '../WorkList/utils/getPositions';
import { useHeaderContext } from '@/contexts/HeaderContext';
import { usePathname } from 'next/navigation';
import { getProjectPath } from '@/utils/getProjectPath';
import { clearFlag, getFlag } from '@/utils/fromWorkList';
import { useRouter } from 'next/navigation';
import { lockScroll, unlockScroll } from '@/utils/scroll';

type Props = {
  projectsDetails: ProjectItem[];
};

const Scene = ({ projectsDetails }: Props) => {
  const { viewport, size } = useThree();
  const {
    selectedIndex,
    setSelectedIndex,
    projectSelectedCoords,
    scrollY,
    fromHome,
    projectsCoords,
    setFromHome,
    setReturnHome,
    returnHome,
    goToContact,
    setGoToContact,
    goToWork,
    setGoToWork,
    goToProject,
    setGoToProject,
    fromProjectIndex,
    fromProjectSlug,
    setFromProjectSlug,
    setFromProjectIndex,
    projectsHomeCoords,
    projectsContactCoords,
    setSelectedSlug,
    setIsAnimating,
    setProjects,
    hoveredIndex,
    mouseCoords,
    fromWorkPage,
    setFromWorkPage,
  } = useThreeJsContext();

  const [settledIndex, setSettledIndex] = useState<number | null>();
  const { isReturning, setIsReturning, reset, setReset } = useHeaderContext();
  const workPath = getProjectPath(usePathname());
  const activeIndex =
    selectedIndex !== null
      ? selectedIndex
      : fromWorkPage >= 0
        ? fromWorkPage
        : null;
  /** Laisse GSAP piloter sans reset React (projet ↔ contact) */
  const gsapOwnsPose = Boolean(
    goToProject || (goToContact && workPath),
  );
  const initCoords = useRef<Record<string, number>>({});
  const groupRefArray = useRef<(THREE.Group | null)[]>([]);
  const projectsAtTheBottom = useRef<Record<string, number>>({});
  const projectsAtTheTop = useRef<Record<string, number>>({});
  const projectsAtTheBottomRef = useRef<THREE.Group[]>([]);
  const projectsAtTheTopRef = useRef<THREE.Group[]>([]);
  const router = useRouter();

  useLayoutEffect(() => {
    const fromWorkList = getFlag();
    if (fromHome) {
      const homeTl = gsap.timeline({
        onStart: () => {
          lockScroll();
        },
        onComplete: () => {
          router.push(`/work`, { scroll: false });
          setFromHome(false);
          setIsAnimating(false);
          unlockScroll();
        },
      });
      projectsCoords?.map(({ rects }, i) => {
        const group = groupRefArray.current[i];
        if (!group) return;
        const centerX = rects.left + rects.width / 2;
        const centerY = rects.top + rects.height / 2;
        const worldX = (centerX / size.width - 0.5) * viewport.width;
        const worldY = -(centerY / size.height - 0.5) * viewport.height;
        const worldW = (rects.width / size.width) * viewport.width;
        const worldH = (rects.height / size.height) * viewport.height;

        homeTl
          .to(group.position, { y: worldY, x: worldX, duration: 1 }, '<')
          .to(group.scale, { x: worldW, y: worldH, duration: 1 }, '<');
      });
    }

    if (returnHome) {
      const returnHomeTl = gsap.timeline({
        onStart: () => {
          lockScroll();
        },
        onComplete: () => {
          setSelectedIndex(null);
          setSettledIndex(null);
          setSelectedSlug('');
          setFromWorkPage(-1);
          setFromProjectSlug(null);
          setFromProjectIndex(-1);
          setReturnHome(false);
          router.push(`/`, { scroll: false });
          setIsAnimating(false);
          unlockScroll();
        },
      });

      returnHomeTl.to(
        document.body,
        { backgroundColor: '#ffffff', duration: 1, ease: 'power2.inOut' },
        0,
      );

      const returningIndex = activeIndex;
      const itemsNotOnTheIntroPage =
        returningIndex !== null &&
        returningIndex > (projectsHomeCoords?.length ?? 0) - 1;

      projectsHomeCoords?.map(({ rects }, i) => {
        const group = groupRefArray.current[i];
        if (!group) return;
        const centerX = rects.left + rects.width / 2;
        const centerY = rects.top + rects.height / 2;
        const worldX = (centerX / size.width - 0.5) * viewport.width;
        const worldY = -(centerY / size.height - 0.5) * viewport.height;
        const worldW = (rects.width / size.width) * viewport.width;
        const worldH = (rects.height / size.height) * viewport.height;
        if (itemsNotOnTheIntroPage && returningIndex !== null) {
          const selectedGroup = groupRefArray.current[returningIndex];
          returnHomeTl
            .to(group.position, { y: worldY, x: worldX, duration: 1 }, '<')
            .to(group.scale, { x: worldW, y: worldH, duration: 1 }, '<');
          if (selectedGroup) {
            returnHomeTl
              .to(selectedGroup.position, { y: 0, x: 0, duration: 1 }, '<')
              .to(selectedGroup.scale, { x: 0, y: 0, duration: 1 }, '<');
          }
        } else {
          returnHomeTl
            .to(group.position, { y: worldY, x: worldX, duration: 1 }, '<')
            .to(group.scale, { x: worldW, y: worldH, duration: 1 }, '<');
        }
      });
      return;
    }

    if (goToContact) {
      if (!projectsContactCoords?.length) {
        setGoToContact(false);
        setIsAnimating(false);
        router.push('/contact', { scroll: false });
        return;
      }

      const contactTl = gsap.timeline({
        onStart: () => {
          lockScroll();
        },
        onComplete: () => {
          if (projectsContactCoords?.length) {
            setProjects(projectsContactCoords);
          }
          setGoToContact(false);
          setSelectedIndex(null);
          setSettledIndex(null);
          setIsAnimating(false);
          router.push('/contact', { scroll: false });
          unlockScroll();
        },
      });

      contactTl.to(
        document.body,
        { backgroundColor: '#f4f3f0', duration: 1, ease: 'power2.inOut' },
        0,
      );

      // Depuis une page projet : repartir du fullscreen + hors champ haut/bas
      // (même logique que le retour projet → worklist)
      const leavingProject = Boolean(workPath) || fromProjectIndex >= 0;
      const selected =
        fromProjectIndex >= 0 ? fromProjectIndex : selectedIndex;

      if (leavingProject && selected !== null) {
        const selectedGroup = groupRefArray.current[selected];

        // Recalcule haut/bas si les refs ont été perdues
        if (
          selectedGroup &&
          projectsAtTheBottomRef.current.length === 0 &&
          projectsAtTheTopRef.current.length === 0
        ) {
          const others = groupRefArray.current
            .map((el, i) => (i !== selected ? el : null))
            .filter((el): el is THREE.Group => el !== null);
          const { childAtTheBottom, childAtTheTop } = getPositions(
            others,
            selectedGroup,
          );
          projectsAtTheBottomRef.current = childAtTheBottom;
          projectsAtTheTopRef.current = childAtTheTop;
        }

        groupRefArray.current.forEach((group, i) => {
          if (!group) return;
          if (i === selected) {
            gsap.set(group.position, { x: 0, y: 0 });
            gsap.set(group.scale, {
              x: viewport.width,
              y: viewport.height,
            });
          } else {
            const isBottom = projectsAtTheBottomRef.current.includes(group);
            gsap.set(group.position, {
              y: isBottom ? -viewport.height : viewport.height,
            });
          }
        });
      }

      projectsContactCoords.forEach(({ rects }, i) => {
        const group = groupRefArray.current[i];
        if (!group) return;
        const centerX = rects.left + rects.width / 2;
        const centerY = rects.top + rects.height / 2;
        const worldX = (centerX / size.width - 0.5) * viewport.width;
        const worldY = -(centerY / size.height - 0.5) * viewport.height;
        const worldW = (rects.width / size.width) * viewport.width;
        const worldH = (rects.height / size.height) * viewport.height;

        contactTl
          .to(group.position, { y: worldY, x: worldX, duration: 1 }, '<')
          .to(group.scale, { x: worldW, y: worldH, duration: 1 }, '<');
      });
      return;
    }

    if (goToProject) {
      const projectIndex = fromProjectIndex;
      const slug = fromProjectSlug;
      if (projectIndex < 0 || !slug) {
        setGoToProject(false);
        setIsAnimating(false);
        return;
      }

      const projectTl = gsap.timeline({
        onStart: () => {
          lockScroll();
        },
        onComplete: () => {
          setSettledIndex(projectIndex);
          setSelectedIndex(projectIndex);
          setGoToProject(false);
          setIsAnimating(false);
          setFromProjectSlug(null);
          setFromProjectIndex(-1);
          router.push(`/work/${slug}`, { scroll: false });
          unlockScroll();
        },
      });

      projectTl.to(
        document.body,
        { backgroundColor: '#ffffff', duration: 1, ease: 'power2.inOut' },
        0,
      );

      const selectedGroup = groupRefArray.current[projectIndex];
      groupRefArray.current.forEach((group, i) => {
        if (!group) return;
        if (i === projectIndex) {
          projectTl
            .to(group.position, { x: 0, y: 0, duration: 1 }, '<')
            .to(
              group.scale,
              { x: viewport.width, y: viewport.height, duration: 1 },
              '<',
            );
        } else {
          const goUp =
            selectedGroup != null && group.position.y >= selectedGroup.position.y;
          projectTl.to(
            group.position,
            {
              y: goUp ? viewport.height : -viewport.height,
              duration: 1,
            },
            '<',
          );
        }
      });
      return;
    }

    if (goToWork) {
      if (!projectsCoords?.length) {
        setGoToWork(false);
        setIsAnimating(false);
        router.push('/work', { scroll: false });
        return;
      }

      const workTl = gsap.timeline({
        onStart: () => {
          lockScroll();
        },
        onComplete: () => {
          // Aligne projectsDetails sur la worklist avant le push
          if (projectsCoords?.length) {
            setProjects(
              projectsCoords.map((item, i) => ({
                rects: item.rects,
                imageUrl:
                  projectsDetails[i]?.imageUrl ??
                  projectsContactCoords?.[i]?.imageUrl ??
                  '',
              })),
            );
          }
          setGoToWork(false);
          setFromProjectSlug(null);
          setFromProjectIndex(-1);
          setIsAnimating(false);
          router.push('/work', { scroll: false });
          unlockScroll();
        },
      });

      workTl.to(
        document.body,
        { backgroundColor: '#ffffff', duration: 1, ease: 'power2.inOut' },
        0,
      );

      projectsCoords.forEach(({ rects }, i) => {
        const group = groupRefArray.current[i];
        if (!group) return;
        const centerX = rects.left + rects.width / 2;
        const centerY = rects.top + rects.height / 2;
        const worldX = (centerX / size.width - 0.5) * viewport.width;
        const worldY = -(centerY / size.height - 0.5) * viewport.height;
        const worldW = (rects.width / size.width) * viewport.width;
        const worldH = (rects.height / size.height) * viewport.height;

        workTl
          .to(group.position, { y: worldY, x: worldX, duration: 1 }, '<')
          .to(group.scale, { x: worldW, y: worldH, duration: 1 }, '<');
      });
      return;
    }

    if (reset) {
      setSelectedIndex(null);
      setSettledIndex(null);
      setIsReturning(false);
      setReset(false);
    }
    if (selectedIndex === null) return;
    const tl = gsap.timeline({
      onStart: () => {
        lockScroll();
      },
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
        const groupRefArrayFilter = groupRefArray.current
          .map((el, i) => (i !== selectedIndex ? el : null))
          .filter((el): el is THREE.Group => el !== null);

        if (!fromWorkList) {
          groupRefArrayFilter.forEach((element) => {
            initCoords.current[element.uuid] = element.position.y;
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
        const groups = groupRefArray.current.filter(
          (el): el is THREE.Group => el !== null,
        );
        const selectedGroup = groupRefArray.current[selectedIndex];
        if (!selectedGroup) return;
        const { childAtTheBottom, childAtTheTop } = getPositions(
          groups,
          selectedGroup,
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

      if (returnHome) {
      } else {
        tl.to(groupRefArray.current[selectedIndex]!.scale, {
          x: viewport.width,
          y: viewport.height,
          duration: 1,
        }).to(
          groupRefArray.current[selectedIndex]!.position,
          { x: 0, y: 0, duration: 1 },
          '<',
        );
      }

      projectsAtTheBottomRef.current.forEach((element) => {
        tl.to(element.position, { y: -viewport.height, duration: 1 }, '<');
      });
      projectsAtTheTopRef.current.forEach((element) => {
        tl.to(
          element.position,
          {
            y: viewport.height,
            duration: 1,
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
          setIsAnimating(false);
          clearFlag();
        },
      });
      reverseTl
        .to(groupRefArray.current[selectedIndex]!.position, {
          x: worldX,
          y: worldY,
          duration: 1,
        })
        .to(
          groupRefArray.current[selectedIndex]!.scale,
          {
            x: worldW,
            y: worldH,
            duration: 1,
          },
          '<',
        );

      if (fromWorkList) {
        projectsAtTheBottomRef.current.forEach((element, i) => {
          reverseTl.to(
            element.position,
            {
              y: projectsAtTheBottom.current[element.uuid],
              duration: 1,
            },
            '<',
          );
        });

        projectsAtTheTopRef.current.forEach((element) => {
          reverseTl.to(
            element.position,
            {
              y: projectsAtTheTop.current[element.uuid],
              duration: 1,
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
              duration: 1,
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
              duration: 1,
            },
            '<',
          );
        });
      }
    }
  }, [selectedIndex, isReturning, reset, fromHome, returnHome, goToContact, goToWork, goToProject, fromWorkPage]);

  if (projectsDetails.length > 0) {
    return projectsDetails.map(({ rects, imageUrl }, i) => {
      const centerX = rects.left + rects.width / 2;
      const centerY = rects.top + rects.height / 2;
      const worldX = (centerX / size.width - 0.5) * viewport.width;
      const worldY = -(centerY / size.height - 0.5) * viewport.height;
      const worldW = (rects.width / size.width) * viewport.width;
      const worldH = (rects.height / size.height) * viewport.height;
      const group = groupRefArray.current[i];
      const isBottom = projectsAtTheBottomRef.current.includes(group!);

      return (
        <group
          key={i}
          {...(gsapOwnsPose
            ? {}
            : {
                position: (activeIndex === i && workPath
                  ? [0.0, 0.0, 0]
                  : workPath &&
                      activeIndex !== null &&
                      i !== activeIndex
                    ? isBottom
                      ? [0, -viewport.height, 0]
                      : [0, viewport.height, 0]
                    : [worldX, worldY, 0]) as [number, number, number],
                scale: [worldW, worldH, 1] as [number, number, number],
              })}
          ref={(el) => {
            groupRefArray.current[i] = el;
          }}
        >
          <Plane
            imageUrl={imageUrl}
            isSelected={settledIndex === i}
            isHovered={hoveredIndex === i}
            isProjectView={activeIndex === i && Boolean(workPath)}
          />
        </group>
      );
    });
  }
};

export default Scene;
