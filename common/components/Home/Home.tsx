'use client';
import Button from '@/common/components/Button/Button';
import { animateText } from '@/common/utils/animateText';
import { Project } from '@/src/models/Project';
import gsap from 'gsap';
import { Flip, ScrollTrigger } from 'gsap/all';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef } from 'react';

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
  // const gridRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  // const [showWrapper, setShowWrapper] = React.useState(true);
  // const titleRef = useRef<HTMLHeadingElement | null>(null);
  // const [imageArrived, setImageArrived] = useState(false);
  const tl = gsap.timeline({});
  const router = useRouter();
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
    'col-start-3 col-end-5 row-start-3 w-[20.208vw] h-[24.219vw] relative right-[6.25vw] bottom-[5.208vw] z-[10]',
    'col-start-6 col-end-9 row-start-4 w-[20.208vw] h-[24.219vw] relative left-[5.208vw] bottom-[5.208vw] z-[10]',
    'col-start-5 col-end-8 row-start-2 w-[28.542vw] h-[18.854vw] relative left-[6.25vw] bottom-[5.208vw]',
    'col-start-7 col-end-9 row-start-4 w-[20.208vw] h-[24.219vw] relative top-[7.813vw]',
    'col-start-3 col-end-5 row-start-5 w-[20.208vw] h-[24.219vw] relative bottom-[3.385vw]',
    'col-start-2 col-end-5 row-start-7 w-[28.542vw] h-[18.854vw]',
    'col-start-7 col-end-9 row-start-8 w-[20.208vw] h-[24.219vw] relative bottom-[5.208vw]',
  ];

  const handleClick = () => {
    const grid = document.getElementById('grid');
    document.body.style.overflow = 'visible';
    // mainWrapperRef.current!.style.height = '300vh';
    // grid!.style.height = '300vh';
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
    // const thirdLastChildren = Array.from(grid!.children).slice(-3);
    // thirdLastChildren.forEach((children) => {
    //   (children as HTMLElement).style.opacity = '0';
    // });

    Flip.from(state, {
      duration: 1,
      ease: 'power2.inOut',
      stagger: 0.1,
      // onUpdate: () => {
      //   wrapperImage.current!.style.display = 'none';
      //   ScrollTrigger.update();
      // },
      onComplete: () => {
        router.push(`/work`, { scroll: false });
        // handleScroll();
        // gsap.to(
        //   [thirdLastChildren[0], thirdLastChildren[1], thirdLastChildren[2]],
        //   { opacity: 1 },
        // );
        gsap.to(headerRef.current, { opacity: 1 });
      },
    });
  };

  const startingClass = [
    {
      className: `w-[16.641vw] h-[19.943vw] absolute right-[50%] rotate-[-14deg] z-[7]`,
    },
    {
      className: `w-[16.641vw] h-[19.943vw] absolute top-[48%] lg:top-[40%] z-[6]`,
    },
    {
      className:
        'w-[24.573vw] h-[15.526vw] rotate-[8deg] absolute top-[42%] lg:top-[30%] z-[5]',
    },
    {
      className:
        'w-[16.641vw] h-[19.943vw] absolute top-[40%] lg:top-[25%] z-10 rotate-[1deg] z-[4]',
    },
    {
      className:
        'w-[16.641vw] h-[19.943vw] absolute top-[25%] z-10 rotate-[1deg] z-[4]',
    },
    {
      className: 'opacity-0',
    },
    {
      className: 'opacity-0',
    },
    {
      className: 'opacity-0',
    },
  ];

  useEffect(() => {
    const grid = document.getElementById('grid');
    grid!.style.transform = 'scale(1)';
  }, []);

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
          // className="right-[0px] lg:right-[16.042vw]"
        />
      </div>
      {/* <Button
        onClick={handleClick}
        onMouseEnter={() => animateText(welcomeRef.current!)}
        title={'welcome'}
        ref={welcomeRef}
        className="left-[-20px] lg:left-[15.833vw]"
      />
      <Button
        onClick={handleClick}
        onMouseEnter={() => animateText(buttonRef.current!)}
        title={'click to start'}
        ref={buttonRef}
        className="right-[0px] lg:right-[16.042vw]"
      /> */}
    </div>
  );
}
