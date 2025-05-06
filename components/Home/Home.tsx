'use client';
import Button from '@/components/Button/Button';
import { animateText } from '@/common/utils/animateText';
import { Project } from '@/src/models/Project';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Flip, ScrollTrigger } from 'gsap/all';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef } from 'react';
import { gridClasses, startingClass } from '../WorkList/utils/classes';

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
  const headerRef = useRef<HTMLDivElement | null>(null);
  const tl = gsap.timeline({});
  const router = useRouter();

  const handleClick = () => {
    const grid = document.getElementById('grid');
    grid!.style.transform = 'scale(1)';
    document.body.style.overflow = 'visible';
    const arrayOfImages: Element[] = Array.from(wrapperImage.current!.children);

    const state = Flip.getState(wrapperImage.current!.children);
    const children = Array.from(
      wrapperImage.current!.children,
    ) as HTMLElement[];
    children.forEach((child, index) => {
      child.className = gridClasses[index] || '';
    });
    grid!.append(
      ...Array.from(wrapperImage.current!.children as HTMLCollection),
    );

    arrayOfImages.forEach((image) => {
      (image as HTMLElement).style.transform = `rotate(0deg)`;
    });

    tl.to(buttonRef.current, { opacity: 0, duration: 0.5 });
    tl.to(welcomeRef.current, { opacity: 0, duration: 0.5 });

    Flip.from(state, {
      duration: 1,
      ease: 'power2.inOut',
      stagger: 0.1,
      onComplete: () => {
        router.push(`/work`, { scroll: false });
        gsap.to(headerRef.current, { opacity: 1 });
      },
    });
  };

  useEffect(() => {
    const grid = document.getElementById('grid');
    grid!.style.transform = 'scale(0)';
  }, []);

  useGSAP(
    () => {
      const images = Array.from(wrapperImage.current!.children).reverse();
      const tl = gsap.timeline();
      tl.from(images, {
        y: '100vh',
        stagger: 0.5,
        duration: 1,
        ease: 'power2.inOut',
      }).from([welcomeRef.current, buttonRef.current], {
        opacity: 0,
        duration: 0.5,
        stagger: 0.5,
      });
    },
    { scope: wrapperImage },
  );

  return (
    <div
      className="flex justify-center items-center relative w-[100vw] h-[100vh] transition-height duration-1000"
      ref={mainWrapperRef}
    >
      <div
        className="relative w-full h-full rounded-xl flex justify-center items-center"
        ref={wrapperImage}
      >
        {projects.map(({ featuredImage }, index) => (
          <div key={index} className={`${startingClass[index].className}`}>
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
