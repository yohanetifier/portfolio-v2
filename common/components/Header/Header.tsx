import React, { useRef } from 'react';

const Header = () => {
  const workRef = useRef<HTMLParagraphElement | null>(null);

  return (
    <header
      className="grid grid-cols-10 row-start-1 col-start-1 col-end-10 w-full"
      style={{
        paddingTop: '50px',
        position: 'absolute',
        top: '0px',
      }}
    >
      <div className="pl-[55px] col-start-2 col-end-3 flex justify-between ">
        <p className="absolute" style={{ left: '55px' }}>
          Ncstr
        </p>
        <p className="text-right" style={{ justifySelf: 'end' }}>
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
        }}
      >
        Travaux
      </p>
      <p
        className="col-start-5 col-end-8 justify-self-end"
        style={{ justifySelf: 'end', position: 'relative', right: '20px' }}
      >
        À propos
      </p>
      <p className="absolute" style={{ right: '55px', top: '50px' }}>
        Contact
      </p>
    </header>
  );
};

export default Header;
