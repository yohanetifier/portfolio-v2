'use client';

import { Project } from '@/src/models/Project';
import { ProjectItem, useThreeJsContext } from '@/contexts/ThreeJsContext';
import { useEffect, useRef } from 'react';
import { CONTACT_SQUARE_SIZE } from './contactVignettes';

type Props = {
  projects: Pick<Project, 'featuredImage'>[];
  /** Si true, les phantoms captent le hover (page contact) */
  interactive?: boolean;
  onHover?: (index: number, uv: { x: number; y: number }) => void;
  onLeave?: () => void;
};

/**
 * Grille de petits carrés — tous les projets, à droite.
 * Montée aussi sur /work pour les cibles de transition.
 */
export default function ContactPhantomGrid({
  projects,
  interactive = false,
  onHover,
  onLeave,
}: Props) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const { setProjectsContactCoords } = useThreeJsContext();

  useEffect(() => {
    const update = () => {
      const rects: ProjectItem[] = [];
      for (let index = 0; index < projects.length; index++) {
        const el = refs.current[index];
        if (!el || !projects[index]) continue;
        rects.push({
          rects: el.getBoundingClientRect(),
          imageUrl: projects[index].featuredImage.src,
        });
      }
      if (rects.length) setProjectsContactCoords(rects);
    };

    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(update);
    });
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', update);
    };
  }, [projects, setProjectsContactCoords]);

  return (
    <div
      className={`fixed inset-y-0 right-0 z-[1] flex items-center pr-[6vw] md:pr-[8vw] ${interactive ? '' : 'pointer-events-none'}`}
      aria-hidden
    >
      <div
        className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4"
        style={{ width: `calc(${CONTACT_SQUARE_SIZE} * 3 + 2rem)` }}
      >
        {projects.map((_, index) => (
          <div
            key={index}
            className="opacity-0"
            style={{
              width: CONTACT_SQUARE_SIZE,
              height: CONTACT_SQUARE_SIZE,
            }}
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
          />
        ))}
      </div>
    </div>
  );
}
