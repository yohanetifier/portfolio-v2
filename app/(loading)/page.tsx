'use client';
import Header from '@/common/components/Header/Header';
import gsap from 'gsap';
import { Flip, ScrollTrigger } from 'gsap/all';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import SplitType from 'split-type';

gsap.registerPlugin(Flip, ScrollTrigger);

export default function Loading() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const welcomeRef = useRef<HTMLButtonElement>(null);
  const wrapperImage = useRef<HTMLDivElement>(null);
  const mainWrapperRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  // const [showWrapper, setShowWrapper] = React.useState(true);
  // const titleRef = useRef<HTMLHeadingElement | null>(null);
  // const [imageArrived, setImageArrived] = useState(false);
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

  // const animateImageWithMouseMove = (e: MouseEvent) => {
  //   const arrayOfImages: HTMLElement[] = Array.from(
  //     wrapperImage.current!.children,
  //   ) as HTMLElement[];
  //   const normalizeSize = e.clientX / window.innerWidth - 0.5;
  //   arrayOfImages[2].style.left = `${normalizeSize * 50}px`;
  //   arrayOfImages[2].style.transform = `rotate(${normalizeSize * 5}deg)`;

  //   arrayOfImages[1].style.left = `${normalizeSize * 200}px`;
  //   arrayOfImages[1].style.transform = `rotate(${normalizeSize * 25}deg)`;

  //   arrayOfImages[0].style.left = `${normalizeSize * 300}px`;
  //   arrayOfImages[0].style.transform = `rotate(${normalizeSize * 50}deg)`;
  // };

  // useEffect(() => {
  //   if (imageArrived) {
  //     window.addEventListener('mousemove', animateImageWithMouseMove);
  //     return () => {
  //       window.removeEventListener('mousemove', animateImageWithMouseMove);
  //     };
  //   }
  // }, [imageArrived]);

  const gridClasses = [
    'col-start-3 col-end-5 row-start-3 w-[20.208vw] h-[24.219vw] relative right-[120px] bottom-[100px] ',
    'col-start-6 col-end-9 row-start-4 w-[20.208vw] h-[24.219vw] relative bottom-[100px] left-[100px]',
    'col-start-5 col-end-8 row-start-2 w-[28.542vw] h-[18.854vw] relative left-[120px] bottom-[100px]',
    'col-start-7 col-end-9 row-start-4 w-[20.208vw] h-[24.219vw] relative top-[150px]',
    'col-start-3 col-end-5 row-start-5 w-[20.208vw] h-[24.219vw] relative bottom-[65px] ',
    'col-start-2 col-end-5 row-start-7 w-[28.542vw] h-[18.854vw]',
    'col-start-7 col-end-9 row-start-8 w-[20.208vw] h-[24.219vw] relative bottom-[100px]',
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
      (image as HTMLElement).style.transform = `rotate(0deg)`;
    });

    tl.to(buttonRef.current, { opacity: 0, duration: 1 });
    tl.to(welcomeRef.current, { opacity: 0, duration: 1 });
    const thirdLastChildren = Array.from(gridRef.current!.children).slice(-3);
    thirdLastChildren.forEach((children) => {
      (children as HTMLElement).style.opacity = '0';
    });

    Flip.from(state, {
      duration: 1,
      ease: 'power2.inOut',
      stagger: 0.1,
      onUpdate: () => {
        wrapperImage.current!.style.visibility = 'hidden';
        ScrollTrigger.update();
      },
      onComplete: () => {
        handleScroll();
        gsap.to(
          [thirdLastChildren[0], thirdLastChildren[1], thirdLastChildren[2]],
          { opacity: 1 },
        );
        gsap.to(headerRef.current, { opacity: 1 });
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
      src: '/images/first-image.png',
      alt: 'desktop',
      className:
        'w-[16.641vw] h-[19.943vw] absolute right-[50%] rotate-[-14deg] z-[7]',
    },
    {
      src: '/images/second-image.png',
      alt: 'tesla',
      className: 'w-[16.641vw] h-[19.943vw] absolute top-[40%] z-[6]',
    },
    {
      src: '/images/third-image.png',
      alt: 'holidays',
      className:
        'w-[24.573vw] h-[15.526vw] rotate-[8deg] absolute top-[30%] z-[5]',
    },
    {
      src: '/images/fourth-image.png',
      alt: 'desktop',
      className:
        'w-[16.641vw] h-[19.943vw] absolute top-[25%] z-10 rotate-[1deg] z-[4]',
    },
    {
      src: '/images/fifth-image.png',
      alt: 'tesla',
      className: 'opacity-0',
    },
    {
      src: '/images/sixth-image.png',
      alt: 'holidays',
      className: 'opacity-0',
    },
    {
      src: '/images/seventh-image.png',
      alt: 'desktop',
      className: 'opacity-0',
    },
  ];

  const [split, setSplit] = useState<SplitType | null>(null); // Stocke l'instance SplitType

  const randomChar = () => {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*';
    return chars[Math.floor(Math.random() * chars.length)];
  };

  const scrambleText = (element, originalText, duration = 1) => {
    let iterations = 0;
    const totalFrames = duration * 60; // 60 FPS

    const scrambleInterval = setInterval(() => {
      iterations++;

      const scrambled = originalText
        .split('')
        .map((char, index) =>
          Math.random() > iterations / totalFrames ? randomChar() : char,
        )
        .join('');

      element.innerText = scrambled;

      if (iterations >= totalFrames) {
        clearInterval(scrambleInterval);
        element.innerText = originalText;
      }
    }, 1000 / 60); // 60 FPS
  };

  // Fonction pour animer le texte
  const animateText = () => {
    if (!welcomeRef.current) return;

    // Supprime l'ancienne séparation (si elle existe) avant de recréer
    if (split) split.revert();

    // Sépare le texte en mots et caractères
    const newSplit = new SplitType(welcomeRef.current!, {
      types: 'words,chars',
    });
    setSplit(newSplit);

    // Animation GSAP : apparition avec décalage
    gsap.fromTo(
      newSplit.words,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.3, // Délai entre chaque caractère
        onStart: () => {
          newSplit.words?.forEach((word) =>
            scrambleText(word, word.innerText, 1),
          );
        },
      },
    );
  };

  // Animation au chargement

  return (
    <div
      className="flex justify-center items-center relative w-[100vw] h-[100vh] transition-height duration-1000"
      ref={mainWrapperRef}
    >
      <div className="opacity-0" ref={headerRef}>
        <Header />
      </div>
      <div
        className="absolute w-full h-full rounded-xl flex justify-center items-center"
        ref={wrapperImage}
      >
        {assets.map(({ src, alt, className }, index) => (
          <Image
            key={index}
            src={src}
            alt={alt}
            width={1000}
            height={1000}
            className={className}
          />
        ))}
      </div>

      <button
        ref={welcomeRef}
        className="z-10 absolute left-[400px] w-[200px] h-[50px]"
        onClick={handleClick}
        onPointerMove={animateText}
      >
        ( welcome )
      </button>
      <button
        ref={buttonRef}
        className="z-10 absolute right-[500px] w-[200px] h-[50px]"
        onClick={handleClick}
      >
        ( click to start )
      </button>

      <div
        className={`w-full grid grid-rows-10 grid-cols-10 gap-[20px] relative h-full`}
        ref={gridRef}
      >
        {/* <div className="w-full border-2 border-cyan-500 ">
          <Header />
        </div> */}
      </div>
    </div>
  );
}
