'use client';
import Header from '@/common/components/Header/Header';
import gsap from 'gsap';
import { Flip, ScrollTrigger } from 'gsap/all';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';

gsap.registerPlugin(Flip, ScrollTrigger);

export default function Loading() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const wrapperImage = useRef<HTMLDivElement>(null);
  const mainWrapperRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  // const [showWrapper, setShowWrapper] = React.useState(true);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const [imageArrived, setImageArrived] = useState(false);
  const tl = gsap.timeline({});

  // useEffect(() => {
  //   const arrayOfImages: HTMLElement[] = Array.from(
  //     wrapperImage.current!.children,
  //   ) as HTMLElement[];

  //   tl.fromTo(
  //     titleRef.current,
  //     { y: '20vh', opacity: 0.5 },
  //     { y: 0, opacity: 1 },
  //   );
  //   tl.fromTo(
  //     arrayOfImages[0],
  //     { y: '20vh', scale: 1.05, opacity: 0 },
  //     { y: -10, duration: 0.5, opacity: 1 },
  //   )
  //     .fromTo(
  //       arrayOfImages[1],
  //       { y: '30vh', opacity: 0 },
  //       { y: -80, duration: 0.5, opacity: 1 },
  //     )
  //     .to(arrayOfImages[0], { y: 0, scale: 1 })
  //     .to(arrayOfImages[1], { y: 0, scale: 1 }, '<')
  //     .fromTo(
  //       arrayOfImages[2],
  //       { y: '30vh', opacity: 0 },
  //       { y: -80, duration: 0.5, opacity: 1 },
  //       '<',
  //     )
  //     .to(arrayOfImages[2], {
  //       y: 0,
  //       onComplete: () => setImageArrived(true),
  //     });
  // }, []);

  const animateImageWithMouseMove = (e: MouseEvent) => {
    const arrayOfImages: HTMLElement[] = Array.from(
      wrapperImage.current!.children,
    ) as HTMLElement[];
    const normalizeSize = e.clientX / window.innerWidth - 0.5;
    arrayOfImages[2].style.left = `${normalizeSize * 50}px`;
    arrayOfImages[2].style.transform = `rotate(${normalizeSize * 5}deg)`;

    arrayOfImages[1].style.left = `${normalizeSize * 200}px`;
    arrayOfImages[1].style.transform = `rotate(${normalizeSize * 25}deg)`;

    arrayOfImages[0].style.left = `${normalizeSize * 300}px`;
    arrayOfImages[0].style.transform = `rotate(${normalizeSize * 50}deg)`;
  };

  useEffect(() => {
    if (imageArrived) {
      window.addEventListener('mousemove', animateImageWithMouseMove);
      return () => {
        window.removeEventListener('mousemove', animateImageWithMouseMove);
      };
    }
  }, [imageArrived]);

  const gridClasses = [
    'col-start-2 col-end-4 row-start-3 border-2 border-red-500 w-[20.208vw] h-[24.219vw] ',
    'col-start-6 col-end-9 row-start-5 border-2 w-[20.208vw] h-[24.219vw] border-green-500',
    'col-start-5 col-end-8 row-start-2 border-2 w-[28.542vw] h-[18.854vw] border-cyan-500',
    'col-start-7 col-end-9 row-start-6 border-2 border-red-500 w-[20.208vw] h-[24.219vw] ',
    'col-start-3 col-end-5 row-start-6 border-2 border-cyan-500 w-[20.208vw] h-[24.219vw] relative top-[65px] ',
    'col-start-2 col-end-5 row-start-8 w-[28.542vw] h-[18.854vw] relative top-[100px]',
    'col-start-7 col-end-9 row-start-9 w-[20.208vw] h-[24.219vw] relative left-[26px]',
    // 'col-start-3 col-end-4 row-start-3 row-end-3 border-[10px] border-red-500 w-full h-[200px]',
  ];

  const handleClick = () => {
    mainWrapperRef.current!.style.height = '300vh';
    const arrayOfImages: Element[] = Array.from(wrapperImage.current!.children);
    const state = Flip.getState(wrapperImage.current!.children);
    const children = Array.from(
      wrapperImage.current!.children,
    ) as HTMLElement[];
    children.forEach((child, index) => {
      child.className = gridClasses[index] || '';
    });
    gridRef.current!.append(
      ...Array.from(wrapperImage.current!.children as HTMLCollection),
    );

    arrayOfImages.forEach((image) => {
      // (image as HTMLElement).style.left = `0px`;
      (image as HTMLElement).style.transform = `rotate(0deg)`;
    });

    tl.to(buttonRef.current, { opacity: 0, duration: 1 });
    Flip.from(state, {
      duration: 1,
      ease: 'power2.inOut',
      stagger: 0.1,
      onUpdate: () => {
        // setShowWrapper(false);
        wrapperImage.current!.style.visibility = 'hidden';
        ScrollTrigger.update();
      },
      onComplete: () => {
        handleScroll();
      },
    });
  };

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

  const assets = [
    {
      src: '/images/desktop.jpg',
      alt: 'desktop',
      className:
        'w-[16.641vw] h-[19.943vw] absolute right-[50%] rotate-[-14deg] z-[7]',
    },
    {
      src: '/images/tesla.jpeg',
      alt: 'tesla',
      className: 'w-[16.641vw] h-[19.943vw] absolute top-[40%] z-[6]',
    },
    {
      src: '/images/holidays.jpg',
      alt: 'holidays',
      className:
        'w-[24.573vw] h-[15.526vw] rotate-[8deg] absolute top-[30%] z-[5]',
    },
    {
      src: '/images/desktop.jpg',
      alt: 'desktop',
      className:
        'w-[16.641vw] h-[19.943vw] absolute top-[25%] z-10 rotate-[1deg] z-[4]',
    },
    {
      src: '/images/tesla.jpeg',
      alt: 'tesla',
    },
    {
      src: '/images/holidays.jpg',
      alt: 'holidays',
    },
    {
      src: '/images/desktop.jpg',
      alt: 'desktop',
    },
  ];

  return (
    <div
      className="flex justify-center items-center relative w-[100vw] h-[100vh] transition-height duration-1000"
      ref={mainWrapperRef}
    >
      {/* <div className="absolute top-0 w-full border-2 border-green-500 h-[100px]">
        <Header />
      </div> */}
      <div
        className="absolute w-full h-full rounded-xl flex justify-center items-center"
        ref={wrapperImage}
      >
        {assets.map(({ src, alt, className }, index) => (
          <Image
            key={index}
            src={src}
            alt={alt}
            width={0}
            height={0}
            className={className}
          />
        ))}
      </div>

      <button
        ref={buttonRef}
        className="z-10 absolute right-[200px] border-2 border-red-500 w-[200px] h-[50px]"
        onClick={handleClick}
      >
        Enter
      </button>

      <div
        className={`w-full grid grid-rows-10 grid-cols-10 gap-[20px] relative h-full`}
        ref={gridRef}
      >
        <div className="absolute w-full px-[55px] border-2 border-cyan-500 ">
          <Header />
        </div>
      </div>
    </div>
  );
}
