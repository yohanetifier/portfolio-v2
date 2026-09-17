'use client';

import { Project } from '@/src/models/Project';
import { ProjectItem, useThreeJsContext } from '@/contexts/ThreeJsContext';
import { useLayoutEffect, useRef } from 'react';
import {
  getNotFoundProjectLayout,
  notFoundLayoutToDom,
} from './notFoundLayout';

type Props = {
  projects: Pick<Project, 'featuredImage' | 'title'>[];
  onHover?: (index: number, uv: { x: number; y: number }) => void;
  onLeave?: () => void;
  onSelect?: (index: number) => void;
};

/**
 * Phantoms 404 — même layout que Yeti Portfolio.dc.html (épaves dispersées).
 * Refs exposées pour brancher le drift / courant en JS.
 */
export default function NotFoundPhantomGrid({
  projects,
  onHover,
  onLeave,
  onSelect,
}: Props) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const { setProjects, goToContact, goToWork, returnHome, goToProject } =
    useThreeJsContext();

  useLayoutEffect(() => {
    const update = () => {
      // Ne pas écraser les poses pendant une transition
      if (goToContact || goToWork || returnHome || goToProject) return;

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
  }, [
    projects,
    setProjects,
    goToContact,
    goToWork,
    returnHome,
    goToProject,
  ]);

  return (
    <div
      className="fixed inset-0 z-[1]"
      aria-hidden
      data-nf-phantoms
    >
      {projects.map((_, index) => (
        <div
          key={index}
          data-nf-wreck={index}
          className="absolute opacity-0"
          ref={(el) => {
            refs.current[index] = el;
          }}
          onMouseMove={
            onHover
              ? (e) => {
                  const rects = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - rects.left) / rects.width;
                  const y = 1 - (e.clientY - rects.top) / rects.height;
                  onHover(index, { x, y });
                }
              : undefined
          }
          onMouseLeave={onLeave}
          onClick={onSelect ? () => onSelect(index) : undefined}
        />
      ))}
    </div>
  );
}
