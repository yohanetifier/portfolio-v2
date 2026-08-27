'use client';
import Button from '@/components/Button/Button';
import { animateText } from '@/common/utils/animateText';
import { Project } from '@/src/models/Project';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Flip, ScrollTrigger } from 'gsap/all';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import {
  getGridMetrics,
  getGridPlacement,
  getStartingClass,
  INTRO_VISIBLE_COUNT,
} from '../WorkList/utils/classes';
import { useHeaderContext } from '@/contexts/HeaderContext';
import { ProjectItem, useThreeJsContext } from '@/contexts/ThreeJsContext';
import Link from 'next/link';
import { useThree } from '@react-three/fiber';

gsap.registerPlugin(Flip, ScrollTrigger);

export default function Home({
  projects,
}: {
  projects: Pick<Project, 'featuredImage'>[];
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const welcomeRef = useRef<HTMLButtonElement>(null);
  const wrapperImage = useRef<HTMLDivElement>(null);
  const mainWrapperRef = useRef<HTMLDivElement>(null);
  const tl = gsap.timeline({});
  const router = useRouter();
  const { setHeaderVisible } = useHeaderContext();
  const imgRefArray = useRef([]);
  const { setProjects, setFromHome, setProjectsCoords } = useThreeJsContext();
  const metrics = getGridMetrics(projects.length);
  const phantomsElements = useRef<HTMLAnchorElement[]>([]);
  // const { size, viewport } = useThree();
  const convertLinksCoords = useRef({});

  const handleClick = () => {
    // const linksCoords = phantomsElements.current
    //   .map((element) => {
    //     return {
    //       rects: element.getBoundingClientRect(),
    //     };
    //   })
    //   .filter(Boolean);
    setFromHome(true);
    // linksCoords.forEach((element) => {
    //   const centerX = element.rects.left + element.rects.width / 2;
    //   const centerY = element.rects.top + element.rects.height / 2;
    //   const worldX = (centerX / size.width - 0.5) * viewport.width;
    //   const worldY = -(centerY / size.height - 0.5) * viewport.height;
    //   const worldW = (element.rects.width / size.width) * viewport.width;
    //   const worldH = (element.rects.height / size.width) * viewport.height;
    // });

    // const grid = document.getElementById('grid');
    // const metrics = getGridMetrics(projects.length);
    // if (!grid) return;
    // {
    //   grid.style.height = metrics.height;
    //   grid.style.gridTemplateRows = `repeat(${metrics.rows}, minmax(0, 1fr))`;
    // }
    // grid.style.transform = 'scale(1)';
    // document.body.style.overflow = 'visible';
    // const arrayOfImages: Element[] = Array.from(wrapperImage.current!.children);
    // const state = Flip.getState(wrapperImage.current!.children);
    // const children = Array.from(
    //   wrapperImage.current!.children,
    // ) as HTMLElement[];
    // children.forEach((child, index) => {
    //   const placement = getGridPlacement(index);
    //   child.className = placement.className;
    //   child.style.gridColumnStart = String(placement.style.gridColumnStart);
    //   child.style.gridColumnEnd = String(placement.style.gridColumnEnd);
    //   child.style.gridRowStart = String(placement.style.gridRowStart);
    // });
    // grid!.append(
    //   ...Array.from(wrapperImage.current!.children as HTMLCollection),
    // );
    // arrayOfImages.forEach((image) => {
    //   (image as HTMLElement).style.transform = `rotate(0deg)`;
    // });
    // tl.to(buttonRef.current, { opacity: 0, duration: 0.5 });
    // tl.to(welcomeRef.current, { opacity: 0, duration: 0.5 });
    // Flip.from(state, {
    //   duration: 1,
    //   ease: 'power2.inOut',
    //   stagger: 0.1,
    //   onComplete: () => {
    //     router.push(`/work`, { scroll: false });
    //     setHeaderVisible(true);
    //   },
    // });
  };

  useEffect(() => {
    setHeaderVisible(false);
    const grid = document.getElementById('grid');
    grid!.style.transform = 'scale(0)';

    return () => setHeaderVisible(true);
  }, [setHeaderVisible]);

  // GSAP `.from()` runs after the first paint, so images briefly flash at y=0.
  // Set the initial off-screen position before paint to avoid that flicker.
  // useLayoutEffect(() => {
  //   if (!wrapperImage.current) return;

  //   const introImages = Array.from(wrapperImage.current.children).slice(
  //     0,
  //     INTRO_VISIBLE_COUNT,
  //   ) as HTMLElement[];

  //   gsap.set(introImages, { y: '100vh' });
  // }, [projects.length]);

  // useGSAP(
  //   () => {
  //     const introImages = Array.from(wrapperImage.current!.children)
  //       .slice(0, INTRO_VISIBLE_COUNT)
  //       .reverse();
  //     const tl = gsap.timeline();
  //     tl.to(introImages, {
  //       y: 0,
  //       stagger: 0.5,
  //       duration: 1,
  //       ease: 'power2.inOut',
  //     }).from([welcomeRef.current, buttonRef.current], {
  //       opacity: 0,
  //       duration: 0.5,
  //       stagger: 0.5,
  //     });
  //   },
  //   { scope: wrapperImage },
  // );

  useEffect(() => {
    const rects: ProjectItem[] = imgRefArray.current
      .map((element: HTMLElement, index) => {
        return {
          rects: element.getBoundingClientRect(),
          imageUrl: projects[index].featuredImage.src,
        };
      })
      .filter(Boolean);
    setProjects(rects);

    const phantomProjetcsRects = phantomsElements.current
      .map((element: HTMLElement, index) => {
        return {
          rects: element.getBoundingClientRect(),
        };
      })
      .filter(Boolean);
    setProjectsCoords(phantomProjetcsRects);
  }, []);

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
          {projects.map(({ title, featuredImage }, index) => {
            const placement = getGridPlacement(index);
            return (
              <Link
                key={index}
                href={''}
                prefetch={true}
                className={`${placement.className} border-2 border-blue-500`}
                // onClick={(e) =>
                //   handleTransition(e, title, index, featuredImage)
                // }
                style={placement.style}
                ref={(el) => {
                  phantomsElements.current[index] = el!;
                }}
              ></Link>
            );
          })}
        </div>
      </div>

      <div
        className="relative w-full h-full rounded-xl flex justify-center items-center opacity-0"
        ref={wrapperImage}
      >
        {projects
          .slice(0, INTRO_VISIBLE_COUNT)
          .map(({ featuredImage }, index) => (
            <div
              key={index}
              className={getStartingClass(index)}
              ref={(el) => (imgRefArray.current[index] = el)}
            >
              <Image
                src={featuredImage.src}
                alt={featuredImage.alt}
                width={1000}
                height={1000}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
      </div>
      <div className="absolute w-full h-[100px] md:w-[80%]  2xl:w-[60%] z-20 flex items-center justify-between">
        <Button
          onClick={handleClick}
          onMouseEnter={() => animateText(welcomeRef.current!)}
          title={'welcome'}
          ref={welcomeRef}
          // className="left-[-20px] lg:left-[15.833vw]"
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
