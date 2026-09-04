'use client';
import { Project } from '@/src/models/Project';
import gsap from 'gsap';
import { Flip, ScrollTrigger } from 'gsap/all';
import Link from 'next/link';
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { getGridMetrics, getGridPlacement } from './utils/classes';
import { useThreeJsContext } from '@/contexts/ThreeJsContext';
import { slugify } from '@/utils/slugify';
import { setFlag } from '@/utils/fromWorkList';
import IntroGridPhantom from '../IntroPhantomGrid/IntroPhantomGrid';

gsap.registerPlugin(Flip, ScrollTrigger);

export default function WorkList({
  projects,
}: {
  projects: Pick<Project, 'featuredImage' | 'title'>[];
}) {
  const {
    setProjects,
    setSelectedIndex,
    setSelectedSlug,
    setProjectImageSelected,
    setProjectSelectedCoords,
    setScrollY,
    scrollY,
    fromHome,
    isAnimating,
    setIsAnimating,
    setHoveredIndex,
    setUv,
  } = useThreeJsContext();
  const linkArray = useRef<HTMLAnchorElement[]>([]);
  const mainWrapperRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const metrics = getGridMetrics(projects.length);
  const isAnimatingRef = useRef(false);
  isAnimatingRef.current = isAnimating;

  const handleTransition = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    title: string,
    index: number,
    featuredImage: { src: string; alt: string },
  ) => {
    e.preventDefault();
    const formatedTitle = slugify(title);
    setSelectedIndex(index);
    setSelectedSlug(formatedTitle);
    setProjectImageSelected(featuredImage.src);
    setProjectSelectedCoords(e.currentTarget.getBoundingClientRect());
    setScrollY(window.scrollY);
    setFlag();
    setIsAnimating(true);
  };

  const updateProjects = () => {
    if (isAnimatingRef.current) return;
    const rects = linkArray.current
      .map((el, i) => {
        return {
          rects: el.getBoundingClientRect(),
          imageUrl: projects[i].featuredImage.src,
        };
      })
      .filter(Boolean);
    setProjects(rects);
    const localStorageValue = JSON.stringify({ rects });
    localStorage.setItem('projectsDetails', localStorageValue);
  };

  useLayoutEffect(() => {
    if (fromHome) return;
    updateProjects();
  }, []);

  useEffect(() => {
    const grid = document.getElementById('grid');
    setTimeout(() => {
      while (grid?.firstChild) {
        grid.removeChild(grid.firstChild);
      }
    }, 300);

    window.addEventListener('scroll', updateProjects);
    window.addEventListener('resize', updateProjects);

    return () => {
      window.removeEventListener('scroll', updateProjects);
      window.removeEventListener('resize', updateProjects);
    };
  }, []);

  useLayoutEffect(() => {
    window.scrollTo(0, scrollY!);
  }, []);

  const handleMouseMove = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    index: number | null,
  ) => {
    const rects = e.currentTarget.getBoundingClientRect();
    const pointXCoords = e.clientX - rects.left;
    const pointYCoords = e.clientY - rects.top;
    const pointX = pointXCoords / rects.width;
    const pointY = 1 - pointYCoords / rects.height;
    const uv = { x: pointX, y: pointY };
    setUv(uv);
    setHoveredIndex(index);
  };

  return (
    <div
      className="flex justify-center items-center relative w-[100vw] transition-height duration-1000 z-[10]"
      ref={mainWrapperRef}
      style={{
        height: metrics.height,
      }}
    >
      <IntroGridPhantom projects={projects} />
      <div
        className={`w-full grid grid-cols-10 gap-[20px] z-[2] `}
        ref={gridRef}
        style={{
          height: metrics.height,
          gridTemplateRows: `repeat(${metrics.rows}, minmax(0, 1fr))`,
        }}
      >
        {projects.map(({ title, featuredImage }, index) => {
          const placement = getGridPlacement(index);
          return (
            <Link
              key={index}
              href={`/work/${slugify(title)}`}
              prefetch={true}
              className={`${placement.className}`}
              onClick={(e) => handleTransition(e, title, index, featuredImage)}
              onMouseMove={(e) => handleMouseMove(e, index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={placement.style}
              ref={(el) => {
                linkArray.current[index] = el!;
              }}
            ></Link>
          );
        })}
      </div>
    </div>
  );
}
