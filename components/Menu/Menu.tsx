'use client';

import { ThemeContext } from '@/contexts/MenuProvider';
import { useHeaderContext } from '@/contexts/HeaderContext';
import { useThreeJsContext } from '@/contexts/ThreeJsContext';
import { clearFlag } from '@/utils/fromWorkList';
import { getProjectPath } from '@/utils/getProjectPath';
import { lockScroll, unlockScroll } from '@/utils/scroll';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useContext, useEffect, useRef } from 'react';

const SOCIAL_LINKS = [
  { label: 'GITHUB', href: 'https://github.com/yohanetifier' },
  { label: 'LINKEDIN', href: 'https://www.linkedin.com/in/yohanetifier/' },
] as const;

const NAV_LINK_CLASS =
  'block w-full border-0 bg-transparent p-0 text-left font-sans text-[clamp(2.75rem,12vw,4.5rem)] font-bold leading-[1.15] tracking-[-0.03em]';

/** Laisse le menu se fermer avant de lancer GSAP (sinon anim derrière le fond crème) */
const MENU_CLOSE_MS = 420;

const Menu = () => {
  const { setIsOpen, isOpen } = useContext(ThemeContext);
  const { setIsReturning } = useHeaderContext();
  const pathname = usePathname();
  const router = useRouter();
  const projectPath = getProjectPath(pathname);
  const navTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    selectedIndex,
    setReturnHome,
    setIsAnimating,
    setFromWorkPage,
    setGoToContact,
    setGoToWork,
    setFromProjectSlug,
    setFromProjectIndex,
    isLostPage,
  } = useThreeJsContext();

  const isLostRoute =
    isLostPage ||
    (pathname !== '/' &&
      pathname !== '/contact' &&
      !pathname.startsWith('/work') &&
      !pathname.startsWith('/blogs'));

  useEffect(() => {
    if (!isOpen) return;
    lockScroll();
    const blockTouch = (e: TouchEvent) => {
      e.preventDefault();
    };
    document.addEventListener('touchmove', blockTouch, { passive: false });
    return () => {
      unlockScroll();
      document.removeEventListener('touchmove', blockTouch);
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
    };
  }, []);

  const close = () => setIsOpen(false);

  /** Ferme le menu puis exécute la nav — l’anim WebGL est visible */
  const afterClose = (action: () => void) => {
    if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
    setIsOpen(false);
    navTimeoutRef.current = setTimeout(action, MENU_CLOSE_MS);
  };

  const goHome = () => {
    if (pathname === '/') {
      close();
      return;
    }
    afterClose(() => {
      clearFlag();
      if (selectedIndex !== null) {
        setFromWorkPage(selectedIndex);
      }
      setFromProjectSlug(null);
      setFromProjectIndex(-1);
      setReturnHome(true);
      setIsAnimating(true);
    });
  };

  const goToProjets = () => {
    if (pathname === '/work' && !projectPath) {
      close();
      return;
    }
    afterClose(() => {
      if (projectPath) {
        if (selectedIndex === null) return;
        setIsReturning(true);
        setIsAnimating(true);
        router.push('/work', { scroll: false });
        return;
      }
      if (pathname === '/contact' || isLostRoute) {
        setFromProjectSlug(null);
        setFromProjectIndex(-1);
        setGoToWork(true);
        setIsAnimating(true);
        return;
      }
      router.push('/work');
    });
  };

  const goToContactPage = () => {
    if (pathname === '/contact') {
      close();
      return;
    }
    afterClose(() => {
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
      router.push('/contact');
    });
  };

  return (
    <div
      className={`fixed inset-0 z-[90] md:hidden bg-[#f4f3ef] text-[#12120f] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
        isOpen ? 'translate-y-0' : 'translate-y-[-100%]'
      }`}
      aria-hidden={!isOpen}
    >
      <div
        className={`flex h-full flex-col justify-between px-[8vw] pt-[22vh] pb-[max(2rem,env(safe-area-inset-bottom))] transition-opacity duration-500 ${
          isOpen ? 'opacity-100 delay-150' : 'opacity-0'
        }`}
      >
        <nav className="flex flex-col gap-5">
          <button type="button" onClick={goHome} className={NAV_LINK_CLASS}>
            Home
          </button>
          <button type="button" onClick={goToProjets} className={NAV_LINK_CLASS}>
            Projets
          </button>
          <button
            type="button"
            onClick={goToContactPage}
            className={NAV_LINK_CLASS}
          >
            Contact
          </button>
        </nav>

        <div className="w-full max-w-[920px]">
          <div className="mb-8 h-px w-full bg-black/80" aria-hidden />

          <a
            href="mailto:contact@yohanetifier.com"
            className="mb-6 block font-sans text-[clamp(1.35rem,6.8vw,2.75rem)] font-bold leading-[1.05] tracking-[-0.02em] [overflow-wrap:anywhere]"
            onClick={close}
          >
            contact@yohanetifier.com
          </a>

          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {SOCIAL_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] uppercase tracking-[0.12em]"
                onClick={close}
              >
                {label} ↗
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
