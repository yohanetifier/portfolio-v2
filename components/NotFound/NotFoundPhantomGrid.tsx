'use client';

import { Project } from '@/src/models/Project';
import { ProjectItem, useThreeJsContext } from '@/contexts/ThreeJsContext';
import { useLayoutEffect, useRef } from 'react';
import {
  getNotFoundProjectLayout,
  notFoundLayoutToDom,
} from './notFoundLayout';
import { slugify } from '@/utils/slugify';
import { useFinePointer } from '@/utils/useFinePointer';

type Props = {
  projects: Pick<Project, 'featuredImage' | 'title'>[];
  onHover?: (index: number, uv: { x: number; y: number }) => void;
  onLeave?: () => void;
  onSelect?: (index: number, rect: DOMRect) => void;
};

/**
 * Phantoms 404 — hit-targets cliquables (épaves) + mesures pour Three.
 */
export default function NotFoundPhantomGrid({
  projects,
  onHover,
  onLeave,
  onSelect,
}: Props) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const {
    setProjects,
    goToContact,
    goToWork,
    returnHome,
    goToProject,
    isAnimating,
  } = useThreeJsContext();
  const finePointer = useFinePointer();
  // Figé aussi pendant selectedIndex→projet (même flux que works, sans goToProject)
  const transitioning =
    goToContact || goToWork || returnHome || goToProject || isAnimating;

  useLayoutEffect(() => {
    const update = () => {
      // Ne pas écraser les poses pendant une transition
      if (transitioning) return;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const rects: ProjectItem[] = [];

      for (let i = 0; i < projects.length; i++) {
        const el = refs.current[i];
        if (!el || !projects[i]) continue;

        const layout = getNotFoundProjectLayout(
          i,
          vw,
          vh,
          projects.length,
        );
        const dom = notFoundLayoutToDom(layout, vw, vh);
        el.style.left = `${dom.left}px`;
        el.style.top = `${dom.top}px`;
        el.style.width = `${dom.width}px`;
        el.style.height = `${dom.height}px`;

        rects.push({
          rects: el.getBoundingClientRect(),
          imageUrl: projects[i].featuredImage.src,
        });
      }

      if (rects.length) setProjects(rects);
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [projects, setProjects, transitioning]);

  return (
    <div
      className="fixed inset-0 z-[90]"
      data-nf-phantoms
    >
      {projects.map((project, index) => (
        <button
          key={project.title}
          type="button"
          data-nf-wreck={index}
          data-cursor={finePointer ? '' : undefined}
          aria-label={`Open project ${project.title}`}
          disabled={transitioning}
          className={`absolute opacity-0 border-0 bg-transparent p-0 ${
            finePointer ? 'cursor-none' : 'cursor-pointer'
          }`}
          ref={(el) => {
            refs.current[index] = el;
          }}
          onMouseMove={
            onHover && !transitioning
              ? (e) => {
                  const rects = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - rects.left) / rects.width;
                  const y = 1 - (e.clientY - rects.top) / rects.height;
                  onHover(index, { x, y });
                }
              : undefined
          }
          onMouseLeave={transitioning ? undefined : onLeave}
          onClick={
            onSelect && !transitioning
              ? (e) => onSelect(index, e.currentTarget.getBoundingClientRect())
              : undefined
          }
        />
      ))}
      {/* Liens invisibles pour SEO / no-JS — mêmes slugs que openProject */}
      <nav className="sr-only" aria-label="Projects on this page">
        {projects.map((project) => (
          <a key={project.title} href={`/work/${slugify(project.title)}`}>
            {project.title}
          </a>
        ))}
      </nav>
    </div>
  );
}
