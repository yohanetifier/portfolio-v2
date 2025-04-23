'use client';
import React, { useRef } from 'react';
import { animateText } from '@/common/utils/animateText';
import { FaArrowLeft } from 'react-icons/fa';
import { usePathname, useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const Header = () => {
  const workRef = useRef<HTMLParagraphElement | null>(null);
  const personalRef = useRef<HTMLAnchorElement | null>(null);
  const jobRef = useRef<HTMLParagraphElement | null>(null);
  const aboutRef = useRef<HTMLParagraphElement | null>(null);
  const contactRef = useRef<HTMLParagraphElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { project } = useParams();

  const handleClick = () => {
    if (pathname) {
      router.back();
    }
  };

  return (
    <>
      {pathname === '/' ? null : (
        <header
          className={`text-[8px] md:text-[16px] grid grid-cols-10 row-start-1 col-start-1 col-end-10 pt-[50px] absolute top-0 z-[100] h-[150px] w-[95%] left-1/2 transform -translate-x-1/2 transition-colors duration-500 ease-in-out ${project ? 'text-white' : 'text-black'}`}
        >
          {pathname && (
            <FaArrowLeft
              onClick={handleClick}
              className=" absolute bottom-0 w-[30px] h-[30px] cursor-pointer"
            />
          )}
          <div className="col-start-1 col-end-3 flex justify-between ">
            <Link
              // className="absolute left-[55px] cursor-pointer pointer-events-auto"
              ref={personalRef}
              href={'/'}
              onMouseEnter={() => animateText(personalRef.current!)}
            >
              Ncstr
            </Link>
            <p
              className="text-right justify-self-end cursor-pointer"
              ref={jobRef}
              onMouseEnter={() => animateText(jobRef.current!)}
            >
              Art director
            </p>
          </div>
          <p
            ref={workRef}
            className="col-start-3 col-end-5 row-start-1 justify-self-end relative right-[20px] cursor-pointer md:right-[-30px]"
            onMouseEnter={() => animateText(workRef.current!)}
          >
            Travaux
          </p>
          <p
            className="col-start-5 col-end-8 justify-self-end justify-items-end relative right-[20px] cursor-pointer"
            ref={aboutRef}
            onPointerEnter={() => animateText(aboutRef.current!)}
          >
            À propos
          </p>
          <p
            className="absolute right-[0px] top-[50px] cursor-pointer"
            // style={{ right: '55px', top: '50px', cursor: 'pointer' }}
            ref={contactRef}
            onPointerEnter={() => animateText(contactRef.current!)}
          >
            Contact
          </p>
        </header>
      )}
    </>
  );
};

export default Header;
