'use client';

import { Project } from '@/src/models/Project';
import { ProjectItem, useThreeJsContext } from '@/contexts/ThreeJsContext';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { getAboutCard, getContactRingRects } from '@/utils/aboutLayout';

type Props = {
  projects: Pick<Project, 'featuredImage' | 'title'>[];
  /** Si true, les phantoms captent le hover (page contact) */
  interactive?: boolean;
  onHover?: (index: number, uv: { x: number; y: number }) => void;
  onLeave?: () => void;
  onSelect?: (index: number) => void;
};

/**
 * Places des projets sur la page Contact : un anneau autour du texte, le même
 * que celui de la fin d'About. Rendu partout (Works, 404, About…) : c'est la
 * cible des transitions vers Contact.
 */
export default function ContactPhantomGrid({
  projects,
  interactive = false,
  onHover,
  onLeave,
  onSelect,
}: Props) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const { setProjectsContactCoords } = useThreeJsContext();

  useLayoutEffect(() => {
    const update = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const rects: ProjectItem[] = [];
      for (let index = 0; index < projects.length; index++) {
        const el = refs.current[index];
        if (!el || !projects[index]) continue;
        // Même anneau que la dernière section d'About (une forme → calculée),
        // immobile ici : la carte i à l'angle i / n d'un tour
        const card = getAboutCard('ring', index, projects.length, W, H);
        el.style.left = `${card.x - card.w / 2}px`;
        el.style.top = `${card.y - card.h / 2}px`;
        el.style.width = `${card.w}px`;
        el.style.height = `${card.h}px`;
        rects.push({
          rects: el.getBoundingClientRect(),
          imageUrl: projects[index].featuredImage.src,
        });
      }
      if (rects.length) setProjectsContactCoords(rects);
    };

    update();
    const raf = requestAnimationFrame(update);
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', update);
    };
  }, [projects, setProjectsContactCoords]);

  // Page Contact : les zones de survol suivent l'anneau qui tourne (styles
  // modifiés directement, sans re-rendu ; les cibles des transitions, elles,
  // restent l'anneau immobile mesuré ci-dessus)
  useEffect(() => {
    if (!interactive) return;
    let id = 0;
    const follow = () => {
      const rects = getContactRingRects(
        projects.length,
        window.innerWidth,
        window.innerHeight,
      );
      rects.forEach((rect, index) => {
        const el = refs.current[index];
        if (!el) return;
        el.style.left = `${rect.left}px`;
        el.style.top = `${rect.top}px`;
      });
      id = requestAnimationFrame(follow);
    };
    id = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(id);
  }, [interactive, projects.length]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[1]" aria-hidden>
      {projects.map((_, index) => (
        <div
          key={index}
          className={`absolute opacity-0 ${interactive ? 'pointer-events-auto' : ''}`}
          style={{ cursor: interactive && onSelect ? 'none' : undefined }}
          ref={(el) => {
            refs.current[index] = el;
          }}
          onMouseMove={
            interactive && onHover
              ? (e) => {
                  const rects = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - rects.left) / rects.width;
                  const y = 1 - (e.clientY - rects.top) / rects.height;
                  onHover(index, { x, y });
                }
              : undefined
          }
          onMouseLeave={interactive ? onLeave : undefined}
          onClick={interactive && onSelect ? () => onSelect(index) : undefined}
        />
      ))}
    </div>
  );
}
