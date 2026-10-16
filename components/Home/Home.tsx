'use client';
import Button from '@/components/Button/Button';
import { animateText } from '@/common/utils/animateText';
import { Project } from '@/src/models/Project';
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { useHeaderContext } from '@/contexts/HeaderContext';
import { useThreeJsContext } from '@/contexts/ThreeJsContext';
import { lockScroll } from '@/utils/scroll';
import gsap from 'gsap';
import IntroGridPhantom from '../IntroPhantomGrid/IntroPhantomGrid';
import WorklistPhantomGrid from '../WorklistPhantomGrid/WorklistPhantomGrid';
import { INTRO } from '@/utils/introTiming';
import { OPEN_WHOOSH, playSound, setSoundEnabled } from '@/utils/playSound';

export default function Home({
  projects,
}: {
  projects: Pick<Project, 'featuredImage' | 'title'>[];
}) {
  const withSoundRef = useRef<HTMLButtonElement>(null);
  const withoutSoundRef = useRef<HTMLButtonElement>(null);
  const titlesRef = useRef<HTMLDivElement>(null);
  const mainWrapperRef = useRef<HTMLDivElement>(null);
  const { setHeaderVisible } = useHeaderContext();
  const {
    setProjects,
    setFromHome,
    setScrollY,
    setIsAnimating,
    setIsLostPage,
    projectsHomeCoords,
    introReady,
  } = useThreeJsContext();

  // Le clic sert aussi de geste user : le navigateur autorise le son à partir d'ici
  const handleClick = (withSound: boolean) => {
    setSoundEnabled(withSound);
    playSound(OPEN_WHOOSH);
    setFromHome(true);
    lockScroll();
    setIsAnimating(true);
    if (titlesRef.current) {
      gsap.to(titlesRef.current, {
        opacity: 0,
        duration: 1,
        ease: 'power2.inOut',
        overwrite: 'auto',
      });
    }
  };

  useEffect(() => {
    setIsLostPage(false);
  }, [setIsLostPage]);

  useEffect(() => {
    setHeaderVisible(false);
    const grid = document.getElementById('grid');
    if (!grid) return;
    grid!.style.transform = 'scale(0)';

    return () => setHeaderVisible(true);
  }, [setHeaderVisible]);

  // Cachés avant paint — prêts pour l’entrée sync loader
  useLayoutEffect(() => {
    if (!titlesRef.current) return;
    gsap.set(titlesRef.current, { opacity: 0, y: INTRO.titlesY });
  }, []);

  // Titres après le démarrage des wrecks (même beat que INTRO)
  useEffect(() => {
    if (!introReady || !titlesRef.current) return;
    gsap.to(titlesRef.current, {
      opacity: 1,
      y: 0,
      duration: INTRO.titlesDuration,
      delay: INTRO.titlesDelay,
      ease: INTRO.titlesEase,
      overwrite: 'auto',
    });
  }, [introReady]);

  const updateProjects = () => {
    if (!projectsHomeCoords?.length) return;
    setProjects(projectsHomeCoords);
  };

  useEffect(() => {
    lockScroll();
    setScrollY(0);
    updateProjects();
  }, [projectsHomeCoords]);

  return (
    <div
      className="flex justify-center items-center relative w-[100vw] h-[100vh] transition-height duration-1000 cursor-none"
      ref={mainWrapperRef}
    >
      <WorklistPhantomGrid projects={projects} />
      <IntroGridPhantom projects={projects} />
      <div
        ref={titlesRef}
        className="absolute w-full h-[100px] md:w-[80%]  2xl:w-[60%] z-20 flex items-center justify-between"
      >
        <Button
          onClick={() => handleClick(true)}
          onMouseEnter={() => animateText(withSoundRef.current!)}
          title={'enter with sound'}
          ref={withSoundRef}
        />
        <Button
          onClick={() => handleClick(false)}
          onMouseEnter={() => animateText(withoutSoundRef.current!)}
          title={'enter without sound'}
          ref={withoutSoundRef}
        />
      </div>
    </div>
  );
}
