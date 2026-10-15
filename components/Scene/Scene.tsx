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
import { DECK_FAN, DECK_SHUFFLE, getDeckRotation } from '@/utils/deck';
import { LIST_EXIT, VIEW_SWITCH } from '@/utils/worksView';
import { getNextRect, measureTrack, nextProjectStore } from '@/utils/nextProject';

type Props = {
  projectsDetails: ProjectItem[];
};

/** Rect écran (px, DOM fantôme) → centre et taille en unités monde Three.js */
function rectToWorld(
  rects: ProjectItem['rects'],
  size: { width: number; height: number },
  viewport: { width: number; height: number },
) {
  return {
    x: ((rects.left + rects.width / 2) / size.width - 0.5) * viewport.width,
    y: -((rects.top + rects.height / 2) / size.height - 0.5) * viewport.height,
    w: (rects.width / size.width) * viewport.width,
    h: (rects.height / size.height) * viewport.height,
  };
}

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
    worksView,
    isViewSwitching,
    setIsViewSwitching,
  } = useThreeJsContext();

  const [settledIndex, setSettledIndex] = useState<number | null>();
  /** GSAP scale/opacity intro home — empêche React d’écraser le stagger */
  const [introOwnsPose, setIntroOwnsPose] = useState(false);
  /** true après intro jouée (ou skip si pas sur home au wipe) */
  const [introRevealed, setIntroRevealed] = useState(false);
  const introPlayedRef = useRef(false);
  /**
   * Animation de transition finie, en attente du changement de route : les drapeaux
   * (goToContact, goToWork, returnHome…) ne sont levés qu'une fois l'URL arrivée. Sinon, URL encore
   * l'ancienne, la page quittée se croit installée et renvoie sa grille au Scene
   * (ou React repose le hero) → les images y retournent avant de sauter en place.
   */
  const pendingRouteRef = useRef<(() => void) | null>(null);
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
      introOwnsPose ||
      isViewSwitching,
  );
  const router = useRouter();

  // Intro : les cartes tombent une par une sur le paquet au centre (one-shot, sync titres)
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

    // px écran → unités monde (même conversion que les rects)
    const pxToWorld = viewport.width / size.width;

    // Index croissant = du dessous vers le dessus : la dernière carte tombe en dernier, au-dessus
    projectsDetails.forEach(({ rects }, i) => {
      const group = groups[i];
      if (!group) return;

      const centerX = rects.left + rects.width / 2;
      const centerY = rects.top + rects.height / 2;
      const worldX = (centerX / size.width - 0.5) * viewport.width;
      const worldY = -(centerY / size.height - 0.5) * viewport.height;
      const worldW = (rects.width / size.width) * viewport.width;
      const worldH = (rects.height / size.height) * viewport.height;
      const rotation = getDeckRotation(i);
      const mesh = group.children[0] as THREE.Mesh | undefined;
      const mat = mesh?.material as THREE.ShaderMaterial | undefined;
      const opacityUniform = mat?.uniforms?.uOpacity;

      // Départ : au-dessus du paquet, un peu décalée et de travers, invisible
      gsap.set(group.position, {
        x:
          worldX +
          gsap.utils.random(-1, 1) * INTRO.deckDropSpreadPx * pxToWorld,
        y: worldY + viewport.height * INTRO.deckDropHeight,
      });
      gsap.set(group.rotation, {
        z: rotation + gsap.utils.random(-1, 1) * INTRO.deckDropTilt,
      });
      gsap.set(group.scale, { x: worldW, y: worldH, z: 1 });
      if (opacityUniform) gsap.set(opacityUniform, { value: 0 });

      const at = INTRO.deckDelay + i * INTRO.deckStagger;
      const drop = { duration: INTRO.deckDuration, ease: INTRO.deckEase };
      tl.to(group.position, { x: worldX, y: worldY, ...drop }, at).to(
        group.rotation,
        { z: rotation, ...drop },
        at,
      );
      if (opacityUniform) {
        tl.to(
          opacityUniform,
          { value: 1, duration: INTRO.deckFadeDuration, ease: 'power2.out' },
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

  // Paquet de l'intro : posé, au repos sur la Home (ni intro, ni départ vers Works)
  const isDeckIdle =
    onHome &&
    introRevealed &&
    !fromHome &&
    projectsDetails.length > 0 &&
    projectsDetails === projectsHomeCoords;
  /** Indices du dessous vers le dessus (dernier = carte visible) */
  const deckOrderRef = useRef<number[]>([]);
  /** Carte en cours de mélange : animée par GSAP, l'éventail ne la touche pas */
  const shufflingIndexRef = useRef<number | null>(null);
  /** v = ouverture 0 → 1, cx = position souris relative au paquet (-1 → 1) */
  const fanRef = useRef({ v: 0, target: 0, cx: 0 });
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    // Souris uniquement : au doigt, pas de survol donc pas d'éventail
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') {
        pointerRef.current = { x: e.clientX, y: e.clientY };
      }
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  // Paquet : toutes les 1,5 s, la carte du dessus glisse sur le côté et repasse dessous.
  // useLayoutEffect : nettoyé avant que la transition Home → Works ne prenne la main.
  useLayoutEffect(() => {
    if (!isDeckIdle) return;

    const groups = groupRefArray.current;
    const order = projectsDetails.map((_, i) => i);
    deckOrderRef.current = order;
    groups.forEach((group) => {
      if (group) group.renderOrder = 0;
    });
    if (reducedMotionRef.current) return;

    const pxToWorld = viewport.width / size.width;
    let tl: gsap.core.Timeline | null = null;

    const shuffle = () => {
      // Pas de mélange pendant que l'éventail est ouvert
      if (fanRef.current.target > 0) return;
      const top = order[order.length - 1];
      const group = groups[top];
      const rects = projectsDetails[top]?.rects;
      if (!group || !rects) return;

      const { x, y, w } = rectToWorld(rects, size, viewport);
      const { ease } = DECK_SHUFFLE;
      shufflingIndexRef.current = top;

      tl = gsap
        .timeline({
          onComplete: () => {
            shufflingIndexRef.current = null;
          },
        })
        .to(group.position, {
          x: x + w * DECK_SHUFFLE.outX,
          y: y + DECK_SHUFFLE.liftPx * pxToWorld,
          duration: DECK_SHUFFLE.outDuration,
          ease,
        })
        .to(
          group.rotation,
          {
            z: DECK_SHUFFLE.outRotation,
            duration: DECK_SHUFFLE.outDuration,
            ease,
          },
          '<',
        )
        .add(() => {
          // Hors du paquet : on la fait passer dessous (dessinée en premier)
          order.unshift(order.pop()!);
          order.forEach((cardNumber, index) => {
            const g = groups[cardNumber];
            if (g) g.renderOrder = index;
          });
        })
        .to(group.position, { x, y, duration: DECK_SHUFFLE.backDuration, ease })
        .to(
          group.rotation,
          {
            z: getDeckRotation(top),
            duration: DECK_SHUFFLE.backDuration,
            ease,
          },
          '<',
        );
    };

    const id = window.setInterval(shuffle, DECK_SHUFFLE.intervalMs);
    return () => {
      window.clearInterval(id);
      tl?.kill();
      shufflingIndexRef.current = null;
    };
    // Dimensions en primitives : un nouvel objet size/viewport ne relance pas le mélange
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isDeckIdle,
    projectsDetails,
    size.width,
    size.height,
    viewport.width,
    viewport.height,
  ]);

  // Éventail : chaque frame, ouverture lissée  selonle survol, puis pose de chaque carte
  useFrame((_, delta) => {
    const fan = fanRef.current;
    if (!isDeckIdle) {
      fan.v = 0;
      fan.target = 0;
      return;
    }

    const n = projectsDetails.length;
    // Carte du dessus dans le DOM fantôme (sans décalage) = centre du paquet
    const deck = projectsDetails[n - 1].rects;
    const centerX = deck.left + deck.width / 2;
    const centerY = deck.top + deck.height / 2;
    const pointer = pointerRef.current;
    const isNear =
      !reducedMotionRef.current &&
      pointer !== null &&
      Math.abs(pointer.x - centerX) < deck.width * DECK_FAN.hoverX &&
      Math.abs(pointer.y - centerY) < deck.height * DECK_FAN.hoverY;
    fan.target = isNear ? 1 : 0;

    // Lissage indépendant du nombre d'images par seconde (cf. dt du loader)
    const open = 1 - Math.pow(1 - DECK_FAN.openSmoothing, delta * 60);
    const follow = 1 - Math.pow(1 - DECK_FAN.poseSmoothing, delta * 60);
    if (pointer) {
      const cx = THREE.MathUtils.clamp(
        (pointer.x - centerX) / deck.width,
        -1,
        1,
      );
      fan.cx += (cx - fan.cx) * open;
    }
    fan.v += (fan.target - fan.v) * open;

    const radius =
      (deck.height / size.height) * viewport.height * DECK_FAN.radius;
    deckOrderRef.current.forEach((index, depth) => {
      if (index === shufflingIndexRef.current) return;
      const group = groupRefArray.current[index];
      const rects = projectsDetails[index]?.rects;
      if (!group || !rects) return;

      const base = rectToWorld(rects, size, viewport);
      // 0 au centre de l'éventail, négatif vers le dessus du paquet
      const spread = n - 1 - depth - (n - 1) / 2;
      const angle =
        ((-spread * DECK_FAN.spreadDeg + fan.cx * DECK_FAN.followDeg) *
          fan.v *
          Math.PI) /
        180;
      // Sur un cercle autour d'un pivot sous le paquet : à droite → plus bas
      const x = base.x + Math.sin(angle) * radius * fan.v;
      const y = base.y - (1 - Math.cos(angle)) * radius * fan.v;
      const rotation = getDeckRotation(index) * (1 - fan.v) - angle;

      group.position.x += (x - group.position.x) * follow;
      group.position.y += (y - group.position.y) * follow;
      group.rotation.z += (rotation - group.rotation.z) * follow;
    });
  });

  // Page projet : l'image du projet suivant suit la piste de scroll (NextProject),
  // petite puis plein écran. Pendant ce temps le hero courant est masqué : il est
  // fixe derrière la page et se verrait à travers la section transparente.
  useFrame(() => {
    if (!onProjectPage) return;
    const { el, index } = nextProjectStore;
    const blocked =
      goToContact || returnHome || goToWork || goToProject || isReturning;
    let driving = -1;
    // Mesurées sur la piste, pas lues dans le store (voir measureTrack)
    const { enter, progress } = el
      ? measureTrack(el, size.height)
      : { enter: 0, progress: 0 };

    // enter > 0 : la section est entrée dans l'écran
    if (el && index >= 0 && index !== activeIndex && !blocked && enter > 0) {
      const rect = getNextRect(enter, progress, size.width, size.height);
      const group = groupRefArray.current[index];
      if (group) {
        const { x, y, w, h } = rectToWorld(rect, size, viewport);
        group.position.set(x, y, 0);
        group.scale.set(w, h, 1);
        group.rotation.z = 0;
        driving = index;
      }
    }

    groupRefArray.current.forEach((group, i) => {
      if (!group) return;
      group.visible = !(driving >= 0 && i === activeIndex);
      group.renderOrder = i === driving ? 2 : 0;
    });
  });

  // Works : bascule grille ↔ liste. WorkList a envoyé les nouvelles cibles
  // (projectsDetails) dans le même rendu que isViewSwitching → on y glisse.
  useLayoutEffect(() => {
    if (!isViewSwitching) return;
    const groups = groupRefArray.current;
    let done = false;
    const tl = gsap.timeline({
      onComplete: () => {
        done = true;
        unlockScroll();
        setIsViewSwitching(false);
      },
    });
    const { duration, ease, stagger } = VIEW_SWITCH;

    projectsDetails.forEach(({ rects }, i) => {
      const group = groups[i];
      if (!group || !rects) return;
      const { x, y, w, h } = rectToWorld(rects, size, viewport);
      const at = i * stagger;
      tl.to(group.position, { x, y, duration, ease }, at)
        .to(group.scale, { x: w, y: h, duration, ease }, at)
        .to(group.rotation, { z: 0, duration, ease }, at);
    });

    return () => {
      tl.kill();
      if (!done) unlockScroll();
    };
    // Les cibles sont lues au moment du lancement, une seule fois par bascule
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isViewSwitching]);

  // Liste : l'aperçu survolé passe devant les autres planes (il les chevauche)
  useEffect(() => {
    if (pathname !== '/work' || hoveredIndex === null) return;
    groupRefArray.current.forEach((group, i) => {
      if (group) group.renderOrder = worksView === 'list' && i === hoveredIndex ? 1 : 0;
    });
  }, [hoveredIndex, worksView, pathname]);

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
          // Fin du paquet : ordre de dessin par défaut pour les autres pages
          groupRefArray.current.forEach((group) => {
            if (group) group.renderOrder = 0;
          });
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
          .to(group.scale, { x: worldW, y: worldH, duration: 1 }, '<')
          // Sortie du paquet : la carte se redresse
          .to(group.rotation, { z: 0, duration: 1 }, '<');
      });
    }

    // Départ de Works en liste (vers Home ou Contact) : les titres sortent d'abord,
    // les images partent au même relais que pour liste → grille
    const listExitDelay =
      pathname === '/work' && worksView === 'list' ? LIST_EXIT.handoffAt : 0;

    if (returnHome) {
      // Animation déjà jouée, la route change : ne pas la relancer
      if (pendingRouteRef.current) return;
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
          // Drapeaux levés à l'arrivée sur / (voir pendingRouteRef)
          pendingRouteRef.current = () => {
            setSelectedIndex(null);
            setSettledIndex(null);
            setSelectedSlug('');
            setFromWorkPage(-1);
            setFromProjectSlug(null);
            setFromProjectIndex(-1);
            setReturnHome(false);
            requestAnimationFrame(() => {
              setIsAnimating(false);
            });
          };
          router.push(`/`, { scroll: false });
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

      returnHomeTl.addLabel('planes', listExitDelay);
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
            .to(group.position, { y: worldY, x: worldX, duration: 1 }, 'planes')
            .to(group.scale, { x: worldW, y: worldH, duration: 1 }, 'planes')
            .to(group.rotation, { z: getDeckRotation(i), duration: 1 }, 'planes');
          if (selectedGroup) {
            returnHomeTl
              .to(selectedGroup.position, { y: 0, x: 0, duration: 1 }, 'planes')
              .to(selectedGroup.scale, { x: 0, y: 0, duration: 1 }, 'planes');
          }
        } else {
          // Retour au paquet : la carte reprend son inclinaison
          returnHomeTl
            .to(group.position, { y: worldY, x: worldX, duration: 1 }, 'planes')
            .to(group.scale, { x: worldW, y: worldH, duration: 1 }, 'planes')
            .to(group.rotation, { z: getDeckRotation(i), duration: 1 }, 'planes');
        }
      });

      return () => {
        cancelled = true;
        returnHomeTl.kill();
      };
    }

    if (goToContact) {
      // Animation déjà jouée, la route change : ne pas la relancer
      if (pendingRouteRef.current) return;
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
          // Drapeaux levés à l'arrivée sur /contact (voir pendingRouteRef)
          pendingRouteRef.current = () => {
            setGoToContact(false);
            setSelectedIndex(null);
            setSettledIndex(null);
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                setIsAnimating(false);
              });
            });
          };
          router.replace('/contact', { scroll: false });
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

      contactTl.addLabel('planes', listExitDelay);
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
            'planes',
          )
          .to(
            group.scale,
            { x: worldW, y: worldH, duration: 1, ease: 'power2.inOut' },
            'planes',
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
      // Animation déjà jouée, la route change : ne pas la relancer
      if (pendingRouteRef.current) return;
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
          // Drapeaux levés à l'arrivée sur /work (voir pendingRouteRef)
          pendingRouteRef.current = () => {
            setSelectedIndex(null);
            setSettledIndex(null);
            setFromWorkPage(-1);
            setGoToWork(false);
            setFromProjectSlug(null);
            setFromProjectIndex(-1);
            clearFlag();
            requestAnimationFrame(() => {
              setIsAnimating(false);
            });
          };
          router.push('/work', { scroll: false });
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
        // Les autres reviennent dans la disposition enregistrée par Works (relue par
        // la page projet). Pas les positions mémorisées au départ : après un « projet
        // suivant », le projet ouvert au départ doit revenir aussi, et la disposition
        // a pu être recentrée sur le nouveau projet.
        // Classement refait par rapport au projet qui revient (même règle que
        // getPositions) : celui du départ de Works est faux après un « projet suivant »
        const top: THREE.Group[] = [];
        const bottom: THREE.Group[] = [];
        groupRefArray.current.forEach((group, i) => {
          if (!group || i === selectedIndex) return;
          const rects = projectsDetails[i]?.rects;
          if (!rects) return;
          const { x, y, w, h } = rectToWorld(rects, size, viewport);
          // Au-dessus du projet : arrive du haut ; en dessous : arrive du bas
          const fromTop = y > worldY;
          (fromTop ? top : bottom).push(group);
          gsap.set(group.position, {
            x,
            y: fromTop ? viewport.height : -viewport.height,
          });
          gsap.set(group.scale, { x: w, y: h });
          reverseTl.to(group.position, { y, duration: 1 }, '<');
        });
        // React lit ce classement tant qu'on est encore sur la page projet
        projectsAtTheTopRef.current = top;
        projectsAtTheBottomRef.current = bottom;
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

    // Déjà sur une page projet (projet suivant, accès direct) : pas d'animation,
    // l'image est déjà plein écran. Mais le plane « sélectionné » doit suivre :
    // c'est lui qui retrouve son ondulation au retour vers Works.
    if (workPath) {
      setSettledIndex(selectedIndex);
      return;
    }

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

  // La route a changé : on lève les drapeaux de la transition. Au premier changement,
  // même si ce n'est pas la route attendue (retour navigateur…) : sinon l'attente
  // bloquerait toutes les transitions suivantes. Déclaré après l'effet principal,
  // qui voit donc encore l'attente et ne relance pas l'animation.
  useLayoutEffect(() => {
    const finish = pendingRouteRef.current;
    if (!finish) return;
    pendingRouteRef.current = null;
    finish();
  }, [pathname]);

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
