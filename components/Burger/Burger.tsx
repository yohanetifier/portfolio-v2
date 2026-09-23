'use client';

import { ThemeContext } from '@/contexts/MenuProvider';
import { useParams } from 'next/navigation';
import React, { useContext } from 'react';

const Burger = () => {
  const { setIsOpen, isOpen } = useContext(ThemeContext);
  const { project } = useParams();
  const onProject = Boolean(project);

  // Menu ouvert (fond crème) = croix noire ; projet = blanc ; sinon gris
  const stroke = isOpen
    ? 'border-[#12120f] bg-[#12120f]'
    : onProject
      ? 'border-white bg-white'
      : 'border-gray-700 bg-gray-700';

  const lineClass = `absolute left-0 right-0 block h-[2px] transition-all duration-300 ease-out ${stroke}`;

  return (
    <button
      type="button"
      className="absolute right-0 top-[50px] z-[110] flex h-[20px] w-[28px] cursor-pointer items-center justify-center border-0 bg-transparent p-0 md:hidden"
      onClick={() => setIsOpen(!isOpen)}
      aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
      aria-expanded={isOpen}
    >
      <span className="relative block h-full w-full">
        <span
          className={`${lineClass} top-0 ${
            isOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'translate-y-0 rotate-0'
          }`}
        />
        <span
          className={`${lineClass} top-1/2 -translate-y-1/2 ${
            isOpen ? 'scale-x-0 opacity-0' : 'scale-x-100 opacity-100'
          }`}
        />
        <span
          className={`${lineClass} bottom-0 ${
            isOpen
              ? 'bottom-auto top-1/2 -translate-y-1/2 -rotate-45'
              : 'translate-y-0 rotate-0'
          }`}
        />
      </span>
    </button>
  );
};

export default Burger;
