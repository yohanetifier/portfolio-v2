import React from 'react';

interface Props {}

const Header = (props: Props) => {
  return (
    <header className="px-[100px] border-2 border-red-400 flex justify-between w-full font-[16px]">
      <div>
        <p className="">Ncstr</p>
        <p className="">Art director</p>
      </div>
      <p>Works</p>
      <p>About me</p>
      <p>Contact</p>
    </header>
  );
};

export default Header;
