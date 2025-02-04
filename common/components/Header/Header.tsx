import React, { useEffect, useRef } from 'react';

interface Props {}

const Header = (props: Props) => {
  const workRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    // workRef.current!.style.justifySelf = 'end';
  }, []);

  return (
    <header className="grid grid-rows-10 grid-cols-15 gap-[20px] relative">
      <div className="col-start-1 col-end-2 flex border-2 border-red-500">
        <p className="">Ncstr</p>
        <p className="" style={{ justifySelf: 'end' }}>
          Art director
        </p>
      </div>
      <p
        ref={workRef}
        className="border-2 border-red-500 col-start-3 col-end-4 justify-self-end w-[300px]"
        // style={{
        //   justifySelf: 'end',
        // }}
      >
        Travaux
      </p>
      <p className="col-start-4 col-end-6 border-2 border-blue-500">À propos</p>
      <p className="col-start-5">Contact</p>
    </header>
  );
};

export default Header;
