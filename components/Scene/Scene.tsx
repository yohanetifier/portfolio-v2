'use client';

import { ProjectItem, useThreeJsContext } from '@/contexts/ThreeJsContext';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Plane from '../Plane/Plane';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { getPositions } from '../WorkList/utils/getPositions';
import { INTRO_VISIBLE_COUNT } from '../WorkList/utils/classes';
import { useHeaderContext } from '@/contexts/HeaderContext';
import { usePathname } from 'next/navigation';
import { getProjectPath } from '@/utils/getProjectPath';
import { clearFlag, getFlag } from '@/utils/fromWorkList';
import { useRouter } from 'next/navigation';
import { lockScroll, unlockScroll, getLenis } from '@/utils/scroll';

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
    selectedSlug,
    setIsAnimating,
    setProjects,
    hoveredIndex,
    mouseCoords,
    fromWorkPage,
    setFromWorkPage,
    setFromLostPage,
    fromLostPage,
    isLostPage,
    isAnimating,
  } = useThreeJsContext();

  const [settledIndex, setSettledIndex] = useState<number | null>();
  const { isReturning, setIsReturning, reset, setReset } = useHeaderContext();
  const pathname = usePathname();
  const workPath = getProjectPath(pathname);
  const activeIndex =
    selectedIndex !== null
      ? selectedIndex
      : fromWorkPage >= 0
        ? fromWorkPage
        : null;
  /**
   * GSAP owns pose SEULEMENT si React poserait le mauvais départ.
   * returnHome / goToContact / goToWork depuis 404|works : React garde les poses
   * (comme fromHome). Sinon 1 frame sans props → snap 0,0 → bug Yeti depuis 404.
   */
  const onProjectPage = Boolean(workPath) && !isLostPage;
  const gsapOwnsPose = Boolean(
    goToProject ||
      (returnHome && onProjectPage) ||
      (goToContact && onProjectPage) ||
      (goToWork && onProjectPage) ||
      (fromLostPage && (selectedIndex !== null || isReturning)),
  );
  const initCoords = useRef<Record<string, number>>({});
  const groupRefArray = useRef<(THREE.Group | null)[]>([]);
  const projectsAtTheBottom = useRef<Record<string, number>>({});
  const projectsAtTheTop = useRef<Record<string, number>>({});
  const projectsAtTheBottomRef = useRef<THREE.Group[]>([]);
  const projectsAtTheTopRef = useRef<THREE.Group[]>([]);
  const lostRemapDone = useRef(false);
  const router = useRouter();

  // Entrée 404 : oublier le settled d’un projet précédent
  useLayoutEffect(() => {
    if (!isLostPage) return;
    setSettledIndex(null);
    lostRemapDone.current = false;
  }, [isLostPage]);

  useLayoutEffect(() => {
    if (!fromLostPage) lostRemapDone.current = false;
  }, [fromLostPage]);

  /** Hors écran (±vh) : passer x/scale aux cibles works (invisible). */
  const remapOffscreenToWorks = (selIndex: number) => {
    if (!projectsCoords?.length || lostRemapDone.current) return;
    lostRemapDone.current = true;

    const selRects = projectsCoords[selIndex]?.rects;
    const selWorldY = selRects
      ? -(
          (selRects.top + selRects.height / 2) / size.height -
          0.5
        ) * viewport.height
      : 0;

    projectsAtTheBottomRef.current = [];
    projectsAtTheTopRef.current = [];

    projectsCoords.forEach(({ rects }, i) => {
      if (i === selIndex) return;
      const group = groupRefArray.current[i];
      if (!group || !rects) return;

      const cX = rects.left + rects.width / 2;
      const cY = rects.top + rects.height / 2;
      const tX = (cX / size.width - 0.5) * viewport.width;
      const tY = -(cY / size.height - 0.5) * viewport.height;
      const tW = (rects.width / size.width) * viewport.width;
      const tH = (rects.height / size.height) * viewport.height;
      const isAbove = tY > selWorldY;

      if (isAbove) {
        projectsAtTheTopRef.current.push(group);
        projectsAtTheTop.current[group.uuid] = tY;
        gsap.set(group.position, { x: tX, y: viewport.height });
      } else {
        projectsAtTheBottomRef.current.push(group);
        projectsAtTheBottom.current[group.uuid] = tY;
        gsap.set(group.position, { x: tX, y: -viewport.height });
      }
      gsap.set(group.scale, { x: tW, y: tH });
    });

    setProjects(
      projectsCoords.map((item, i) => ({
        rects: item.rects,
        imageUrl: projectsDetails[i]?.imageUrl ?? '',
      })),
    );
  };

  useLayoutEffect(() => {
    const fromWorkList = getFlag();
    if (fromHome) {
      const homeTl = gsap.timeline({
        onStart: () => {
          lockScroll();
        },
        onComplete: () => {
          if (projectsCoords?.length) {
            setProjects(
              projectsCoords.map((item, i) => ({
                rects: item.rects,
                imageUrl: projectsDetails[i]?.imageUrl ?? '',
              })),
            );
          }
          setFromHome(false);
          setIsAnimating(false);
          router.push(`/work`, { scroll: false });
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
      // Attendre les cibles intro
      if (!projectsHomeCoords?.length) {
        return;
      }

      let cancelled = false;
      const returnHomeTl = gsap.timeline({
        onStart: () => {
          lockScroll();
        },
        onComplete: () => {
          if (cancelled) return;
          if (projectsHomeCoords?.length) {
            setProjects(projectsHomeCoords);
          }
          setSelectedIndex(null);
          setSettledIndex(null);
          setSelectedSlug('');
          setFromWorkPage(-1);
          setFromProjectSlug(null);
          setFromProjectIndex(-1);
          setFromLostPage(false);
          setReturnHome(false);
          // Garder lockScroll — Home.lockScroll à l’arrivée (pas d’unlock sur la 404)
          router.push(`/`, { scroll: false });
          requestAnimationFrame(() => {
            window.scrollTo(0, 0);
            getLenis()?.scrollTo(0, { immediate: true });
            setIsAnimating(false);
          });
        },
      });

      returnHomeTl.to(
        document.body,
        { backgroundColor: '#ffffff', duration: 1, ease: 'power2.inOut' },
        0,
      );

      const returningIndex = activeIndex;
      const leavingProject = onProjectPage && returningIndex !== null;

      // 404 / works → home : React garde projectsDetails (comme fromHome). Pas de gsap.set
      // qui fight après un frame à 0,0.

      // Uniquement projet → home (React sinon = petite grille au centre)
      if (leavingProject) {
        projectsAtTheBottomRef.current = [];
        projectsAtTheTopRef.current = [];
        const selectedGroup = groupRefArray.current[returningIndex!];
        if (selectedGroup) {
          const others = groupRefArray.current
            .map((el, i) => (i !== returningIndex ? el : null))
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
          if (i === returningIndex) {
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

      const itemsNotOnTheIntroPage =
        returningIndex !== null &&
        returningIndex >= INTRO_VISIBLE_COUNT;

      // Cibles intro : visibles → poses fantômes ; hors intro → scale 0
      const homeCount = Math.max(
        projectsHomeCoords?.length ?? 0,
        groupRefArray.current.length,
      );
      for (let i = 0; i < homeCount; i++) {
        const group = groupRefArray.current[i];
        if (!group) continue;

        const homeItem = projectsHomeCoords?.[i];
        const hide =
          i >= INTRO_VISIBLE_COUNT ||
          (itemsNotOnTheIntroPage && i === returningIndex);

        if (hide || !homeItem?.rects) {
          returnHomeTl
            .to(group.position, { y: 0, x: 0, duration: 1 }, '<')
            .to(group.scale, { x: 0, y: 0, duration: 1 }, '<');
          continue;
        }

        const { rects } = homeItem;
        const centerX = rects.left + rects.width / 2;
        const centerY = rects.top + rects.height / 2;
        const worldX = (centerX / size.width - 0.5) * viewport.width;
        const worldY = -(centerY / size.height - 0.5) * viewport.height;
        const worldW = (rects.width / size.width) * viewport.width;
        const worldH = (rects.height / size.height) * viewport.height;

        returnHomeTl
          .to(group.position, { y: worldY, x: worldX, duration: 1 }, '<')
          .to(group.scale, { x: worldW, y: worldH, duration: 1 }, '<');
      }

      return () => {
        cancelled = true;
        returnHomeTl.kill();
      };
    }

    if (goToContact) {
      if (!projectsContactCoords?.length) {
        return;
      }

      let cancelled = false;
      const contactTl = gsap.timeline({
        onStart: () => {
          lockScroll();
        },
        onComplete: () => {
          if (cancelled) return;
          if (projectsContactCoords?.length) {
            setProjects(projectsContactCoords);
          }
          window.scrollTo(0, 0);
          getLenis()?.scrollTo(0, { immediate: true });
          unlockScroll();
          router.replace('/contact', { scroll: false });
          setGoToContact(false);
          setFromLostPage(false);
          setSelectedIndex(null);
          setSettledIndex(null);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setIsAnimating(false);
            });
          });
        },
      });

      contactTl.to(
        document.body,
        { backgroundColor: '#f4f3f0', duration: 1, ease: 'power2.inOut' },
        0,
      );

      // Depuis une page projet uniquement (pas 404 même si URL /work/xxx)
      const leavingProject = onProjectPage;
      const selected =
        fromProjectIndex >= 0 ? fromProjectIndex : selectedIndex;

      // 404 / works → contact : React garde projectsDetails (comme fromHome)

      if (leavingProject && selected !== null) {
        const selectedGroup = groupRefArray.current[selected];
        projectsAtTheBottomRef.current = [];
        projectsAtTheTopRef.current = [];
        if (selectedGroup) {
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
      // 404 / worklist → contact : React garde projectsDetails

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
          .to(
            group.position,
            { y: worldY, x: worldX, duration: 1, ease: 'power2.inOut' },
            '<',
          )
          .to(
            group.scale,
            { x: worldW, y: worldH, duration: 1, ease: 'power2.inOut' },
            '<',
          );
      });

      return () => {
        cancelled = true;
        contactTl.kill();
      };
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
          // Naviguer pendant que GSAP owns encore les poses (goToProject / isAnimating)
          router.push(`/work/${slug}`, { scroll: false });
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setGoToProject(false);
              setFromProjectSlug(null);
              setFromProjectIndex(-1);
              setIsAnimating(false);
              unlockScroll();
            });
          });
        },
      });

      projectTl.to(
        document.body,
        { backgroundColor: '#ffffff', duration: 1, ease: 'power2.inOut' },
        0,
      );

      // gsapOwnsPose droppe les props → re-ancrer depuis projectsDetails (404 / grille)
      projectsDetails.forEach(({ rects }, i) => {
        const group = groupRefArray.current[i];
        if (!group || !rects) return;
        const centerX = rects.left + rects.width / 2;
        const centerY = rects.top + rects.height / 2;
        const worldX = (centerX / size.width - 0.5) * viewport.width;
        const worldY = -(centerY / size.height - 0.5) * viewport.height;
        const worldW = (rects.width / size.width) * viewport.width;
        const worldH = (rects.height / size.height) * viewport.height;
        gsap.set(group.position, { x: worldX, y: worldY });
        gsap.set(group.scale, { x: worldW, y: worldH });
      });

      const selectedGroup = groupRefArray.current[projectIndex];
      projectsAtTheBottomRef.current = [];
      projectsAtTheTopRef.current = [];
      if (selectedGroup) {
        const others = groupRefArray.current
          .map((el, i) => (i !== projectIndex ? el : null))
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
        if (i === projectIndex) {
          projectTl
            .to(group.position, { x: 0, y: 0, duration: 1 }, '<')
            .to(
              group.scale,
              { x: viewport.width, y: viewport.height, duration: 1 },
              '<',
            );
        } else {
          const isBottom = projectsAtTheBottomRef.current.includes(group);
          projectTl.to(
            group.position,
            {
              y: isBottom ? -viewport.height : viewport.height,
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
        return;
      }

      let cancelled = false;
      const workTl = gsap.timeline({
        onStart: () => {
          lockScroll();
        },
        onComplete: () => {
          if (cancelled) return;
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
          // Unlock avant setGoToWork(false) : sinon le cleanup met cancelled=true
          // et le rAF saute unlockScroll → scroll bloqué sur /work
          window.scrollTo(0, 0);
          getLenis()?.scrollTo(0, { immediate: true });
          unlockScroll();
          setGoToWork(false);
          setFromLostPage(false);
          setFromProjectSlug(null);
          setFromProjectIndex(-1);
          setSelectedIndex(null);
          setSettledIndex(null);
          setSelectedSlug('');
          clearFlag();
          router.push('/work', { scroll: false });
          requestAnimationFrame(() => {
            setIsAnimating(false);
          });
        },
      });

      workTl.to(
        document.body,
        { backgroundColor: '#ffffff', duration: 1, ease: 'power2.inOut' },
        0,
      );

      // Depuis page projet (ex. après 404→projet) : ancrer fullscreen / hors-écran
      const leavingProject = onProjectPage;
      const selected =
        fromProjectIndex >= 0 ? fromProjectIndex : selectedIndex;

      // 404 / contact → works : React garde projectsDetails

      if (leavingProject && selected !== null) {
        const selectedGroup = groupRefArray.current[selected];
        projectsAtTheBottomRef.current = [];
        projectsAtTheTopRef.current = [];
        if (selectedGroup) {
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

      return () => {
        cancelled = true;
        workTl.kill();
      };
    }

    if (reset) {
      setSelectedIndex(null);
      setSettledIndex(null);
      setIsReturning(false);
      setReset(false);
    }
    if (selectedIndex === null) return;
    // Déjà settled en fullscreen : ne pas relancer l’expand.
    // (NotFound clear settledIndex à l’entrée 404 → 2ᵉ visite OK)
    if (settledIndex === selectedIndex && !isReturning && !goToProject) {
      const settled = groupRefArray.current[selectedIndex];
      const alreadyFullscreen =
        settled &&
        Math.abs(settled.position.x) < 0.05 &&
        Math.abs(settled.position.y) < 0.05 &&
        Math.abs(settled.scale.x - viewport.width) < 0.5;
      if (alreadyFullscreen) return;
    }

    if (!groupRefArray.current?.[selectedIndex]) return;

    // --- Retour projet → worklist ---
    if (isReturning) {
      if (!projectSelectedCoords) {
        unlockScroll();
        setIsReturning(false);
        setFromLostPage(false);
        setIsAnimating(false);
        return;
      }
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
        onStart: () => {
          lockScroll();
        },
        onComplete: () => {
          if (fromLostPage && projectsCoords?.length) {
            setProjects(
              projectsCoords.map((item, i) => ({
                rects: item.rects,
                imageUrl: projectsDetails[i]?.imageUrl ?? '',
              })),
            );
          }
          setSelectedIndex(null);
          setSettledIndex(null);
          setIsReturning(false);
          setFromLostPage(false);
          setIsAnimating(false);
          clearFlag();
          unlockScroll();
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

      // 404 → projet → works : départ hors-écran du BON côté (haut↓ / bas↑)
      // worldY plus grand = plus haut à l’écran (même règle que getPositions)
      if (fromLostPage && projectsCoords?.length) {
        const selectedGroup = groupRefArray.current[selectedIndex];
        if (selectedGroup) {
          gsap.set(selectedGroup.position, { x: 0, y: 0 });
          gsap.set(selectedGroup.scale, {
            x: viewport.width,
            y: viewport.height,
          });
        }

        const selRects = projectsCoords[selectedIndex]?.rects;
        const selWorldY = selRects
          ? -(
              (selRects.top + selRects.height / 2) / size.height -
              0.5
            ) * viewport.height
          : 0;
        const scrollOffset =
          ((scrollY ?? 0) / size.height) * viewport.height;

        projectsAtTheBottomRef.current = [];
        projectsAtTheTopRef.current = [];

        projectsCoords.forEach(({ rects }, i) => {
          if (i === selectedIndex) return;
          const group = groupRefArray.current[i];
          if (!group || !rects) return;

          const cX = rects.left + rects.width / 2;
          const cY = rects.top + rects.height / 2;
          const tX = (cX / size.width - 0.5) * viewport.width;
          const tY =
            -(cY / size.height - 0.5) * viewport.height + scrollOffset;
          const tW = (rects.width / size.width) * viewport.width;
          const tH = (rects.height / size.height) * viewport.height;
          const isAbove = tY > selWorldY + scrollOffset;

          if (isAbove) {
            projectsAtTheTopRef.current.push(group);
            projectsAtTheTop.current[group.uuid] = tY;
            // Au-dessus de l’écran → redescend vers l’origine
            gsap.set(group.position, { x: tX, y: viewport.height });
          } else {
            projectsAtTheBottomRef.current.push(group);
            projectsAtTheBottom.current[group.uuid] = tY;
            // En-dessous → remonte vers l’origine
            gsap.set(group.position, { x: tX, y: -viewport.height });
          }
          gsap.set(group.scale, { x: tW, y: tH });

          reverseTl.to(group.position, { y: tY, duration: 1 }, '<');
        });
        return;
      }

      if (fromWorkList) {
        projectsAtTheBottomRef.current.forEach((element) => {
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
      return;
    }

    // --- Sélection worklist / 404 → projet (expand) ---
    // 404 : tailles épaves + envol haut/bas, PUIS hors écran → taille works
    // Nav = Plane après flatten (même timing que works / home→works).
    const comingFromLost = fromLostPage;
    const tl = gsap.timeline({
      onStart: () => {
        lockScroll();
      },
      onComplete: () => {
        setSettledIndex(selectedIndex!);
        if (comingFromLost) {
          remapOffscreenToWorks(selectedIndex!);
        }
      },
    });

    // Départ = poses 404 actuelles (épaves), pas works
    if (comingFromLost && projectsDetails.length) {
      projectsDetails.forEach(({ rects }, i) => {
        const group = groupRefArray.current[i];
        if (!group || !rects) return;
        const centerX = rects.left + rects.width / 2;
        const centerY = rects.top + rects.height / 2;
        const worldX = (centerX / size.width - 0.5) * viewport.width;
        const worldY = -(centerY / size.height - 0.5) * viewport.height;
        const worldW = (rects.width / size.width) * viewport.width;
        const worldH = (rects.height / size.height) * viewport.height;
        gsap.set(group.position, { x: worldX, y: worldY });
        gsap.set(group.scale, { x: worldW, y: worldH });
      });
    }

    {
      const selectedGroup = groupRefArray.current[selectedIndex];
      if (!selectedGroup) {
        tl.kill();
        return;
      }
      const groupRefArrayFilter = groupRefArray.current
        .map((el, i) => (i !== selectedIndex ? el : null))
        .filter((el): el is THREE.Group => el !== null);

      if (!fromWorkList && !comingFromLost) {
        groupRefArrayFilter.forEach((element) => {
          initCoords.current[element.uuid] = element.position.y;
        });
      }

      const { childAtTheBottom, childAtTheTop } = getPositions(
        groupRefArrayFilter,
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

    if (!returnHome) {
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

    // Envol haut/bas — taille 404 conservée jusqu’à hors écran
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
  }, [selectedIndex, selectedSlug, isReturning, reset, fromHome, returnHome, goToContact, goToWork, goToProject, fromWorkPage, fromLostPage, projectsContactCoords?.length, projectsHomeCoords?.length, projectsCoords?.length]);

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
                position: (activeIndex === i && onProjectPage
                  ? [0.0, 0.0, 0]
                  : onProjectPage &&
                      activeIndex !== null &&
                      i !== activeIndex
                    ? isBottom
                      ? [0, -viewport.height, 0]
                      : [0, viewport.height, 0]
                    : [worldX, worldY, 0]) as [number, number, number],
                // Sur page projet : fullscreen (sinon petit au centre sous le HTML → flash au retour)
                scale: (activeIndex === i && onProjectPage
                  ? [viewport.width, viewport.height, 1]
                  : [worldW, worldH, 1]) as [number, number, number],
              })}
          ref={(el) => {
            groupRefArray.current[i] = el;
          }}
        >
          <Plane
            imageUrl={imageUrl}
            isSelected={settledIndex === i}
            isHovered={hoveredIndex === i}
            isProjectView={activeIndex === i && onProjectPage}
          />
        </group>
      );
    });
  }
};

export default Scene;
