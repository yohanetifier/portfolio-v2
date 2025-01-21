'use client';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Flip } from 'gsap/all';
import Image from 'next/image';
import React, { useEffect, useRef } from 'react';

gsap.registerPlugin(Flip);

export default function Loading() {
  const buttonRef = useRef<any | null>(null);
  const wrapperImage = React.useRef<any>(null);
  const mainWrapperRef = React.useRef<HTMLDivElement>(null);
  const gridRef = React.useRef<HTMLDivElement>(null);
  const [showWrapper, setShowWrapper] = React.useState(true);
  const [isGridIsVisible, setIsGridIsVisible] = React.useState(false);
  const titleRef = React.useRef<HTMLHeadingElement | null>(null);
  const [imageArrived, setImageArrived] = React.useState(false);
  let clientX;
  let clientY;
  let arrayOfImages: HTMLElement[];
  const tl = gsap.timeline({});

  useEffect(() => {
    const arrayOfImages: HTMLElement[] = Array.from(
      wrapperImage.current!.children,
    ) as HTMLElement[];
    if (wrapperImage.current) {
      // const card = Flip.getState(buttonRef.current);
      // wrapperImage.current?.appendChild(card);
      // const cardSecond = Flip.getState(arrayOfImages[1]);
      // const cardThird = Flip.getState(arrayOfImages[2]);
      // Flip.from(card, {
      //   duration: 1,
      // });
    }
    // tl.from(cardSecond, {
    //   duration: 1,
    //   gridColumnStart: '3',
    //   gridColumnEnd: '4',
    //   gridRowStart: '1',
    //   gridRowEnd: '1',
    // }).from(cardThird, {
    //   duration: 1,
    //   gridColumnStart: '5',
    //   gridColumnEnd: '6',
    //   gridRowStart: '1',
    //   gridRowEnd: '1',
    // });
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
      // window.addEventListener('mousemove', (e) => {
      //   // clientX = e.clientX;
      //   // clientY = e.clientY;
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
      // });

      window.addEventListener('mousemove', animateImageWithMouseMove);
      return () => {
        window.removeEventListener('mousemove', animateImageWithMouseMove);
      };
    }
    // flex justify-center items-center relative w-full h-[100vh]
  }, [imageArrived]);

  const gridClasses = [
    'col-start-1 col-end-2 row-start-1 row-end-2 border-2 border-red-500 w-full h-[200px]',
    'col-start-3 col-end-4 row-start-1 row-end-2 border-2 border-red-500 w-full h-[200px]',
    'col-start-5 col-end-6 row-start-1 row-end-2 border-2 border-red-500 w-full h-[200px]',
  ];

  const handleClick = () => {
    setIsGridIsVisible(true);
    const state = Flip.getState(wrapperImage.current?.children);
    const children = Array.from(wrapperImage.current.children) as HTMLElement[];
    children.forEach((child, index) => {
      child.className = gridClasses[index] || '';
    });
    gridRef.current!.append(
      ...Array.from(wrapperImage.current.children as HTMLCollection),
    );
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

  return (
    <div
      className="flex justify-center items-center relative w-full h-[100vh]"
      ref={mainWrapperRef}
    >
      <div className="absolute w-[35vw] h-[90vh] rounded-xl" ref={wrapperImage}>
        {['desktop.jpg', 'tesla.jpeg', 'holidays.jpg'].map((source, index) => (
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
        className={`w-full grid grid-rows-5 grid-cols-5 gap-[20px] relative `}
        ref={gridRef}
      ></div>
    </div>
  );
}
