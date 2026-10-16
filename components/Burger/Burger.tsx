'use client';

import { ThemeContext } from '@/contexts/MenuProvider';
import React, { useContext } from 'react';

const Burger = () => {
  const { setIsOpen, isOpen } = useContext(ThemeContext);
  // Fermé : blanc, l'en-tête est en mix-blend-difference → noir sur le papier,
  // contrasté sur les images. Ouvert : l'en-tête ne mélange plus → croix encre
  const barColor = isOpen ? 'bg-[#12120f]' : 'bg-white';

  // 2 barres fines, 6 px d'écart : elles se rejoignent au centre et se croisent
  const bar = `block h-[1.5px] w-[22px] transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${barColor}`;

  return (
    <button
      type="button"
      // Zone tactile de 44 px, décalée pour aligner les barres sur la marge
      className="absolute right-[-11px] top-[38px] z-[110] flex h-[44px] w-[44px] cursor-pointer flex-col items-center justify-center gap-[6px] border-0 bg-transparent p-0 outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-6px] focus-visible:outline-current md:hidden"
      onClick={() => setIsOpen(!isOpen)}
      aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
      aria-expanded={isOpen}
    >
      <span
        className={`${bar} ${isOpen ? 'translate-y-[3.75px] rotate-45' : ''}`}
      />
      <span
        className={`${bar} ${isOpen ? '-translate-y-[3.75px] -rotate-45' : ''}`}
      />
    </button>
  );
};

export default Burger;
