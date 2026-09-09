'use client';
import { Project } from '@/src/models/Project';
import gsap from 'gsap';
import { Flip, ScrollTrigger, SplitText } from 'gsap/all';
import Link from 'next/link';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { getGridMetrics, getGridPlacement } from './utils/classes';
import { useThreeJsContext } from '@/contexts/ThreeJsContext';
import { slugify } from '@/utils/slugify';
import { setFlag } from '@/utils/fromWorkList';
import IntroGridPhantom from '../IntroPhantomGrid/IntroPhantomGrid';

gsap.registerPlugin(Flip, ScrollTrigger, SplitText);

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
    hoveredIndex,
  } = useThreeJsContext();
  const linkArray = useRef<HTMLAnchorElement[]>([]);
  const mainWrapperRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const metrics = getGridMetrics(projects.length);
  const isAnimatingRef = useRef(false);
  isAnimatingRef.current = isAnimating;
  const targetX = useRef<number>(0);
  const targetY = useRef<number>(0);
  const currentX = useRef<number | null>(null);
  const currentY = useRef<number | null>(null);
  const hoveredIndexRef = useRef<number | null>(null);
  const titleWrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const [active, setActive] = useState<boolean | null>(false);
  const tlRef = useRef();
  const splitRef = useRef(null);

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
    setHoveredIndex(null);
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

  useLayoutEffect(() => {
    const tl = gsap.timeline();
    const splitTitle = SplitText.create(titleRef.current, {
      type: 'chars',
    });

    if (active) {
      tl.fromTo(
        splitTitle.chars,
        { yPercent: 110 },
        { yPercent: 0, stagger: 0.03, ease: 'expo.out' },
      );
    } else {
      tl.fromTo(
        splitTitle.chars,
        { yPercent: 0 },
        {
          yPercent: 110,
          stagger: 0.03,
          duration: 0.6,
          ease: 'expo.out',
          onComplete: () => {
            hoveredIndexRef.current = null;
          },
        },
      );
    }
  }, [active]);

  const handleMouseMove = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    index: number | null,
  ) => {
    if (index === null) return;
    const rects = e.currentTarget.getBoundingClientRect();
    const pointXCoords = e.clientX - rects.left;
    const pointYCoords = e.clientY - rects.top;
    const pointX = pointXCoords / rects.width;
    const pointY = 1 - pointYCoords / rects.height;
    const uv = { x: pointX, y: pointY };
    setUv(uv);
    setHoveredIndex(index);
    hoveredIndexRef.current = index;
    setActive(true);
  };

  const handleMouseLeave = () => {
    setActive(false);
    setHoveredIndex(null);
  };

  useEffect(() => {
    const tick = () => {
      if (
        currentX.current === null ||
        currentY.current === null ||
        hoveredIndexRef.current === null
      ) {
        requestAnimationFrame(tick);
      } else {
        currentX.current =
          currentX.current + (targetX.current - currentX.current) * 0.1;
        currentY.current =
          currentY.current + (targetY.current - currentY.current) * 0.1;
        titleWrapperRef.current.style.left = currentX.current + 'px';
        titleWrapperRef.current.style.top = currentY.current + 'px';
        requestAnimationFrame(tick);
      }
    };
    const id = requestAnimationFrame(tick);
    const handleMove = (e: MouseEvent) => {
      targetX.current = e.clientX + 50;
      targetY.current = e.clientY - 10;
      if (currentX.current === null) {
        currentX.current = targetX.current;
      }
      if (currentY.current === null) {
        currentY.current = targetY.current;
      }
    };
    window.addEventListener('mousemove', handleMove);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      cancelAnimationFrame(id);
    };
  }, []);

  return (
    <div
      className="flex justify-center items-center relative w-[100vw] transition-height duration-1000 z-[10] "
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
              onMouseLeave={handleMouseLeave}
              style={placement.style}
              ref={(el) => {
                linkArray.current[index] = el!;
              }}
            ></Link>
          );
        })}
        <div
          className="fixed overflow-hidden pointer-events-none"
          ref={titleWrapperRef}
        >
          <p
            className=" font-fabrikatMono font-bold"
            style={{
              color: '#f4f3f0',
              fontSize: 'clamp(36px, 4vw, 60px)',
              letterSpacing: '-0.01em',
              textShadow:
                '0 2px 34px rgba(10,12,14,0.55), 0 0 2px rgba(10,12,14,0.4)',
              // transform: 'translateY(100px)',
            }}
            ref={titleRef}
          >
            {hoveredIndexRef.current === null
              ? null
              : projects[hoveredIndexRef.current].title}
          </p>
        </div>
      </div>
    </div>
  );
}
