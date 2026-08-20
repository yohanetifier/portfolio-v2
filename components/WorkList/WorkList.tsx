'use client';
import { Project } from '@/src/models/Project';
import gsap from 'gsap';
import { Flip, ScrollTrigger } from 'gsap/all';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getGridMetrics, getGridPlacement } from './utils/classes';
import { getPositions } from './utils/getPositions';
import { applyGsapTransition } from './utils/applyGsapTransition';
import { Canvas } from '@react-three/fiber';
import Plane from '../Plane/Plane';
import { ProjectItem, useThreeJsContext } from '@/contexts/ThreeJsContext';

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
  } = useThreeJsContext();
  const linkArray = useRef<HTMLAnchorElement[]>([]);
  const mainWrapperRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const metrics = getGridMetrics(projects.length);

  const handleTransition = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    title: string,
    index: number,
    featuredImage: { src: string; alt: string },
  ) => {
    e.preventDefault();
    const formatedTitle = title.replace(/\s+/g, '-');
    setSelectedIndex(index);
    setSelectedSlug(formatedTitle);
    setProjectImageSelected(featuredImage.src);

    // const fullscreenWrapper = document.getElementById('fullscreen');
    // fullscreenWrapper!.style.opacity = '1';
    // e.preventDefault();
    // const target = e.currentTarget;
    // const state = Flip.getState(e.currentTarget);
    // const otherChildren = Array.from(gridRef.current!.children).filter(
    //   (child) => child !== e.currentTarget,
    // );
    // const { childAtTheTop, childAtTheTop } = getPositions(
    //   otherChildren as HTMLElement[],
    //   target,
    // );
    // e.currentTarget.className = '';
    // fullscreenWrapper!.append(e.currentTarget);
    // e.currentTarget.className = 'absolute w-screen h-screen ';

    // applyGsapTransition(
    //   childAtTheBottom,
    //   childAtTheTop,
    //   formatedTitle,
    //   state,
    //   e.currentTarget,
    //   router,
    // );
  };

  const updateProjects = () => {
    const rects = linkArray.current
      .map((el, i) => {
        return {
          rects: el.getBoundingClientRect(),
          imageUrl: projects[i].featuredImage.src,
        };
      })
      .filter(Boolean);
    setProjects(rects);
  };

  useLayoutEffect(() => {
    updateProjects();
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'visible';

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

  return (
    <div
      className="flex justify-center items-center relative w-[100vw] transition-height duration-1000 z-[10]"
      ref={mainWrapperRef}
      style={{
        height: metrics.height,
      }}
    >
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
              href={`/work/${title.replace(/\s+/g, '-')}`}
              prefetch={true}
              className={`${placement.className}`}
              onClick={(e) => handleTransition(e, title, index, featuredImage)}
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
