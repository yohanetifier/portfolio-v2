import React, { useEffect, useRef } from 'react';

interface Props {}

const Header = (props: Props) => {
  const workRef = useRef<HTMLParagraphElement | null>(null);

  // useEffect(() => {
  //   workRef.current!.style.justifySelf = 'end';
  // }, []);

  return (
    <header className="absolute top-0 grid grid-cols-10 row-start-1 col-start-1 col-end-10 w-full">
      <div className="pl-[55px] col-start-2 col-end-3 flex justify-between ">
        <p className="absolute left-[50px]" style={{ left: '55px' }}>
          Ncstr
        </p>
        <p className="text-right" style={{ justifySelf: 'end' }}>
          Art director
        </p>
      </div>
      <p
        ref={workRef}
        className="col-start-3 col-end-5 row-start-1 w-[300px]"
        style={{
          justifySelf: 'end',
        }}
      >
        Travaux
      </p>
      <p
        className="col-start-5 col-end-8 justify-self-end"
        style={{ justifySelf: 'end' }}
      >
        À propos
      </p>
      <p className="absolute" style={{ right: '55px' }}>
        Contact
      </p>
    </header>
  );
};

export default Header;
