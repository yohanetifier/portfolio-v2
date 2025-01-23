'use client';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Flip, ScrollTrigger } from 'gsap/all';
import Image from 'next/image';
import React, { useEffect, useRef } from 'react';

gsap.registerPlugin(Flip, ScrollTrigger);
console.log('ScrollTrigger', ScrollTrigger);

export default function Loading() {
  const buttonRef = useRef<any | null>(null);
  const wrapperImage = React.useRef<any>(null);
  const mainWrapperRef = React.useRef<HTMLDivElement>(null);
  const gridRef = React.useRef<HTMLDivElement>(null);
  const [showWrapper, setShowWrapper] = React.useState(true);
  const titleRef = React.useRef<HTMLHeadingElement | null>(null);
  const [imageArrived, setImageArrived] = React.useState(false);
  const tl = gsap.timeline({});

  useEffect(() => {
    const arrayOfImages: HTMLElement[] = Array.from(
      wrapperImage.current!.children,
    ) as HTMLElement[];

    tl.fromTo(
      titleRef.current,
      { y: '20vh', opacity: 0.5 },
      { y: 0, opacity: 1 },
    );
    tl.fromTo(
      arrayOfImages[0],
      { y: '20vh', scale: 1.05, opacity: 0 },
      { y: -10, duration: 0.5, opacity: 1 },
    )
      .fromTo(
        arrayOfImages[1],
        { y: '30vh', opacity: 0 },
        { y: -80, duration: 0.5, opacity: 1 },
      )
      .to(arrayOfImages[0], { y: 0, scale: 1 })
      .to(arrayOfImages[1], { y: 0, scale: 1 }, '<')
      .fromTo(
        arrayOfImages[2],
        { y: '30vh', opacity: 0 },
        { y: -80, duration: 0.5, opacity: 1 },
        '<',
      )
      .to(arrayOfImages[2], {
        y: 0,
        // scale: 1,
        onComplete: () => setImageArrived(true),
      });
    // .to(arrayOfImages[1], {
    //   x: 500,
    //   delay: '3',
    //   onComplete: () => setImageArrived(false),
    // });
  }, []);

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
    'col-start-1 col-end-2 row-start-1 row-end-2 border-2 border-red-500 w-full h-[200px]',
    'col-start-3 col-end-4 row-start-1 row-end-2 border-2 w-full h-[200px]',
    'col-start-5 col-end-6 row-start-1 row-end-2 border-2 w-full h-[200px]',
    'col-start-2 col-end-3 row-start-2 row-end-2 border-2 border-cyan-500 w-full h-[200px] ',
    'col-start-4 col-end-5 row-start-2 row-end-2 border-2 border-cyan-500 w-full h-[200px]',
    'col-start-1 col-end-2 row-start-3 row-end-3 border-2 border-green-500 w-full h-[200px]',
    'col-start-3 col-end-4 row-start-3 row-end-3 border-[10px] border-red-500 w-full h-[200px]',
    'col-start-5 col-end-6 row-start-3 row-end-3 border-2 border-green-500 w-full h-[200px]',
    'col-start-2 col-end-3 row-start-4 row-end-4 border-2 border-orange-500 w-full h-[200px]',
    'col-start-4 col-end-5 row-start-4 row-end-4 border-2 border-orange-500 w-full h-[200px]',
    'col-start-1 col-end-2 row-start-5 row-end-5 border-2 w-full h-[200px]',
    'col-start-3 col-end-4 row-start-5 row-end-5 border-2 w-full h-[200px]',
    'col-start-5 col-end-6 row-start-5 row-end-5  border-2 w-full h-[200px]',
  ];

  const handleClick = () => {
    const arrayOfImages: HTMLElement[] = Array.from(
      wrapperImage.current!.children,
    );
    const state = Flip.getState(wrapperImage.current?.children);
    const children = Array.from(wrapperImage.current.children) as HTMLElement[];
    children.forEach((child, index) => {
      child.className = gridClasses[index] || '';
    });
    gridRef.current!.append(
      ...Array.from(wrapperImage.current.children as HTMLCollection),
    );

    arrayOfImages.forEach((image) => {
      image.style.left = `0px`;
      image.style.transform = `rotate(0deg)`;
    });

    tl.to(buttonRef.current, { opacity: 0, duration: 1 });
    Flip.from(state, {
      duration: 1,
      ease: 'power2.inOut',
      stagger: 0.1,
      onUpdate: () => {
        setShowWrapper(false);
      },
    });
  };
  if (gridRef.current) {
    const arrayOfImages = Array.from(gridRef.current!.children);
    gsap.to(arrayOfImages[6], {
      scaleX: 0, // L'image se ferme complètement verticalement
      transformOrigin: 'center top', // Point d'origine pour la fermeture
      scrollTrigger: {
        trigger: arrayOfImages[6], // L'image déclenche l'effet
        start: 'top top', // Début de l'animation
        end: 'bottom top', // Fin de l'animation
        scrub: true, // Synchronisation avec le scroll
        // pin: true,
        markers: true,
      },
    });
  }

  return (
    <div
      className="flex justify-center items-center relative w-full h-[100vh]"
      ref={mainWrapperRef}
    >
      <div className="absolute w-[35vw] h-[90vh] rounded-xl" ref={wrapperImage}>
        {[
          'desktop.jpg',
          'tesla.jpeg',
          'holidays.jpg',
          'desktop.jpg',
          'tesla.jpeg',
          'holidays.jpg',
          'desktop.jpg',
          'tesla.jpeg',
          'holidays.jpg',
          'desktop.jpg',
          'tesla.jpeg',
          'holidays.jpg',
          'holidays.jpg',
        ].map((source, index) => (
          <Image
            key={index}
            src={`/images/${source}`}
            alt={source}
            width={0}
            height={0}
            className="border-2  w-full h-full object-cover absolute rounded-3xl"
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
        className={`w-full grid grid-rows-5 grid-cols-5 gap-[20px] relative h-[200vh]`}
        ref={gridRef}
      ></div>
    </div>
  );
}
