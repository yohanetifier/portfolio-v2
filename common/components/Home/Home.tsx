'use client';
import Button from '@/common/components/Button/Button';
import { animateText } from '@/common/utils/animateText';
import { Project } from '@/src/models/Project';
// import { usePortfolioViewModel } from '@/src/viewmodels/PortfolioViewModel';
import gsap from 'gsap';
import { Flip, ScrollTrigger } from 'gsap/all';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useRef } from 'react';

gsap.registerPlugin(Flip, ScrollTrigger);

export default function Home({
  projects,
}: {
  projects: Pick<Project, 'featuredImage'>[];
}) {
  //   const { projects } = usePortfolioViewModel();
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
    'col-start-3 col-end-5 row-start-3 w-[20.208vw] h-[24.219vw] relative right-[120px] bottom-[100px] z-[10]',
    'col-start-6 col-end-9 row-start-4 w-[20.208vw] h-[24.219vw] relative bottom-[100px] left-[100px] z-[10]',
    'col-start-5 col-end-8 row-start-2 w-[28.542vw] h-[18.854vw] relative left-[120px] bottom-[100px]',
    'col-start-7 col-end-9 row-start-4 w-[20.208vw] h-[24.219vw] relative top-[150px]',
    'col-start-3 col-end-5 row-start-5 w-[20.208vw] h-[24.219vw] relative bottom-[65px]',
    'col-start-2 col-end-5 row-start-7 w-[28.542vw] h-[18.854vw]',
    'col-start-7 col-end-9 row-start-8 w-[20.208vw] h-[24.219vw] relative bottom-[100px]',
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
        router.push(`/work`);
        // handleScroll();
        // gsap.to(
        //   [thirdLastChildren[0], thirdLastChildren[1], thirdLastChildren[2]],
        //   { opacity: 1 },
        // );
        gsap.to(headerRef.current, { opacity: 1 });
      },
    });
  };

  // const handleScroll = () => {
  //   const arrayOfImages = Array.from(gridRef.current!.children);
  //   arrayOfImages.map((image) => {
  //     gsap.to(image, {
  //       scaleX: 0,
  //       transformOrigin: 'center top',
  //       scrollTrigger: {
  //         trigger: image,
  //         start: 'top top',
  //         end: 'bottom top',
  //         scrub: true,
  //         // markers: true,
  //       },
  //     });
  //   });
  // };

  const startingClass = [
    {
      className: `w-[16.641vw] h-[19.943vw] absolute right-[50%] rotate-[-14deg] z-[7]`,
    },
    {
      className: `w-[16.641vw] h-[19.943vw] absolute top-[40%] z-[6]`,
    },
    {
      className:
        'w-[24.573vw] h-[15.526vw] rotate-[8deg] absolute top-[30%] z-[5]',
    },
    {
      className:
        'w-[16.641vw] h-[19.943vw] absolute top-[25%] z-10 rotate-[1deg] z-[4]',
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

  const handleTransition = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    title: string,
  ) => {
    const fullscreen = document.getElementById('fullscreen');
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
    fullscreen!.append(e.currentTarget);
    e.currentTarget.className = 'absolute w-screen h-screen ';

    const tl = gsap.timeline({});

    tl.to(childatTheBottom, {
      y: '100vh',
      rotate: -10,
      duration: 1,
      onComplete: () => {
        router.push(`/work/${title}`);
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
    });
  };

  return (
    <div
      className="flex justify-center items-center relative w-[100vw] h-[100vh] transition-height duration-1000"
      ref={mainWrapperRef}
    >
      {/* <div className="opacity-0" ref={headerRef}>
        <Header />
      </div> */}
      <div
        className="absolute w-full h-full rounded-xl flex justify-center items-center"
        ref={wrapperImage}
      >
        {projects.map(({ featuredImage }, index) => (
          <div
            key={index}
            // href={`/work/${title}`}
            className={startingClass[index].className}
            // onClick={(e) => handleTransition(e, title)}
          >
            <Image
              src={featuredImage.src}
              alt={featuredImage.alt}
              width={1000}
              height={1000}
              className="w-full h-full"
            />
          </div>
        ))}
      </div>
      <Button
        onClick={handleClick}
        onMouseEnter={() => animateText(welcomeRef.current!)}
        title={'welcome'}
        ref={welcomeRef}
        className="z-10 absolute left-[400px] w-[200px] h-[50px]"
      />

      {/* <Link
        href={'/work/hinderer'}
        className="z-10 absolute left-[400px] w-[200px] h-[50px]"
      >
        click
      </Link> */}
      <Button
        onClick={() => null}
        onMouseEnter={() => animateText(buttonRef.current!)}
        title={'click to start'}
        ref={buttonRef}
        className="z-10 absolute right-[500px] w-[200px] h-[50px]"
      />

      {/* <div
        className={`w-full grid grid-rows-10 grid-cols-10 gap-[20px] relative h-full z-[2] border-2 border-orange-500`}
        ref={gridRef}
      ></div> */}
      {/* <div className="fixed top-0 w-screen h-screen z-0" ref={fullscreenRef}>
        {' '}
      </div> */}
    </div>
  );
}
