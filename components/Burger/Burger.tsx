'use client';

import { ThemeContext } from '@/contexts/MenuProvider';
import { useHeaderContext } from '@/contexts/HeaderContext';
import React, { useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const Burger = () => {
  const { setIsOpen, isOpen } = useContext(ThemeContext);
  const { isHeaderVisible } = useHeaderContext();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Fermé : blanc en mix-blend-difference → noir sur le papier, contrasté sur
  // les images. Ouvert : plus de mélange (fond papier du menu) → croix encre
  const barColor = isOpen ? 'bg-[#12120f]' : 'bg-white';

  // 2 barres fines, 6 px d'écart : elles se rejoignent au centre et se croisent
  const bar = `block h-[1.5px] w-[22px] transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${barColor}`;

  if (!mounted) return null;

  // Dans le body, fixe : l'en-tête défile avec la page, le burger reste à portée
  // de pouce. (Un fixed dans l'en-tête, centré par un transform, défilerait avec.)
  // Même place qu'avant : marge droite du site (7,5 %), zone tactile de 44 px
  // décalée de 11 px pour aligner les barres sur cette marge.
  return createPortal(
    <button
      type="button"
      className={`fixed right-[calc(7.5%-11px)] top-[38px] z-[110] flex h-[44px] w-[44px] cursor-pointer flex-col items-center justify-center gap-[6px] border-0 bg-transparent p-0 outline-none transition-opacity duration-500 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-6px] focus-visible:outline-current md:hidden ${
        isOpen ? '' : 'mix-blend-difference'
      } ${isHeaderVisible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
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
    </button>,
    document.body,
  );
};

export default Burger;
