'use client';
import React, { useContext, useRef } from 'react';
import { animateText } from '@/common/utils/animateText';
import { FaArrowLeft } from 'react-icons/fa';
import { usePathname, useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import MenuProvider, { ThemeContext } from '@/contexts/MenuProvider';

const Header = () => {
  const workRef = useRef<HTMLParagraphElement | null>(null);
  const personalRef = useRef<HTMLAnchorElement | null>(null);
  const jobRef = useRef<HTMLParagraphElement | null>(null);
  const aboutRef = useRef<HTMLParagraphElement | null>(null);
  const contactRef = useRef<HTMLParagraphElement | null>(null);
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
          className={`text-[8px] md:text-[16px] grid grid-cols-10 row-start-1 col-start-1 col-end-10 pt-[50px] absolute top-0 z-[100] h-[150px] w-[95%] left-1/2 transform -translate-x-1/2 transition-colors duration-500 ease-in-out ${project || isOpen ? 'text-white' : 'text-black'}`}
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
          <p
            ref={workRef}
            className="col-start-3 col-end-5 row-start-1 justify-self-end relative right-[20px] cursor-pointer md:right-[-30px] hidden md:block"
            onMouseEnter={() => animateText(workRef.current!)}
          >
            Works
          </p>
          <p
            className="col-start-5 col-end-8 justify-self-end justify-items-end relative right-[20px] cursor-pointer hidden md:block"
            ref={aboutRef}
            onPointerEnter={() => animateText(aboutRef.current!)}
          >
            About
          </p>
          <p
            className="absolute right-[0px] top-[50px] cursor-pointer hidden md:block"
            // style={{ right: '55px', top: '50px', cursor: 'pointer' }}
            ref={contactRef}
            onPointerEnter={() => animateText(contactRef.current!)}
          >
            Contact
          </p>
          <div
            className=" absolute right-[0px] top-[50px] cursor-pointer w-[30px] h-[20px] flex flex-col justify-between visible md:hidden z-[100]"
            onClick={() => setIsOpen(!isOpen)}
            style={{ zIndex: '100' }}
          >
            <span
              className={`transition-transform duration-300 block h-[1px] border-2 border-gray-700 ${isOpen ? 'translate-y-[10px] rotate-[45deg]' : 'translate-y-0 rotate-0'}`}
            ></span>
            <span
              className={`transition-opacity duration-300 block h-[1px] border-2 border-gray-700 ${isOpen ? 'opacity-0' : 'opacity-1'}`}
            ></span>
            <span
              className={`transition-transform duration-300 block h-[1px] border-2 border-gray-700  ${isOpen ? 'translate-y-[-6px] rotate-[-45deg]' : 'translate-y-0 rotate-0'} `}
            ></span>
          </div>
        </header>
      )}
    </>
  );
};

export default Header;
