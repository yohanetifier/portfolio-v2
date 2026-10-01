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
import { INTRO } from '@/utils/introTiming';
import { PAPER } from '@/utils/theme';

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
    isLostPage,
    introReady,
  } = useThreeJsContext();

  const [settledIndex, setSettledIndex] = useState<number | null>();
  /** GSAP scale/opacity intro home — empêche React d’écraser le stagger */
  const [introOwnsPose, setIntroOwnsPose] = useState(false);
  /** true après intro jouée (ou skip si pas sur home au wipe) */
  const [introRevealed, setIntroRevealed] = useState(false);
  const introPlayedRef = useRef(false);
  const { isReturning, setIsReturning, reset, setReset } = useHeaderContext();
  const pathname = usePathname();
  const workPath = getProjectPath(pathname);
  const onHome = pathname === '/';
  /** Home : wrecks invisibles jusqu’à la fin du stagger intro */
  const awaitingHomeIntro = onHome && !introRevealed;
  // /work/SlugInvalide → notFound() garde l’URL projet, mais isLostPage = vraie 404.
  // Sinon Scene traite ça comme un projet (centre fullscreen) au lieu des épaves.
  const onProjectPage = Boolean(workPath) && !isLostPage;
  const activeIndex =
    selectedIndex !== null
      ? selectedIndex
      : fromWorkPage >= 0
        ? fromWorkPage
        : null;
  // Après scroll contact→works : coords live du selected (pas phantoms hors viewport)
  const contactGridReady = Boolean(
    selectedIndex !== null &&
      projectSelectedCoords &&
      ((scrollY ?? 0) <= 0 || projectSelectedCoords.top < size.height * 0.55),
  );
  const initCoords = useRef<Record<string, number>>({});
  const groupRefArray = useRef<(THREE.Group | null)[]>([]);
  const projectsAtTheBottom = useRef<Record<string, number>>({});
  const projectsAtTheTop = useRef<Record<string, number>>({});
  const projectsAtTheBottomRef = useRef<THREE.Group[]>([]);
  const projectsAtTheTopRef = useRef<THREE.Group[]>([]);
  /** Cibles worklist par index — contact→projet→works (indépendant des Group uuid) */
  const worklistRestoreByIndexRef = useRef<
    ({
      x: number;
      y: number;
      sx: number;
      sy: number;
      fromTop: boolean;
    } | null)[]
  >([]);
  // Contact/404→works (!fromWorkList) : garder le hero sans omettre les props R3F
  const isContactReturnPose =
    isReturning &&
    !getFlag() &&
    worklistRestoreByIndexRef.current.some(Boolean);
  /**
   * GSAP owns pose ONLY quand React poserait le mauvais départ
   * (page projet = fullscreen, projectsDetails = petite grille).
   */
  const gsapOwnsPose = Boolean(
    goToProject ||
      (returnHome && onProjectPage) ||
      (goToContact && onProjectPage) ||
      isContactReturnPose ||
      introOwnsPose,
  );
  const router = useRouter();

  // Intro Awards : scale + fade stagger au wipe (one-shot, sync titres)
  useLayoutEffect(() => {
    if (!introReady || introPlayedRef.current) return;
    introPlayedRef.current = true;

    // Loader fini ailleurs que home → pas d’intro wrecks
    if (!onHome) {
      setIntroRevealed(true);
      return;
    }
    if (!projectsDetails.length) {
      introPlayedRef.current = false;
      return;
    }

    const groups = groupRefArray.current;
    const ready = projectsDetails.every((_, i) => groups[i]);
    if (!ready) {
      introPlayedRef.current = false;
      return;
    }

    setIntroOwnsPose(true);

    const tl = gsap.timeline({
      onComplete: () => {
        setIntroOwnsPose(false);
        setIntroRevealed(true);
      },
    });

    projectsDetails.forEach(({ rects }, i) => {
      const group = groups[i];
      if (!group) return;

      const worldW = (rects.width / size.width) * viewport.width;
      const worldH = (rects.height / size.height) * viewport.height;
      const mesh = group.children[0] as THREE.Mesh | undefined;
      const mat = mesh?.material as THREE.ShaderMaterial | undefined;
      const opacityUniform = mat?.uniforms?.uOpacity;

      gsap.set(group.scale, { x: 0, y: 0, z: 1 });
      if (opacityUniform) gsap.set(opacityUniform, { value: 0 });

      const at = INTRO.wrecksDelay + i * INTRO.wrecksStagger;
      tl.to(
        group.scale,
        {
          x: worldW,
          y: worldH,
          duration: INTRO.wrecksDuration,
          ease: INTRO.wrecksEase,
        },
        at,
      );
      if (opacityUniform) {
        tl.to(
          opacityUniform,
          {
            value: 1,
            duration: INTRO.wrecksDuration,
            ease: INTRO.wrecksEase,
          },
          at,
        );
      }
    });

    return () => {
      tl.kill();
    };
  }, [
    introReady,
    onHome,
    projectsDetails,
    size.width,
    size.height,
    viewport.width,
    viewport.height,
  ]);

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
          // Unlock avant setState : le cleanup (cancelled=true) tourne juste après
          unlockScroll();
          setSelectedIndex(null);
          setSettledIndex(null);
          setSelectedSlug('');
          setFromWorkPage(-1);
          setFromProjectSlug(null);
          setFromProjectIndex(-1);
          setReturnHome(false);
          router.push(`/`, { scroll: false });
          requestAnimationFrame(() => {
            setIsAnimating(false);
          });
        },
      });

      returnHomeTl.to(
        document.body,
        { backgroundColor: PAPER, duration: 1, ease: 'power2.inOut' },
        0,
      );

      const returningIndex = activeIndex;
      const leavingProject = onProjectPage && returningIndex !== null;

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
              x: 0,
              y: isBottom ? -viewport.height : viewport.height,
            });
          }
        });
      }
      // 404 / worklist → home : React garde projectsDetails (épaves / grille)

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
          unlockScroll();
          router.replace('/contact', { scroll: false });
          setGoToContact(false);
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
        { backgroundColor: PAPER, duration: 1, ease: 'power2.inOut' },
        0,
      );

      // Depuis une page projet uniquement (pas une 404 sous /work/…)
      const leavingProject = onProjectPage;
      const selected = fromProjectIndex >= 0 ? fromProjectIndex : selectedIndex;

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

      // Mémoriser la grille works pour le reverse (contact/404→projet→works)
      const restoreGrid = projectsCoords?.length
        ? projectsCoords
        : projectsDetails;
      const selectedRestoreRects =
        projectSelectedCoords ?? restoreGrid[projectIndex]?.rects ?? null;
      const selectedRestoreY = selectedRestoreRects
        ? -(
            (selectedRestoreRects.top + selectedRestoreRects.height / 2) /
              size.height -
            0.5
          ) * viewport.height
        : 0;
      worklistRestoreByIndexRef.current = restoreGrid.map((item) => {
        const rects = item.rects;
        if (!rects) return null;
        const cX = rects.left + rects.width / 2;
        const cY = rects.top + rects.height / 2;
        const wY = -(cY / size.height - 0.5) * viewport.height;
        return {
          x: (cX / size.width - 0.5) * viewport.width,
          y: wY,
          sx: (rects.width / size.width) * viewport.width,
          sy: (rects.height / size.height) * viewport.height,
          fromTop: wY > selectedRestoreY,
        };
      });

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
        { backgroundColor: PAPER, duration: 1, ease: 'power2.inOut' },
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
          // Sortie haut/bas alignée sur la future case works (pas la grille contact)
          const restore = worklistRestoreByIndexRef.current[i];
          const fromTop =
            restore?.fromTop ?? !projectsAtTheBottomRef.current.includes(group);
          projectTl.to(
            group.position,
            {
              y: fromTop ? viewport.height : -viewport.height,
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
          unlockScroll();
          setSelectedIndex(null);
          setSettledIndex(null);
          setFromWorkPage(-1);
          setGoToWork(false);
          setFromProjectSlug(null);
          setFromProjectIndex(-1);
          clearFlag();
          router.push('/work', { scroll: false });
          requestAnimationFrame(() => {
            setIsAnimating(false);
          });
        },
      });

      workTl.to(
        document.body,
        { backgroundColor: PAPER, duration: 1, ease: 'power2.inOut' },
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
    if (!groupRefArray.current?.[selectedIndex]) return;

    // Reverse AVANT de créer la timeline forward (sinon tl vide → setSettledIndex
    // immédiat → Plane re-push /work/[slug] = Projets qui “ne marche pas”)
    if (isReturning) {
      const fromWorkList = getFlag();
      // Contact only — ne pas polluer works↔project avec un restore stale
      const isContactReturn =
        !fromWorkList && worklistRestoreByIndexRef.current.some(Boolean);

      // Attendre /work + grille live après scroll (pas les phantoms hors viewport)
      if (isContactReturn) {
        if (workPath) return;
        if (!contactGridReady) return;
      }

      // Même cible que works→projet→works (coords live après scroll)
      const targetRects =
        projectSelectedCoords ?? projectsDetails[selectedIndex]?.rects ?? null;
      if (!targetRects) return;

      const centerX = targetRects.left + targetRects.width / 2;
      const centerY = targetRects.top + targetRects.height / 2;
      const worldX = (centerX / size.width - 0.5) * viewport.width;
      const worldY = -(centerY / size.height - 0.5) * viewport.height;
      const worldW = (targetRects.width / size.width) * viewport.width;
      const worldH = (targetRects.height / size.height) * viewport.height;

      const selectedGroup = groupRefArray.current[selectedIndex]!;
      // Garantir le départ fullscreen (mesure WorkList a pu re-render entre-temps)
      if (isContactReturn) {
        gsap.set(selectedGroup.position, { x: 0, y: 0 });
        gsap.set(selectedGroup.scale, {
          x: viewport.width,
          y: viewport.height,
        });
      }

      const reverseTl = gsap.timeline({
        onStart: () => {
          lockScroll();
        },
        onComplete: () => {
          setSelectedIndex(null);
          setSettledIndex(null);
          setFromWorkPage(-1);
          setIsReturning(false);
          setIsAnimating(false);
          clearFlag();
          unlockScroll();
          worklistRestoreByIndexRef.current = [];
        },
      });
      reverseTl
        .to(selectedGroup.position, {
          x: worldX,
          y: worldY,
          duration: 1,
        })
        .to(
          selectedGroup.scale,
          {
            x: worldW,
            y: worldH,
            duration: 1,
          },
          '<',
        );

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
      } else if (isContactReturn) {
        worklistRestoreByIndexRef.current.forEach((pose, i) => {
          if (!pose || i === selectedIndex) return;
          const group = groupRefArray.current[i];
          if (!group) return;
          const live = projectsDetails[i]?.rects;
          const wX = live
            ? ((live.left + live.width / 2) / size.width - 0.5) * viewport.width
            : pose.x;
          const wY = live
            ? -((live.top + live.height / 2) / size.height - 0.5) *
              viewport.height
            : pose.y;
          const wW = live
            ? (live.width / size.width) * viewport.width
            : pose.sx;
          const wH = live
            ? (live.height / size.height) * viewport.height
            : pose.sy;
          gsap.set(group.scale, { x: wW, y: wH });
          gsap.set(group.position, {
            x: wX,
            y: pose.fromTop ? viewport.height : -viewport.height,
          });
          reverseTl.to(group.position, { x: wX, y: wY, duration: 1 }, '<');
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

    if (workPath) return;

    const tl = gsap.timeline({
      onStart: () => {
        lockScroll();
      },
      onComplete: () => {
        setSettledIndex(selectedIndex!);
      },
    });

    if (
      groupRefArray.current[selectedIndex].position.x === 0.0 &&
      groupRefArray.current[selectedIndex].position.y === 0.0 &&
      groupRefArray.current[selectedIndex].position.y === 0.0
    ) {
      const initItemSelected = projectsDetails[selectedIndex];
      if (!initItemSelected?.rects) return;
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
  }, [
    selectedIndex,
    isReturning,
    reset,
    fromHome,
    returnHome,
    goToContact,
    goToWork,
    goToProject,
    fromWorkPage,
    workPath,
    contactGridReady,
    projectsContactCoords?.length,
    projectsHomeCoords?.length,
    projectsCoords?.length,
  ]);

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
      // Entre fin GSAP (settledIndex) et arrivée /work/[slug] (onProjectPage),
      // React ne doit PAS réappliquer la grille — sinon décalage puis recentrage.
      // !isReturning : ne pas bloquer le reverse menu→projets.
      const holdHero =
        activeIndex === i &&
        (onProjectPage || (!isReturning && settledIndex === i));
      const holdOthersOff =
        activeIndex !== null &&
        i !== activeIndex &&
        (onProjectPage || (!isReturning && settledIndex != null));

      // gsapOwnsPose : NE PAS omettre position/scale — R3F reset sinon à
      // scale 1 au centre (flash « petit au milieu » pendant le return contact).
      const gsapPosition: [number, number, number] = group
        ? [group.position.x, group.position.y, group.position.z]
        : activeIndex === i
          ? [0, 0, 0]
          : [worldX, worldY, 0];
      const gsapScale: [number, number, number] = group
        ? [group.scale.x, group.scale.y, group.scale.z]
        : activeIndex === i
          ? [viewport.width, viewport.height, 1]
          : [worldW, worldH, 1];

      return (
        <group
          key={i}
          {...(gsapOwnsPose
            ? {
                position: gsapPosition,
                scale: gsapScale,
              }
            : {
                position: (holdHero
                  ? [0.0, 0.0, 0]
                  : holdOthersOff
                    ? isBottom
                      ? [0, -viewport.height, 0]
                      : [0, viewport.height, 0]
                    : [worldX, worldY, 0]) as [number, number, number],
                scale: (awaitingHomeIntro
                  ? [0, 0, 1]
                  : holdHero
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
