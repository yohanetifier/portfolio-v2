'use client';

import { ThemeContext } from '@/contexts/MenuProvider';
import { useParams } from 'next/navigation';
import React, { useContext } from 'react';

const Burger = () => {
  const { setIsOpen, isOpen } = useContext(ThemeContext);
  const { project } = useParams();
  const onProject = Boolean(project);

  // Menu ouvert (fond crème) = croix noire ; projet = blanc ; sinon gris
  const barColor = isOpen
    ? 'bg-[#12120f]'
    : onProject
      ? 'bg-white'
      : 'bg-gray-700';

  const bar = `absolute left-0 block h-[2px] w-full origin-center transition-all duration-300 ease-out ${barColor}`;

  return (
    <button
      type="button"
      className="absolute right-0 top-[50px] z-[110] flex h-[20px] w-[28px] cursor-pointer items-center justify-center border-0 bg-transparent p-0 md:hidden"
      onClick={() => setIsOpen(!isOpen)}
      aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
      aria-expanded={isOpen}
    >
      {/* 3 barres : haut + bas → croix ; milieu disparaît */}
      <span className="relative block h-[14px] w-[22px]">
        <span
          className={`${bar} top-0 ${
            isOpen ? 'translate-y-[6px] rotate-45' : 'translate-y-0 rotate-0'
          }`}
        />
        <span
          className={`${bar} top-[6px] ${
            isOpen ? 'scale-x-0 opacity-0' : 'scale-x-100 opacity-100'
          }`}
        />
        <span
          className={`${bar} top-[12px] ${
            isOpen ? '-translate-y-[6px] -rotate-45' : 'translate-y-0 rotate-0'
          }`}
        />
      </span>
    </button>
  );
};

export default Burger;
