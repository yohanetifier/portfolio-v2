'use client';
import React, { useEffect, useRef } from 'react';
import { getGridMetrics, getGridPlacement } from '../WorkList/utils/classes';
import { Project } from '@/src/models/Project';
import { useThreeJsContext } from '@/contexts/ThreeJsContext';

type Props = {
  projects: Pick<Project, 'featuredImage'>[];
};

const WorklistPhantomGrid = ({ projects }: Props) => {
  const mainWrapperRef = useRef<HTMLDivElement>(null);
  const metrics = getGridMetrics(projects.length);
  const phantomsElements = useRef<HTMLAnchorElement[]>([]);
  const { setProjectsCoords } = useThreeJsContext();

  const updateProjects = () => {
    const phantomProjetcsRects = phantomsElements.current
      .map((element: HTMLElement) => {
        return {
          rects: element.getBoundingClientRect(),
        };
      })
      .filter(Boolean);
    setProjectsCoords(phantomProjetcsRects);
  };

  useEffect(() => {
    updateProjects();
  }, []);

  return (
    <div
      className="flex justify-center items-center w-[100vw] transition-height duration-1000 z-[10] absolute top-0 left-0 "
      ref={mainWrapperRef}
      style={{
        height: metrics.height,
      }}
    >
      <div
        className={`w-full grid grid-cols-10 gap-[20px] z-[2] `}
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
                phantomsElements.current[index] = el!;
              }}
            ></div>
          );
        })}
      </div>
    </div>
  );
};

export default WorklistPhantomGrid;
