'use client';
import { RefObject, useRef } from 'react';
import gsap from 'gsap';
import { Project as ProjectModel } from '@/src/models/Project';
import { lockScroll } from '@/utils/scroll';
import {
  PROJECT_FLY,
  getFlyStart,
  getPeekRect,
  projectFly,
  scaleRect,
} from '@/utils/projectFly';
import { useOpenProject } from './useOpenProject';

const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Image du projet voisin, posée par le Scene sur projectFly à chaque image :
 * - peek : au survol d'une flèche, l'aperçu apparaît sous la barre ;
 * - unpeek : il s'efface ;
 * - fly : le contenu de la page s'efface, l'image (l'aperçu s'il est là) vole
 *   jusqu'au plein écran, puis on ouvre le projet sous elle.
 */
export function useFlyToProject(
  projects: Pick<ProjectModel, 'featuredImage' | 'title'>[],
  contentRef: RefObject<HTMLElement | null>,
) {
  const openProject = useOpenProject(projects);
  // Une seule animation à la fois sur l'image : la nouvelle remplace l'ancienne
  const tweenRef = useRef<gsap.core.Animation | null>(null);
  const flyingRef = useRef(false);

  const peek = (index: number, bar: DOMRect) => {
    if (flyingRef.current) return;
    const target = getPeekRect(bar, window.innerWidth);
    tweenRef.current?.kill();
    // Autre projet (ou rien) affiché : le nouveau part petit et transparent
    if (projectFly.index !== index) {
      projectFly.index = index;
      projectFly.full = 0;
      projectFly.opacity = 0;
      projectFly.rect = scaleRect(target, PROJECT_FLY.peekFrom);
    }
    const duration = reducedMotion() ? 0 : PROJECT_FLY.peekIn;
    tweenRef.current = gsap
      .timeline({ defaults: { duration, ease: 'power3.out' } })
      .to(projectFly.rect, { ...target }, 0)
      .to(projectFly, { opacity: 1 }, 0);
  };

  const unpeek = () => {
    if (flyingRef.current || projectFly.index < 0) return;
    tweenRef.current?.kill();
    const duration = reducedMotion() ? 0 : PROJECT_FLY.peekOut;
    tweenRef.current = gsap
      .timeline({
        defaults: { duration, ease: 'power2.out' },
        onComplete: () => {
          projectFly.index = -1;
        },
      })
      .to(
        projectFly.rect,
        { ...scaleRect(projectFly.rect, PROJECT_FLY.peekFrom) },
        0,
      )
      .to(projectFly, { opacity: 0 }, 0);
  };

  const fly = (index: number, dir: 'prev' | 'next', bar: DOMRect | null) => {
    flyingRef.current = true;
    tweenRef.current?.kill();
    if (reducedMotion()) {
      projectFly.index = -1;
      openProject(index);
      return;
    }

    // Pas de scroll pendant le vol : l'image et la page doivent rester en place
    lockScroll();
    // Pas d'aperçu de ce projet à l'écran (clavier, mobile) : on en pose un
    if (projectFly.index !== index) {
      projectFly.rect = getFlyStart(
        dir,
        bar,
        window.innerWidth,
        window.innerHeight,
      );
      projectFly.opacity = 1;
      projectFly.index = index;
    }
    projectFly.full = 0;

    tweenRef.current = gsap
      .timeline({ onComplete: () => openProject(index) })
      // Le contenu sort : on voit le hero courant, fixe derrière la page
      .to(
        contentRef.current,
        {
          opacity: 0,
          pointerEvents: 'none',
          duration: PROJECT_FLY.textsOut,
          ease: 'power3.out',
        },
        0,
      )
      // L'aperçu finit d'apparaître s'il était en train de s'effacer
      .to(projectFly, { opacity: 1, duration: PROJECT_FLY.textsOut }, 0)
      // L'image grandit jusqu'au plein écran (taille du canvas), par-dessus le hero
      .to(
        projectFly,
        { full: 1, duration: PROJECT_FLY.duration, ease: PROJECT_FLY.ease },
        PROJECT_FLY.handoff,
      );
  };

  return { peek, unpeek, fly };
}
