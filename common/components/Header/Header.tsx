import React from 'react';

interface Props {}

const Header = (props: Props) => {
  return (
    <div className="absolute top-[5px] left-0 border-2 border-red-400 flex justify-between w-full">
      <p className="border-2 border-green-500">Ncstr</p>
      <p className="w-[334px] border-2 border-cyan-500">Art director</p>
      <p>Works</p>
      <p>About me</p>
      <p>Contact</p>
    </div>
  );
};

export default Header;
