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
 * Desktop : toujours fixed à droite (comme avant) — ne pas casser les transitions.
 * Mobile page contact : dans le flux. Mobile autres pages : fixed en bas.
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

  /**
   * `fixed` en base = desktop/transitions OK.
   * Overrides mobile via max-md: seulement (évite le flash relative → top).
   */
  const shellClass = interactive
    ? [
        'fixed inset-y-0 right-0 z-[1] flex items-center justify-end pr-[6vw] md:pr-[8vw]',
        // Mobile contact : dans le flux sous le texte
        'max-md:relative max-md:inset-auto max-md:right-auto max-md:w-full max-md:justify-center max-md:pr-0',
      ].join(' ')
    : [
        'pointer-events-none fixed inset-y-0 right-0 z-[1] flex items-center justify-end pr-[6vw] md:pr-[8vw]',
        // Mobile phantom : bas d’écran pour les transitions
        'max-md:inset-auto max-md:bottom-[max(1.25rem,env(safe-area-inset-bottom))] max-md:left-0 max-md:right-0 max-md:items-end max-md:justify-center max-md:px-[8vw] max-md:pr-[8vw] max-md:pb-2',
      ].join(' ');

  return (
    <div className={shellClass} aria-hidden>
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
