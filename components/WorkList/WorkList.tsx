'use client';
import { Project } from '@/src/models/Project';
import gsap from 'gsap';
import { Flip, ScrollTrigger } from 'gsap/all';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  getGridMetrics,
  getGridPlacement,
} from './utils/classes';
import { getPositions } from './utils/getPositions';
import { applyGsapTransition } from './utils/applyGsapTransition';

gsap.registerPlugin(Flip, ScrollTrigger);

export default function WorkList({
  projects,
}: {
  projects: Pick<Project, 'featuredImage' | 'title'>[];
}) {
  const mainWrapperRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const metrics = getGridMetrics(projects.length);

  const handleTransition = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    title: string,
  ) => {
<<<<<<< HEAD:components/WorkList/WorkList.tsx
    const formatedTitle = title.replace(/\s+/g, '-');
=======
    const decodedTitle = decodeURIComponent(title);
>>>>>>> c812c1535d9a066fee8c13b4c9bee60efe263ec9:common/components/WorkList/WorkList.tsx
    const fullscreenWrapper = document.getElementById('fullscreen');
    fullscreenWrapper!.style.opacity = '1';
    e.preventDefault();
    const target = e.currentTarget;
    const state = Flip.getState(e.currentTarget);
    const otherChildren = Array.from(gridRef.current!.children).filter(
      (child) => child !== e.currentTarget,
    );
    const { childAtTheBottom, childAtTheTop } = getPositions(
      otherChildren as HTMLElement[],
      target,
    );
    e.currentTarget.className = '';
    fullscreenWrapper!.append(e.currentTarget);
    e.currentTarget.className = 'absolute w-screen h-screen ';

    console.log('decodedTitle', decodedTitle);

    applyGsapTransition(
      childAtTheBottom,
      childAtTheTop,
<<<<<<< HEAD:components/WorkList/WorkList.tsx
      formatedTitle,
=======
      decodedTitle,
>>>>>>> c812c1535d9a066fee8c13b4c9bee60efe263ec9:common/components/WorkList/WorkList.tsx
      state,
      e.currentTarget,
      router,
    );
  };

  useEffect(() => {
    document.body.style.overflow = 'visible';
    const grid = document.getElementById('grid');
    setTimeout(() => {
      while (grid?.firstChild) {
        grid?.removeChild(grid.firstChild);
      }
    }, 300);
    const handleScroll = () => {
      const arrayOfImages = Array.from(gridRef.current!.children);
      arrayOfImages.map((image) => {
        gsap.to(image, {
          scaleX: 0,
          transformOrigin: 'center top',
          scrollTrigger: {
            trigger: image,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      });
    };

    handleScroll();
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
        {projects.map(({ featuredImage, title }, index) => {
          const placement = getGridPlacement(index);
          return (
            <Link
              key={index}
              href={`/work/${title.replace(/\s+/g, '-')}`}
              prefetch={true}
              className={placement.className}
              onClick={(e) => handleTransition(e, title)}
              style={placement.style}
            >
              <Image
                src={featuredImage.src}
                alt={featuredImage.alt}
                width={1000}
                height={1000}
                className="w-full h-full object-cover"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
