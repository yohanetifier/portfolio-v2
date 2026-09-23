'use client';

import { Project } from '@/src/models/Project';
import { ProjectItem, useThreeJsContext } from '@/contexts/ThreeJsContext';
import { useLayoutEffect, useRef } from 'react';

type Props = {
  projects: Pick<Project, 'featuredImage' | 'title'>[];
  /** Si true, les phantoms captent le hover (page contact) */
  interactive?: boolean;
  onHover?: (index: number, uv: { x: number; y: number }) => void;
  onLeave?: () => void;
  onSelect?: (index: number) => void;
};

/**
 * Grille de petits carrés — tous les projets.
 * Même layout partout (work phantom + page contact) pour des transitions stables.
 * Desktop : fixed à droite. Mobile : fixed un peu remontée.
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

    update();
    const raf = requestAnimationFrame(update);
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', update);
    };
  }, [projects, setProjectsContactCoords]);

  return (
    <div
      className={`fixed z-[1] flex justify-center ${
        interactive ? '' : 'pointer-events-none'
      } inset-y-0 right-0 items-center pr-[6vw] md:pr-[8vw] max-md:inset-auto max-md:bottom-[max(4.5rem,14vh)] max-md:left-0 max-md:right-0 max-md:items-end max-md:justify-center max-md:px-[8vw] max-md:pr-[8vw]`}
      aria-hidden
    >
      <div
        className="grid grid-cols-3 gap-2 max-md:[--sq:min(17vw,_70px)] md:gap-4 md:[--sq:min(9vw,_110px)] [--sq:min(9vw,_110px)]"
        style={{ width: 'calc(var(--sq) * 3 + 1rem)' }}
      >
        {projects.map((_, index) => (
          <div
            key={index}
            className="opacity-0"
            style={{
              width: 'var(--sq)',
              height: 'var(--sq)',
              cursor: interactive && onSelect ? 'none' : undefined,
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
            onClick={
              interactive && onSelect ? () => onSelect(index) : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
