'use client';
import Button from '@/components/Button/Button';
import { animateText } from '@/common/utils/animateText';
import { Project } from '@/src/models/Project';
import gsap from 'gsap';
import { Flip, ScrollTrigger } from 'gsap/all';
import React, { useEffect, useRef } from 'react';
import { getGridMetrics, getGridPlacement } from '../WorkList/utils/classes';
import { useHeaderContext } from '@/contexts/HeaderContext';
import { useThreeJsContext } from '@/contexts/ThreeJsContext';
import Link from 'next/link';
import { lockScroll } from '@/utils/scroll';
import IntroGridPhantom from '../IntroGridPhantom/IntroGridPhantom';

gsap.registerPlugin(Flip, ScrollTrigger);

export default function Home({
  projects,
}: {
  projects: Pick<Project, 'featuredImage'>[];
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const welcomeRef = useRef<HTMLButtonElement>(null);
  const mainWrapperRef = useRef<HTMLDivElement>(null);
  const { setHeaderVisible } = useHeaderContext();
  const {
    setProjects,
    setFromHome,
    setProjectsCoords,
    setScrollY,
    setIsAnimating,
    projectsHomeCoords,
  } = useThreeJsContext();
  const metrics = getGridMetrics(projects.length);
  const phantomsElements = useRef<HTMLAnchorElement[]>([]);

  const handleClick = () => {
    setFromHome(true);
    lockScroll();
    setIsAnimating(true);
  };

  useEffect(() => {
    setHeaderVisible(false);
    const grid = document.getElementById('grid');
    grid!.style.transform = 'scale(0)';

    return () => setHeaderVisible(true);
  }, [setHeaderVisible]);

  const updateProjects = () => {
    // const rects: ProjectItem[] = imgRefArray.current
    //   .map((element: HTMLElement, index) => {
    //     return {
    //       rects: element.getBoundingClientRect(),
    //       imageUrl: projects[index].featuredImage.src,
    //     };
    //   })
    //   .filter(Boolean);
    const phantomProjetcsRects = phantomsElements.current
      .map((element: HTMLElement, index) => {
        return {
          rects: element.getBoundingClientRect(),
        };
      })
      .filter(Boolean);
    setProjectsCoords(phantomProjetcsRects);
    if (!projectsHomeCoords?.length) return;
    setProjects(projectsHomeCoords);
  };

  useEffect(() => {
    setScrollY(0);
    updateProjects();
  }, [projectsHomeCoords]);

  return (
    <div
      className="flex justify-center items-center relative w-[100vw] h-[100vh] transition-height duration-1000"
      ref={mainWrapperRef}
    >
      {/* PHANTOM GRID */}
      <div
        className="flex justify-center items-center w-[100vw] transition-height duration-1000 z-[10] border-2 border-red-500 absolute top-0 left-0 "
        ref={mainWrapperRef}
        style={{
          height: metrics.height,
        }}
      >
        <div
          className={`w-full grid grid-cols-10 gap-[20px] z-[2] `}
          // ref={gridRef}
          style={{
            height: metrics.height,
            gridTemplateRows: `repeat(${metrics.rows}, minmax(0, 1fr))`,
          }}
        >
          {projects.map((_, index) => {
            const placement = getGridPlacement(index);
            return (
              <Link
                key={index}
                href={''}
                prefetch={true}
                className={`${placement.className}`}
                style={placement.style}
                ref={(el) => {
                  phantomsElements.current[index] = el!;
                }}
              ></Link>
            );
          })}
        </div>
      </div>

      <IntroGridPhantom projects={projects} />
      <div className="absolute w-full h-[100px] md:w-[80%]  2xl:w-[60%] z-20 flex items-center justify-between">
        <Button
          onClick={handleClick}
          onMouseEnter={() => animateText(welcomeRef.current!)}
          title={'welcome'}
          ref={welcomeRef}
        />
        <Button
          onClick={handleClick}
          onMouseEnter={() => animateText(buttonRef.current!)}
          title={'click to start'}
          ref={buttonRef}
        />
      </div>
    </div>
  );
}
