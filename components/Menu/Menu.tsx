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

const Menu = () => {
  const { setIsOpen, isOpen } = useContext(ThemeContext);
  const { setIsReturning, setReset } = useHeaderContext();
  const pathname = usePathname();
  const router = useRouter();
  const projectPath = getProjectPath(pathname);
  const {
    selectedIndex,
    setSelectedIndex,
    setReturnHome,
    setIsAnimating,
    setFromWorkPage,
    fromWorkPage,
    setGoToContact,
    setGoToWork,
    goToWork,
    setFromProjectSlug,
    setFromProjectIndex,
    isLostPage,
    isAnimating,
    goToContact,
    returnHome,
    goToProject,
  } = useThreeJsContext();

  const isLostRoute =
    isLostPage ||
    (pathname !== '/' &&
      pathname !== '/contact' &&
      !pathname.startsWith('/work') &&
      !pathname.startsWith('/blogs'));

  // Ne pas unlockScroll au close si une transition GSAP vient de partir
  const keepScrollLockedRef = useRef(false);
  keepScrollLockedRef.current = Boolean(
    isAnimating || goToWork || goToContact || returnHome || goToProject,
  );

  useEffect(() => {
    if (!isOpen) return;
    lockScroll();
    const blockTouch = (e: TouchEvent) => {
      e.preventDefault();
    };
    document.addEventListener('touchmove', blockTouch, { passive: false });
    return () => {
      document.removeEventListener('touchmove', blockTouch);
      if (!keepScrollLockedRef.current) {
        unlockScroll();
      }
    };
  }, [isOpen]);

  const close = () => setIsOpen(false);

  const resolveIndex = () => {
    if (selectedIndex !== null && selectedIndex >= 0) return selectedIndex;
    if (fromWorkPage >= 0) return fromWorkPage;
    return null;
  };

  /** Identique Header.handleNav('/') */
  const goHome = () => {
    if (pathname === '/') {
      close();
      return;
    }
    clearFlag();
    if (selectedIndex !== null) {
      setFromWorkPage(selectedIndex);
    }
    setFromProjectSlug(null);
    setFromProjectIndex(-1);
    setReturnHome(true);
    setIsAnimating(true);
    close();
  };

  /** Identique Header.handleWorkPath / returnToWorkList — flags tout de suite */
  const goToProjets = () => {
    if (pathname === '/work' && !projectPath) {
      close();
      return;
    }

    if (projectPath) {
      const index = resolveIndex();
      if (index === null) {
        close();
        return;
      }
      setSelectedIndex(index);
      setIsReturning(true);
      setIsAnimating(true);
      router.push('/work', { scroll: false });
      close();
      return;
    }

    if (pathname === '/contact' || isLostRoute) {
      setFromProjectSlug(null);
      setFromProjectIndex(-1);
      // Si un goToWork précédent est resté coincé (pas de coords), forcer un re-trigger
      if (goToWork) {
        setGoToWork(false);
        requestAnimationFrame(() => {
          setGoToWork(true);
          setIsAnimating(true);
        });
      } else {
        setGoToWork(true);
        setIsAnimating(true);
      }
      close();
      return;
    }

    router.push('/work', { scroll: false });
    setReset(true);
    close();
  };

  /** Identique Header.handleNav('/contact') */
  const goToContactPage = () => {
    if (pathname === '/contact') {
      close();
      return;
    }

    if (pathname === '/work' || isLostRoute) {
      setFromProjectSlug(null);
      setFromProjectIndex(-1);
      setGoToContact(true);
      setIsAnimating(true);
      close();
      return;
    }

    if (projectPath) {
      const index = resolveIndex();
      if (index === null) {
        close();
        return;
      }
      setSelectedIndex(index);
      setFromProjectSlug(String(projectPath));
      setFromProjectIndex(index);
      setGoToContact(true);
      setIsAnimating(true);
      close();
      return;
    }

    router.push('/contact', { scroll: false });
    setReset(true);
    close();
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
