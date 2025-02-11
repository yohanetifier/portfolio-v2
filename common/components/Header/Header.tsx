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
    <header
      className="grid grid-cols-10 row-start-1 col-start-1 col-end-10 w-full"
      style={{
        paddingTop: '50px',
        position: 'absolute',
        top: '0px',
        zIndex: '10',
      }}
    >
      <div className="pl-[55px] col-start-2 col-end-3 flex justify-between ">
        <p
          className="absolute"
          style={{ left: '55px', cursor: 'pointer' }}
          ref={personalRef}
          onMouseEnter={() => animateText(personalRef.current!)}
        >
          Ncstr
        </p>
        <p
          className="text-right"
          style={{ justifySelf: 'end', cursor: 'pointer' }}
          ref={jobRef}
          onMouseEnter={() => animateText(jobRef.current!)}
        >
          Art director
        </p>
      </div>
      <p
        ref={workRef}
        className="col-start-3 col-end-5 row-start-1"
        style={{
          justifySelf: 'end',
          position: 'relative',
          right: '20px',
          cursor: 'pointer',
        }}
        onMouseEnter={() => animateText(workRef.current!)}
      >
        Travaux
      </p>
      <p
        className="col-start-5 col-end-8 justify-self-end"
        style={{
          justifySelf: 'end',
          position: 'relative',
          right: '20px',
          cursor: 'pointer',
        }}
        ref={aboutRef}
        onPointerEnter={() => animateText(aboutRef.current!)}
      >
        À propos
      </p>
      <p
        className="absolute"
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
