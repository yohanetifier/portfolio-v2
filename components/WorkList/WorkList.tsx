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
import { unlockScroll } from '@/utils/scroll';
import IntroGridPhantom from '../IntroPhantomGrid/IntroPhantomGrid';
import ContactPhantomGrid from '../Contact/ContactPhantomGrid';
import { useFinePointer } from '@/utils/useFinePointer';

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
    setIsLostPage,
    goToContact,
    goToWork,
    returnHome,
    goToProject,
  } = useThreeJsContext();
  const finePointer = useFinePointer();
  const linkArray = useRef<HTMLAnchorElement[]>([]);
  const mainWrapperRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const metrics = getGridMetrics(projects.length);
  const isAnimatingRef = useRef(false);
  isAnimatingRef.current = isAnimating;
  const leavingRef = useRef(false);
  leavingRef.current = Boolean(
    goToContact || goToWork || returnHome || goToProject,
  );
  const targetX = useRef<number>(0);
  const targetY = useRef<number>(0);
  const currentX = useRef<number | null>(null);
  const currentY = useRef<number | null>(null);
  const hoveredIndexRef = useRef<number | null>(null);
  const titleWrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const [active, setActive] = useState<boolean | null>(false);

  const handleTransition = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    title: string,
    index: number,
    featuredImage: { src: string; alt: string },
  ) => {
    setActive(false);
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
    // Pendant / juste après une transition : ne pas écraser les cibles GSAP
    if (isAnimatingRef.current || leavingRef.current) return;
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
    setIsLostPage(false);
    unlockScroll();
  }, [setIsLostPage]);

  // Mesure quand on est bien installé sur /work (pas en train de partir vers contact/home)
  useLayoutEffect(() => {
    if (fromHome || isAnimating || goToContact || goToWork || returnHome || goToProject)
      return;
    updateProjects();
  }, [fromHome, isAnimating, goToContact, goToWork, returnHome, goToProject]);

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
    if (!finePointer || !titleRef.current) return;
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
  }, [active, finePointer]);

  const handleMouseMove = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    index: number | null,
  ) => {
    if (!finePointer || index === null) return;
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
    if (!finePointer) return;
    setActive(false);
    setHoveredIndex(null);
  };

  useEffect(() => {
    if (!finePointer) return;

    const tick = () => {
      if (
        currentX.current === null ||
        currentY.current === null ||
        hoveredIndexRef.current === null
      ) {
        requestAnimationFrame(tick);
      } else if (titleWrapperRef.current) {
        currentX.current =
          currentX.current + (targetX.current - currentX.current) * 0.1;
        currentY.current =
          currentY.current + (targetY.current - currentY.current) * 0.1;
        titleWrapperRef.current.style.left = currentX.current + 'px';
        titleWrapperRef.current.style.top = currentY.current + 'px';
        requestAnimationFrame(tick);
      } else {
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
  }, [finePointer]);

  return (
    <div
      className="flex justify-center items-center relative w-[100vw] transition-height duration-1000 z-[10] "
      ref={mainWrapperRef}
      style={{
        height: metrics.height,
      }}
    >
      <IntroGridPhantom projects={projects} />
      <ContactPhantomGrid projects={projects} />
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
              className={`${placement.className} ${finePointer ? 'cursor-none' : ''}`}
              onClick={(e) => handleTransition(e, title, index, featuredImage)}
              onMouseMove={
                finePointer ? (e) => handleMouseMove(e, index) : undefined
              }
              onMouseLeave={finePointer ? handleMouseLeave : undefined}
              style={placement.style}
              ref={(el) => {
                linkArray.current[index] = el!;
              }}
            ></Link>
          );
        })}
        {finePointer ? (
          <div
            className="fixed overflow-hidden pointer-events-none"
            ref={titleWrapperRef}
          >
            <p
              className=" font-fabrikatMono "
              style={{
                color: 'black',
                fontSize: 'clamp(36px, 4vw, 60px)',
                letterSpacing: '-0.01em',
                textShadow:
                  '0 2px 34px rgba(10,12,14,0.55), 0 0 2px rgba(10,12,14,0.4)',
              }}
              ref={titleRef}
            >
              {hoveredIndexRef.current === null
                ? null
                : projects[hoveredIndexRef.current].title}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
