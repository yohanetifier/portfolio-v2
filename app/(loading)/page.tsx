'use client';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Image from 'next/image';
import React, { useEffect } from 'react';

export default function Loading() {
  const wrapperImage = React.useRef<HTMLDivElement | null>(null);
  const titleRef = React.useRef<HTMLHeadingElement | null>(null);
  const [imageArrived, setImageArrived] = React.useState(false);
  let clientX;
  let clientY;
  let arrayOfImages: HTMLElement[];
  // if (wrapperImage.current) {
  //   arrayOfImages = Array.from(wrapperImage.current!.children) as HTMLElement[];
  //   console.log('arrayOfImages', arrayOfImages);
  // }

  useEffect(() => {
    const arrayOfImages: HTMLElement[] = Array.from(
      wrapperImage.current!.children,
    ) as HTMLElement[];
    const tl = gsap.timeline({});
    tl.fromTo(
      titleRef.current,
      { y: '20vh', opacity: 0.5 },
      { y: 0, opacity: 1 },
    )
      .fromTo(
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
  }, []);

  useEffect(() => {
    console.log('imageArrived', imageArrived);
    if (imageArrived) {
      console.log('imageArrived', imageArrived);
      window.addEventListener('mousemove', (e) => {
        clientX = e.clientX;
        clientY = e.clientY;
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
        // arrayOfImages[2].style.top = `${normalizeSize * 10}px`;
      });
    }
  }, [clientX, clientY, imageArrived]);

  return (
    <div className="flex justify-center items-center relative w-full h-[100vh]">
      <div
        className="  w-[35vw] h-[90vh] rounded-xl relative"
        ref={wrapperImage}
      >
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
      <div className="w-full flex absolute bottom-0 justify-center items-center">
        <h2 className="text-[200px]" ref={titleRef}>
          CREATIVE AGENCY
        </h2>
        <span className=" w-[30px] h-[30px] bg-purple-200 rounded-full"></span>
      </div>
    </div>
  );
}
