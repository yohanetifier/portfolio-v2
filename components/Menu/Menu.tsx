'use client';

import { ThemeContext } from '@/contexts/MenuProvider';
import { useHeaderContext } from '@/contexts/HeaderContext';
import { useThreeJsContext } from '@/contexts/ThreeJsContext';
import { getProjectPath } from '@/utils/getProjectPath';
import { lockScroll, unlockScroll } from '@/utils/scroll';
import gsap from 'gsap';
import { usePathname, useRouter } from 'next/navigation';
import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

const SOCIAL_LINKS = [
  { label: 'Github', href: 'https://github.com/yohanetifier' },
  { label: 'Linkedin', href: 'https://www.linkedin.com/in/yohanetifier/' },
] as const;

const CONTACT_EMAIL = 'contact@yohanetifier.com';

const pad = (n: number) => String(n).padStart(2, '0');

/** Heure de Paris, « 14:32 » */
const parisTime = () =>
  new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  }).format(new Date());

const Menu = () => {
  const { setIsOpen, isOpen } = useContext(ThemeContext);
  const { setIsReturning, setReset, isReturning } = useHeaderContext();
  const pathname = usePathname();
  const router = useRouter();
  const projectPath = getProjectPath(pathname);
  const {
    selectedIndex,
    setSelectedIndex,
    setIsAnimating,
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
    projectsDetails,
  } = useThreeJsContext();
  const rootRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState('');

  const isLostRoute =
    isLostPage ||
    (pathname !== '/' &&
      pathname !== '/contact' &&
      !pathname.startsWith('/work') &&
      !pathname.startsWith('/blogs'));

  // Ne pas unlockScroll au close si une transition GSAP vient de partir
  const keepScrollLockedRef = useRef(false);
  keepScrollLockedRef.current = Boolean(
    isAnimating ||
      isReturning ||
      goToWork ||
      goToContact ||
      returnHome ||
      goToProject,
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

  // Heure de Paris, mise à jour chaque minute tant que le menu est ouvert
  useEffect(() => {
    if (!isOpen) return;
    setTime(parisTime());
    const id = window.setInterval(() => setTime(parisTime()), 15000);
    return () => window.clearInterval(id);
  }, [isOpen]);

  // Ouverture : le voile descend, les mots montent, le reste apparaît.
  // Fermeture : les mots sortent par le haut, le voile remonte.
  // Avant l'affichage (useLayoutEffect) : pas d'image du menu dans son état final
  const firstRunRef = useRef(true);
  useLayoutEffect(() => {
    const root = rootRef.current;
    const veil = veilRef.current;
    if (!root || !veil) return;
    const words = root.querySelectorAll('[data-word]');
    const fades = root.querySelectorAll('[data-fade]');
    const rule = root.querySelector('[data-rule]');
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const d = (s: number) => (reduced ? 0 : s);

    // Premier rendu, menu fermé : état de départ, sans animation
    if (firstRunRef.current) {
      firstRunRef.current = false;
      if (!isOpen) {
        gsap.set(root, { autoAlpha: 0 });
        gsap.set(veil, { clipPath: 'inset(0% 0% 100% 0%)' });
        return;
      }
    }

    const tl = gsap.timeline();
    if (isOpen) {
      tl.set(root, { autoAlpha: 1 })
        .set(words, { yPercent: 115 })
        .set(fades, { opacity: 0, y: 10 })
        .set(rule, { scaleX: 0 })
        .fromTo(
          veil,
          { clipPath: 'inset(0% 0% 100% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: d(0.75),
            ease: 'expo.inOut',
          },
          0,
        )
        .to(
          words,
          {
            yPercent: 0,
            duration: d(0.95),
            ease: 'expo.out',
            stagger: d(0.07),
          },
          d(0.38),
        )
        .to(rule, { scaleX: 1, duration: d(0.9), ease: 'expo.inOut' }, d(0.45))
        .to(
          fades,
          {
            opacity: 1,
            y: 0,
            duration: d(0.6),
            ease: 'power3.out',
            stagger: d(0.025),
          },
          d(0.5),
        );
    } else {
      tl.to(
        words,
        {
          yPercent: -110,
          duration: d(0.45),
          ease: 'power3.in',
          stagger: d(0.035),
        },
        0,
      )
        .to(fades, { opacity: 0, duration: d(0.3), ease: 'power2.in' }, 0)
        .to(
          veil,
          {
            clipPath: 'inset(0% 0% 100% 0%)',
            duration: d(0.7),
            ease: 'expo.inOut',
          },
          d(0.28),
        )
        .set(root, { autoAlpha: 0 });
    }
    return () => {
      tl.kill();
    };
  }, [isOpen]);

  const resolveIndex = () => {
    if (selectedIndex !== null && selectedIndex >= 0) return selectedIndex;
    if (fromWorkPage >= 0) return fromWorkPage;
    return null;
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

  const count = projectsDetails.length;
  const links = [
    {
      label: 'Works',
      sup: count > 0 ? `(${pad(count)})` : undefined,
      onClick: goToProjets,
      current: pathname === '/work',
    },
    {
      label: 'Contact',
      onClick: goToContactPage,
      current: pathname === '/contact',
    },
  ];

  // autoAlpha (opacity + visibility) piloté par GSAP : fermé, rien n'est
  // visible ni atteignable au clavier
  return (
    <div
      ref={rootRef}
      className="invisible fixed inset-0 z-[90] text-[#12120f] md:hidden"
      aria-hidden={!isOpen}
    >
      {/* Voile papier : il descend du haut (clip-path) */}
      <div ref={veilRef} className="absolute inset-0 bg-paper" />

      <div className="relative flex h-full flex-col px-[8vw] pt-[20vh]">
        <nav className="flex flex-col gap-[2px]" aria-label="Menu">
          {links.map(({ label, sup, onClick, current }, i) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              aria-current={current ? 'page' : undefined}
              className="flex items-start gap-3 border-0 bg-transparent p-0 text-left outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4"
            >
              {/* Numéro, ou ● pour la page où l'on est */}
              <span
                data-fade
                className="w-[22px] pt-[0.95em] font-fabrikatMono text-[9px] leading-none tracking-[0.1em] text-black/55"
              >
                {current ? (
                  <span className="text-[#12120f]">●</span>
                ) : (
                  pad(i + 1)
                )}
              </span>
              {/* Fenêtre : le mot monte de dessous */}
              <span className="block overflow-hidden pb-[0.06em]">
                <span
                  data-word
                  className={`inline-block font-sans text-[clamp(2.9rem,13.5vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.045em] ${
                    current ? 'text-[#12120f]/20' : ''
                  }`}
                >
                  {label}
                </span>
              </span>
              {sup ? (
                <sup
                  data-fade
                  className="relative top-[0.9em] ml-[-6px] font-fabrikatMono text-[10px] leading-none tracking-[0.08em] text-black/55"
                >
                  {sup}
                </sup>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="mt-auto pb-[calc(34px+env(safe-area-inset-bottom,0px))]">
          <div data-rule className="h-px origin-left bg-black/15" aria-hidden />
          <p
            data-fade
            className="mt-[22px] font-fabrikatMono text-[9px] uppercase leading-none tracking-[0.14em] text-black/55"
          >
            [ Un projet ? ]
          </p>
          <a
            data-fade
            href={`mailto:${CONTACT_EMAIL}`}
            onClick={close}
            className="mb-[18px] mt-[10px] block font-sans text-[clamp(1.25rem,6.4vw,1.6rem)] font-bold leading-[1.05] tracking-[-0.02em] [overflow-wrap:anywhere]"
          >
            {CONTACT_EMAIL}
          </a>
          <div
            data-fade
            className="flex justify-between gap-3 font-fabrikatMono text-[9px] uppercase leading-[1.6] tracking-[0.12em]"
          >
            <span className="flex gap-[18px]">
              {SOCIAL_LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                >
                  {label} ↗
                </a>
              ))}
            </span>
            <span>Paris — {time || '--:--'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
