'use client';
import React, { useRef } from 'react';
import { animateText } from '@/common/utils/animateText';

const Header = () => {
  const workRef = useRef<HTMLParagraphElement>(null);
  const personalRef = useRef<HTMLParagraphElement>(null);
  const jobRef = useRef<HTMLParagraphElement>(null);
  const aboutRef = useRef<HTMLParagraphElement>(null);
  const contactRef = useRef<HTMLParagraphElement>(null);

  return (
    <header className="text-[8px] md:text-[16px] grid grid-cols-10 row-start-1 col-start-1 col-end-10 w-full pt-[50px] absolute top-0 z-10">
      <div className="pl-[55px] col-start-2 col-end-3 flex justify-between ">
        <p
          className="absolute left-[55px] cursor-pointer"
          ref={personalRef}
          onMouseEnter={() => animateText(personalRef.current!)}
        >
          Ncstr
        </p>
        <p
          className="text-right justify-self-end cursor-pointer"
          // style={{ justifySelf: 'end', cursor: 'pointer' }}
          ref={jobRef}
          onMouseEnter={() => animateText(jobRef.current!)}
        >
          Art director
        </p>
      </div>
      <p
        ref={workRef}
        className="col-start-3 col-end-5 row-start-1 justify-self-end relative right-[20px] cursor-pointer md:right-[-30px]"
        // style={{
        //   justifySelf: 'end',
        //   position: 'relative',
        //   right: '20px',
        //   cursor: 'pointer',
        // }}
        onMouseEnter={() => animateText(workRef.current!)}
      >
        Travaux
      </p>
      <p
        className="col-start-5 col-end-8 justify-self-end justify-items-end relative right-[20px] cursor-pointer"
        // style={{
        //   justifySelf: 'end',
        //   position: 'relative',
        //   right: '20px',
        //   cursor: 'pointer',
        // }}
        ref={aboutRef}
        onPointerEnter={() => animateText(aboutRef.current!)}
      >
        À propos
      </p>
      <p
        className="absolute right-[55px] top-[50px] cursor-pointer"
        style={{ right: '55px', top: '50px', cursor: 'pointer' }}
        ref={contactRef}
        onPointerEnter={() => animateText(contactRef.current!)}
      >
        Contact
      </p>
    </header>
  );
};

export default Header;
