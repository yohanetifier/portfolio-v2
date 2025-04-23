'use client';
import Header from '@/common/components/Header/Header';
import { Project } from '@/src/models/Project';
import gsap from 'gsap';
import { Flip, ScrollTrigger } from 'gsap/all';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

gsap.registerPlugin(Flip, ScrollTrigger);

export default function WorkList({
  projects,
}: {
  projects: Pick<Project, 'featuredImage' | 'title'>[];
}) {
  // const { projects } = usePortfolioViewModel();
  // const buttonRef = useRef<HTMLButtonElement>(null);
  // const welcomeRef = useRef<HTMLButtonElement>(null);
  // const wrapperImage = useRef<HTMLDivElement>(null);
  const mainWrapperRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  // const headerRef = useRef<HTMLDivElement | null>(null);
  // const [showWrapper, setShowWrapper] = React.useState(true);
  // const titleRef = useRef<HTMLHeadingElement | null>(null);
  // const [imageArrived, setImageArrived] = useState(false);
  // const tl = gsap.timeline({});
  const router = useRouter();

  const gridClasses = [
    'col-start-3 col-end-5 row-start-3 w-[20.208vw] h-[24.219vw] relative right-[6.25vw] bottom-[5.208vw] z-[10]',
    'col-start-6 col-end-9 row-start-4 w-[20.208vw] h-[24.219vw] relative left-[5.208vw] bottom-[5.208vw] z-[10]',
    'col-start-5 col-end-8 row-start-2 w-[28.542vw] h-[18.854vw] relative left-[6.25vw] bottom-[5.208vw]',
    'col-start-7 col-end-9 row-start-4 w-[20.208vw] h-[24.219vw] relative top-[7.813vw]',
    'col-start-3 col-end-5 row-start-5 w-[20.208vw] h-[24.219vw] relative bottom-[3.385vw]',
    'col-start-2 col-end-5 row-start-7 w-[28.542vw] h-[18.854vw]',
    'col-start-7 col-end-9 row-start-8 w-[20.208vw] h-[24.219vw] relative bottom-[5.208vw]',
  ];

  const handleTransition = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    title: string,
  ) => {
    const decodedTitle = decodeURIComponent(title);
    const fullscreenWrapper = document.getElementById('fullscreen');
    fullscreenWrapper!.style.opacity = '1';
    e.preventDefault();
    const target = e.currentTarget;
    const state = Flip.getState(e.currentTarget);
    const otherChildren = Array.from(gridRef.current!.children).filter(
      (child) => child !== e.currentTarget,
    );
    const childatTheBottom: HTMLElement[] = [];
    const childAtTheTop: HTMLElement[] = [];
    otherChildren.forEach((child) => {
      const position = child.getBoundingClientRect();
      const isAtTheBottom = position.top > target.getBoundingClientRect().top;
      if (isAtTheBottom) {
        childatTheBottom.push(child as HTMLElement);
      } else {
        childAtTheTop.push(child as HTMLElement);
      }
    });

    e.currentTarget.className = '';
    fullscreenWrapper!.append(e.currentTarget);
    e.currentTarget.className = 'absolute w-screen h-screen ';

    const tl = gsap.timeline({});

    tl.to(childatTheBottom, {
      y: '100vh',
      rotate: -10,
      duration: 1,
      onComplete: () => {
        router.push(`/work/${decodedTitle}`);
      },
    }).to(
      childAtTheTop,
      {
        y: '-100vh',
        rotate: 10,
        duration: 1,
      },
      '<',
    );

    Flip.from(state, {
      delay: 0.01,
      duration: 1,
      ease: 'power2.inOut',
      onStart: () => {
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';
      },
    }).to(e.currentTarget, { filter: 'brightness(0.5)' }, '-=0.5');
  };

  useEffect(() => {
    document.body.style.overflow = 'visible';
    const grid = document.getElementById('grid');
    // const fullscreen = document.getElementById('fullscreen');
    // fullscreen!.style.zIndex = '10';
    setTimeout(() => {
      while (grid?.firstChild) {
        grid?.removeChild(grid.firstChild);
      }
      // grid?.remove();
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
            // markers: true,
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
            href={`/work/${title.replaceAll('%20', '-')}`}
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
