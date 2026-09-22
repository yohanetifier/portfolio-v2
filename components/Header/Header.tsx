'use client';
import React, { useContext, useRef } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThemeContext } from '@/contexts/MenuProvider';
import { useHeaderContext } from '@/contexts/HeaderContext';
import Burger from '../Burger/Burger';
import { getProjectPath } from '@/utils/getProjectPath';
import { useThreeJsContext } from '@/contexts/ThreeJsContext';
import { clearFlag } from '@/utils/fromWorkList';

const Header = () => {
  const workRef = useRef<HTMLAnchorElement | null>(null);
  const personalRef = useRef<HTMLAnchorElement | null>(null);
  const aboutRef = useRef<HTMLParagraphElement | null>(null);
  const contactRef = useRef<HTMLAnchorElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useContext(ThemeContext);
  const { isHeaderVisible, setIsReturning, setReset } = useHeaderContext();
  const isIntro = !pathname || pathname === '/';
  const {
    selectedIndex,
    setReturnHome,
    setIsAnimating,
    setFromWorkPage,
    setGoToContact,
    setGoToWork,
    setFromProjectSlug,
    setFromProjectIndex,
    setScrollY,
    setProjectSelectedCoords,
    projectsCoords,
    fromLostPage,
    setFromLostPage,
    isLostPage,
  } = useThreeJsContext();
  const projectPath = getProjectPath(pathname);
  const showBack = Boolean(projectPath);
  const isLostRoute =
    isLostPage ||
    (!isIntro &&
      pathname !== '/contact' &&
      !pathname.startsWith('/work') &&
      !pathname.startsWith('/blogs'));

  const returnToWorkList = () => {
    if (selectedIndex === null) return;

    // 404 → projet → works : même reverse que works (haut/bas + scrollY), cibles grille
    if (fromLostPage) {
      const item = projectsCoords?.[selectedIndex];
      if (item?.rects) {
        const r = item.rects;
        const isInFirstScreen =
          r.top + r.height < window.innerHeight;
        setScrollY(isInFirstScreen ? 0 : r.top);
        setProjectSelectedCoords({
          x: r.x,
          y: isInFirstScreen ? r.y : 0,
          width: r.width,
          height: r.height,
          top: isInFirstScreen ? r.top : 0,
          left: r.left,
          bottom: isInFirstScreen ? r.bottom : r.height,
          right: r.right,
          toJSON() {
            return {};
          },
        } as DOMRect);
      }
      setIsReturning(true);
      setIsAnimating(true);
      router.push('/work', { scroll: false });
      return;
    }

    setIsReturning(true);
    setIsAnimating(true);
    router.push('/work', { scroll: false });
  };

  const handleBack = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    returnToWorkList();
  };

  const handleWorkPath = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    href: string,
  ) => {
    if (projectPath) {
      e.preventDefault();
      returnToWorkList();
    } else if (pathname === '/contact' || isLostRoute) {
      e.preventDefault();
      setFromProjectSlug(null);
      setFromProjectIndex(-1);
      setGoToWork(true);
      setIsAnimating(true);
    } else {
      setReset(true);
    }
  };

  const handleNav = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    path: string,
  ) => {
    e.preventDefault();
    if (path === '/') {
      clearFlag();
      setFromLostPage(false);
      if (selectedIndex !== null) {
        setFromWorkPage(selectedIndex);
      }
      setFromProjectSlug(null);
      setFromProjectIndex(-1);
      setReturnHome(true);
      setIsAnimating(true);
      return;
    }
    if (path === '/contact') {
      if (pathname === '/work' || isLostRoute) {
        setFromProjectSlug(null);
        setFromProjectIndex(-1);
        setGoToContact(true);
        setIsAnimating(true);
        return;
      }
      if (projectPath) {
        if (selectedIndex === null) return;
        setFromProjectSlug(String(projectPath));
        setFromProjectIndex(selectedIndex);
        setGoToContact(true);
        setIsAnimating(true);
        return;
      }
      router.push(path);
      setReset(true);
      return;
    }
    router.push(path);
    setReset(true);
  };

  return (
    <>
      {isIntro ? null : (
        <header
          className={`text-[8px] md:text-[16px] grid grid-cols-10 row-start-1 col-start-1 col-end-10 pt-[50px] absolute top-0 z-[100] h-[150px] w-[85%] md:w-[90%] left-1/2 transform -translate-x-1/2 transition-all duration-500 ease-in-out mix-blend-difference text-white pointer-events-none ${isHeaderVisible ? 'opacity-100' : 'opacity-0'}`}
        >
          {showBack && (
            <button
              type="button"
              onClick={handleBack}
              className={`absolute bottom-0 w-[16px] h-[16px] cursor-pointer p-0 border-0 bg-transparent ${isHeaderVisible ? 'pointer-events-auto' : ''}`}
              aria-label="Retour"
            >
              <Image
                src={projectPath ? '/images/Fleche.png' : '/images/Black_Fleche.png'}
                alt=""
                width={16}
                height={16}
                className="w-full h-full object-contain"
              />
            </button>
          )}
          <div className="col-start-1 col-end-3 flex justify-between ">
          <Link
            ref={personalRef}
            href={'/'}
            className={`text-[16px] ${isHeaderVisible ? 'pointer-events-auto' : ''}`}
            onClick={(e) => handleNav(e, '/')}
          >
            Yeti
          </Link>
          </div>
          <Link
            ref={workRef}
            className={`col-start-3 col-end-5 row-start-1 justify-self-end relative right-[20px] cursor-none md:right-[-30px] hidden md:block ${isHeaderVisible ? 'pointer-events-auto' : ''}`}
            href={'/work'}
            onClick={(e) => handleWorkPath(e, `/work`)}
          >
            Works
          </Link>
          <p
            className="col-start-5 col-end-8 justify-self-end justify-items-end relative right-[20px] cursor-none hidden md:block"
            ref={aboutRef}
            data-cursor
          >
            About
          </p>
          <Link
            className={`absolute right-[0px] top-[50px] cursor-none hidden md:block ${isHeaderVisible ? 'pointer-events-auto' : ''}`}
            ref={contactRef}
            href={'/contact'}
            onClick={(e) => handleNav(e, '/contact')}
          >
            Contact
          </Link>
          <div className={isHeaderVisible ? 'pointer-events-auto contents' : 'contents'}>
            <Burger />
          </div>
        </header>
      )}
    </>
  );
};

export default Header;
