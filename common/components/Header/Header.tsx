import React from 'react';

interface Props {}

const Header = (props: Props) => {
  return (
    <div className="border-2 border-red-400 flex w-[100vw] col-start-1 col-end-10">
      <p className="w-[66px]">Ncstr</p>
      <p>Art director</p>
      <p>Works</p>
      <p>About me</p>
      <p>Contact</p>
    </div>
  );
};

export default Header;
