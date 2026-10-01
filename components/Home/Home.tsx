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

export default function Home({
  projects,
}: {
  projects: Pick<Project, 'featuredImage'>[];
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const welcomeRef = useRef<HTMLButtonElement>(null);
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

  const handleClick = () => {
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
    gsap.set(titlesRef.current, { opacity: 0, y: 18 });
  }, []);

  // Entrée des titres un peu après le début du wipe (pas pile au déclenchement)
  useEffect(() => {
    if (!introReady || !titlesRef.current) return;
    gsap.to(titlesRef.current, {
      opacity: 1,
      y: 0,
      duration: 1.15,
      delay: 0.45,
      ease: 'power2.inOut',
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
          onClick={handleClick}
          onMouseEnter={() => animateText(welcomeRef.current!)}
          title={'welcome'}
          ref={welcomeRef}
        />
        <Button
          onClick={handleClick}
          onMouseEnter={() => animateText(buttonRef.current!)}
          title={'click to start'}
          ref={buttonRef}
        />
      </div>
    </div>
  );
}
