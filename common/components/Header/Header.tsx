'use client';
import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';

const Header = () => {
  const workRef = useRef<HTMLParagraphElement | null>(null);
  const personalRef = useRef<HTMLParagraphElement | null>(null);
  const [split, setSplit] = useState<SplitType | null>(null); // Stocke l'instance SplitType

  // Fonction pour animer le texte
  const animateText = () => {
    if (!personalRef.current) return;

    // Supprime l'ancienne séparation (si elle existe) avant de recréer
    if (split) split.revert();

    // Sépare le texte en mots et caractères
    const newSplit = new SplitType(personalRef.current!, {
      types: 'words,chars',
    });
    setSplit(newSplit);

    // Animation GSAP : apparition avec décalage
    gsap.from(newSplit.chars, {
      opacity: 0,
      y: 20,
      duration: 1,
      stagger: 0.05, // Délai entre chaque caractère
      ease: 'power2.out',
      delay: 2,
    });
  };

  // Animation au chargement
  useEffect(() => {
    animateText();
  }, []);

  return (
    <header
      className="grid grid-cols-10 row-start-1 col-start-1 col-end-10 w-full"
      style={{
        paddingTop: '50px',
        position: 'absolute',
        top: '0px',
      }}
    >
      <div className="pl-[55px] col-start-2 col-end-3 flex justify-between ">
        <p className="absolute" style={{ left: '55px' }} ref={personalRef}>
          Ncstr
        </p>
        <p className="text-right" style={{ justifySelf: 'end' }}>
          Art director
        </p>
      </div>
      <p
        ref={workRef}
        className="col-start-3 col-end-5 row-start-1"
        style={{
          justifySelf: 'end',
          position: 'relative',
          right: '20px',
        }}
      >
        Travaux
      </p>
      <p
        className="col-start-5 col-end-8 justify-self-end"
        style={{ justifySelf: 'end', position: 'relative', right: '20px' }}
      >
        À propos
      </p>
      <p className="absolute" style={{ right: '55px', top: '50px' }}>
        Contact
      </p>
    </header>
  );
};

export default Header;
