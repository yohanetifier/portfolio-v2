'use client';
import React, { useLayoutEffect, useRef } from 'react';
import { getGridMetrics, getGridPlacement } from '../WorkList/utils/classes';
import { Project } from '@/src/models/Project';
import { useThreeJsContext } from '@/contexts/ThreeJsContext';

type Props = {
  projects: Pick<Project, 'featuredImage'>[];
  /** false = ne pas écraser projectsCoords */
  writeCoords?: boolean;
};

/**
 * Grille fantôme worklist — cibles pour intro→work / 404→work.
 * absolute + pleine hauteur grille (comme avant), sans overflow parent.
 */
const WorklistPhantomGrid = ({
  projects,
  writeCoords = true,
}: Props) => {
  const mainWrapperRef = useRef<HTMLDivElement>(null);
  const metrics = getGridMetrics(projects.length);
  const phantomsElements = useRef<(HTMLDivElement | null)[]>([]);
  const { setProjectsCoords, goToWork } = useThreeJsContext();

  useLayoutEffect(() => {
    if (!writeCoords) return;

    const update = () => {
      const rects = phantomsElements.current
        .map((element) => {
          if (!element) return null;
          return { rects: element.getBoundingClientRect() };
        })
        .filter((item): item is { rects: DOMRect } => item !== null);

      if (rects.length) setProjectsCoords(rects);
    };

    update();
    const raf = requestAnimationFrame(() => {
      update();
      requestAnimationFrame(update);
    });
    return () => cancelAnimationFrame(raf);
  }, [projects, setProjectsCoords, writeCoords, goToWork]);

  return (
    <div
      className="pointer-events-none fixed top-0 left-0 flex justify-center items-center w-[100vw] transition-height duration-1000 z-[10]"
      ref={mainWrapperRef}
      aria-hidden
      style={{
        height: metrics.height,
      }}
    >
      <div
        className={`w-full grid grid-cols-10 gap-[20px] z-[2] opacity-0`}
        style={{
          height: metrics.height,
          gridTemplateRows: `repeat(${metrics.rows}, minmax(0, 1fr))`,
        }}
      >
        {projects.map((_, index) => {
          const placement = getGridPlacement(index);
          return (
            <div
              key={index}
              className={`${placement.className}`}
              style={placement.style}
              ref={(el) => {
                phantomsElements.current[index] = el;
              }}
            ></div>
          );
        })}
      </div>
    </div>
  );
};

export default WorklistPhantomGrid;
