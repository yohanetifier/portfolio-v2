import React from 'react';

interface Props {}

const Header = (props: Props) => {
  return (
    <header className="grid grid-rows-10 grid-cols-10 gap-[20px] relative">
      <div className="col-start-1 col-end-2 flex border-2 border-red-500">
        <p className="">Ncstr</p>
        <p className="">Art director</p>
      </div>
      <p className="col-start-3 col-end-4 border-2 border-red-500 relative left-[100px] w-[300px]">
        Travaux
      </p>
      <p className="col-start-7 col-end-8 border-2 border-cyan-500 ">
        À propos
      </p>
      <p className="col-start-9 col-end-11 border-2 border-cyan-500">Contact</p>
    </header>
  );
};

export default Header;
