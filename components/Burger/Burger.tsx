import { ThemeContext } from '@/contexts/MenuProvider';
import { useParams } from 'next/navigation';
import React, { useContext } from 'react';

const Burger = () => {
  const { setIsOpen, isOpen } = useContext(ThemeContext);
  const { project } = useParams();
  const className = `transition-all duration-300 block h-[1px] border-2 ${isOpen || project ? 'border-white bg-white' : 'border-gray-700'}`;
  return (
    <div
      className=" absolute right-[0px] top-[50px] cursor-pointer w-[30px] h-[20px] flex flex-col justify-between visible md:hidden z-[100]"
      onClick={() => setIsOpen(!isOpen)}
      style={{ zIndex: '100' }}
    >
      <span
        className={`${className} ${isOpen ? 'translate-y-[10px] rotate-[45deg]' : 'translate-y-0 rotate-0'}`}
      ></span>
      <span
        className={`${className} ${isOpen ? 'opacity-0' : 'opacity-1'}`}
      ></span>
      <span
        className={`${className}  ${isOpen ? 'translate-y-[-6px] rotate-[-45deg]' : 'translate-y-0 rotate-0'} `}
      ></span>
    </div>
  );
};

export default Burger;
