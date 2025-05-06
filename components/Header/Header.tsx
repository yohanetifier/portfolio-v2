'use client';
import React, { useContext, useRef } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { usePathname, useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ThemeContext } from '@/contexts/MenuProvider';
import Burger from '../Burger/Burger';

const Header = () => {
  const workRef = useRef<HTMLAnchorElement | null>(null);
  const personalRef = useRef<HTMLAnchorElement | null>(null);
  // const jobRef = useRef<HTMLParagraphElement | null>(null);
  const aboutRef = useRef<HTMLParagraphElement | null>(null);
  const contactRef = useRef<HTMLAnchorElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { project } = useParams();
  const { isOpen, setIsOpen } = useContext(ThemeContext);

  const handleClick = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      if (pathname) {
        router.back();
      }
    }
  };

  return (
    <>
      {pathname === '/' ? null : (
        <header
          className={`text-[8px] md:text-[16px] grid grid-cols-10 row-start-1 col-start-1 col-end-10 pt-[50px] absolute top-0 z-[100] h-[150px] w-[85%] md:w-[90%] left-1/2 transform -translate-x-1/2 transition-colors duration-500 ease-in-out ${project || isOpen ? 'text-white' : 'text-black'}`}
        >
          {pathname && (
            <FaArrowLeft
              onClick={handleClick}
              className=" absolute bottom-0 w-[30px] h-[30px] cursor-pointer"
            />
          )}
          <div className="col-start-1 col-end-3 flex justify-between ">
            <Link
              ref={personalRef}
              href={'/'}
              className="text-[16px]"
              // onMouseEnter={() => animateText(personalRef.current!)}
            >
              Yeti
            </Link>
            {/* <p
              className="text-right justify-self-end cursor-pointer"
              ref={jobRef}
              onMouseEnter={() => animateText(jobRef.current!)}
            >
              Art director
            </p> */}
          </div>
          <Link
            ref={workRef}
            className="col-start-3 col-end-5 row-start-1 justify-self-end relative right-[20px] cursor-pointer md:right-[-30px] hidden md:block"
            // onMouseEnter={() => animateText(workRef.current!)}
            href={'/work'}
          >
            Works
          </Link>
          <p
            className="col-start-5 col-end-8 justify-self-end justify-items-end relative right-[20px] cursor-pointer hidden md:block"
            ref={aboutRef}
            // onPointerEnter={() => animateText(aboutRef.current!)}
          >
            About
          </p>
          <Link
            className="absolute right-[0px] top-[50px] cursor-pointer hidden md:block"
            ref={contactRef}
            // onPointerEnter={() => animateText(contactRef.current!)}
            href={'/contact'}
          >
            Contact
          </Link>
          <Burger />
        </header>
      )}
    </>
  );
};

export default Header;
