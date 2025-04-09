'use client';
import { Project } from '@/src/models/Project';
import gsap from 'gsap';
import { Flip, ScrollTrigger } from 'gsap/all';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { gridClasses } from './constants';
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

  const handleTransition = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    title: string,
  ) => {
    const fullscreenWrapper = document.getElementById('fullscreen');
    fullscreenWrapper!.style.opacity = '1';
    e.preventDefault();
    const target = e.currentTarget;
    const state = Flip.getState(e.currentTarget);
    const otherChildren = Array.from(gridRef.current!.children).filter(
      (child) => child !== e.currentTarget,
    );
    const { childAtTheBottom, childAtTheTop } = getPositions(
      otherChildren,
      target,
    );
    // const childatTheBottom: HTMLElement[] = [];
    // const childAtTheTop: HTMLElement[] = [];
    // otherChildren.forEach((child) => {
    //   const position = child.getBoundingClientRect();
    //   const isAtTheBottom = position.top > target.getBoundingClientRect().top;
    //   if (isAtTheBottom) {
    //     childatTheBottom.push(child as HTMLElement);
    //   } else {
    //     childAtTheTop.push(child as HTMLElement);
    //   }
    // });

    e.currentTarget.className = '';
    fullscreenWrapper!.append(e.currentTarget);
    e.currentTarget.className = 'absolute w-screen h-screen ';

    // const tl = gsap.timeline({});

    // tl.to(childatTheBottom, {
    //   y: '100vh',
    //   rotate: -10,
    //   duration: 1,
    //   onComplete: () => {
    //     router.push(`/work/${title}`);
    //   },
    // }).to(
    //   childAtTheTop,
    //   {
    //     y: '-100vh',
    //     rotate: 10,
    //     duration: 1,
    //   },
    //   '<',
    // );

    // Flip.from(state, {
    //   delay: 0.01,
    //   duration: 1,
    //   ease: 'power2.inOut',
    //   onStart: () => {
    //     document.body.style.overflow = 'hidden';
    //     document.body.style.height = '100vh';
    //   },
    // }).to(e.currentTarget, { filter: 'brightness(0.5)' }, '-=0.5');
    applyGsapTransition(
      childAtTheBottom,
      childAtTheTop,
      title,
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
      className="flex justify-center items-center relative w-[100vw] h-[300vh] transition-height duration-1000 z-[10]"
      ref={mainWrapperRef}
    >
      <div
        className={`w-full grid grid-rows-10 grid-cols-10 gap-[20px] h-[300vh] z-[2] `}
        ref={gridRef}
      >
        {projects.map(({ featuredImage, title }, index) => (
          <Link
            key={index}
            href={`/work/${title}`}
            prefetch={true}
            className={gridClasses[index]}
            onClick={(e) => handleTransition(e, title)}
          >
            <Image
              src={featuredImage.src}
              alt={featuredImage.alt}
              width={1000}
              height={1000}
              className="w-full h-full object-cover"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
