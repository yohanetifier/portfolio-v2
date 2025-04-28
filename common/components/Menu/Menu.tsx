'use client';
import { ThemeContext } from '@/contexts/MenuProvider';
import React, { useContext } from 'react';

const Menu = () => {
  const { isOpen } = useContext(ThemeContext);
  return (
    <div
      className={`fixed top-0 w-screen h-screen flex flex-col pt-[200px] transition-transform duration-300 bg-gray-700 z-[20] ${isOpen ? 'translate-y-0' : 'translate-y-[-100vh]'} `}
    >
      <p
        className={`text-[7.813vw] uppercase transition-opacity duration-500  ${isOpen ? 'opacity-1 delay-300' : 'opacity-0'}`}
      >
        Works
      </p>
      <p
        className={`text-[7.813vw] uppercase transition-opacity duration-500 ${isOpen ? 'opacity-1 delay-[600ms]' : 'opacity-0'}`}
      >
        About
      </p>
      <p
        className={`text-[7.813vw] uppercase transition-opacity duration-500 ${isOpen ? 'opacity-1 delay-[900ms]' : 'opacity-0'}`}
      >
        Contact
      </p>
    </div>
  );
};

export default Menu;
