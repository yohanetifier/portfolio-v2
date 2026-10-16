'use client';
import React, {
  RefObject,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { useThreeJsContext } from '@/contexts/ThreeJsContext';
import { useHeaderContext } from '@/contexts/HeaderContext';
import { ThemeContext } from '@/contexts/MenuProvider';
import { Project as ProjectModel } from '@/src/models/Project';
import {
  FlyRect,
  PROJECT_FLY,
  getPeekRect,
  getPeekRectBelow,
  peekHeight,
} from '@/utils/projectFly';
import { useFlyToProject } from './useFlyToProject';

interface Props {
  projects: Pick<ProjectModel, 'featuredImage' | 'title'>[];
  currentIndex: number;
  /** Contenu de la page, effacé pendant le vol */
  contentRef: RefObject<HTMLElement | null>;
}

const pad = (n: number) => String(n).padStart(2, '0');

const Arrow = ({ dir }: { dir: 'prev' | 'next' }) => (
  <svg
    viewBox="0 0 14 14"
    aria-hidden
    className={`h-[14px] w-[14px] fill-current ${dir === 'prev' ? 'rotate-180' : ''}`}
  >
    <path d="M8.4 2.4 13 7l-4.6 4.6-.9-.9 3.1-3.1H1V6.4h9.6L7.5 3.3z" />
  </svg>
);

type Dir = 'prev' | 'next';

/**
 * Barre de la page projet : « 01 / 09 — Titre » à gauche, flèches ← → à droite.
 * Au survol d'une flèche, l'image du projet voisin apparaît dessous ; au clic
 * (ou touches ← → du clavier), elle vole jusqu'au plein écran.
 * Le compteur se déplie en numéros 01…09 (survol en desktop, tap en mobile) :
 * un numéro ouvre son projet de la même façon.
 */
const ProjectNav = ({ projects, currentIndex, contentRef }: Props) => {
  const { goToContact, goToWork, goToProject, returnHome } =
    useThreeJsContext();
  const { isReturning, setHideBack } = useHeaderContext();
  const { isOpen: menuOpen } = useContext(ThemeContext);
  const { peek, unpeek, fly } = useFlyToProject(projects, contentRef);
  const navRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  // Un projet est en train de s'ouvrir : un 2e clic ne doit rien relancer
  const [leaving, setLeaving] = useState(false);
  // Flèche survolée : sa légende s'affiche sous l'aperçu
  const [peekDir, setPeekDir] = useState<Dir | null>(null);
  // Compteur déplié en numéros, et numéro survolé (son titre s'affiche)
  const [pagerOpen, setPagerOpen] = useState(false);
  const [hoveredNum, setHoveredNum] = useState<number | null>(null);
  const pagerRef = useRef<HTMLDivElement>(null);
  const numsRef = useRef<HTMLOListElement>(null);
  const numRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // Trop de projets pour la largeur : la rangée défile et s'estompe aux bords
  const [numsOverflow, setNumsOverflow] = useState(false);
  const closeTimerRef = useRef<number | undefined>(undefined);
  const numsId = useId();

  const count = projects.length;
  const prevIndex = (currentIndex - 1 + count) % count;
  const nextIndex = (currentIndex + 1) % count;

  // Une autre transition (header, menu, retour) a la main : la barre s'efface
  const hidden = Boolean(
    goToContact ||
      goToWork ||
      goToProject ||
      returnHome ||
      isReturning ||
      menuOpen ||
      leaving,
  );

  // Place de l'aperçu : sous les flèches, ou sous un numéro (son bouton)
  const arrowsPeekRect = () => {
    const bar = navRef.current?.getBoundingClientRect();
    return bar ? getPeekRect(bar, window.innerWidth) : null;
  };
  const numPeekRect = (i: number) => {
    const button = numRefs.current[i]?.getBoundingClientRect();
    return button ? getPeekRectBelow(button, window.innerWidth) : null;
  };

  // from : où l'image démarre s'il n'y a pas d'aperçu (tap mobile), null au clavier
  const go = (index: number, dir: Dir, from: FlyRect | null) => {
    if (hidden) return;
    setLeaving(true);
    setPeekDir(null);
    fly(index, dir, from);
  };

  // Souris seulement : au doigt, le tap lance directement le vol
  const showPeek = (e: React.PointerEvent, index: number, dir: Dir) => {
    const target = arrowsPeekRect();
    if (e.pointerType !== 'mouse' || hidden || !target) return;
    setPeekDir(dir);
    peek(index, target);
  };
  const showNumPeek = (e: React.PointerEvent, i: number) => {
    setHoveredNum(i);
    const target = numPeekRect(i);
    if (e.pointerType !== 'mouse' || hidden || !target) return;
    // Le projet affiché n'a pas d'aperçu : il est déjà en plein écran
    if (i === currentIndex) unpeek();
    else peek(i, target);
  };
  const hidePeek = () => {
    setPeekDir(null);
    unpeek();
  };

  const openPager = () => {
    window.clearTimeout(closeTimerRef.current);
    if (!hidden) setPagerOpen(true);
  };
  const closePager = () => {
    window.clearTimeout(closeTimerRef.current);
    setPagerOpen(false);
    setHoveredNum(null);
    unpeek();
  };
  // Petit délai : la souris peut sortir un instant entre deux numéros
  const closePagerSoon = () => {
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(closePager, 280);
  };

  // Un numéro : le projet affiché replie le compteur, un autre s'ouvre
  const goTo = (index: number) => {
    if (index === currentIndex) {
      closePager();
      return;
    }
    go(index, index > currentIndex ? 'next' : 'prev', numPeekRect(index));
  };

  // Menu ouvert, autre transition : l'aperçu et les numéros partent avec la barre
  useEffect(() => {
    if (hidden && !leaving) {
      hidePeek();
      closePager();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hidden, leaving]);

  // À l'ouverture, avant l'affichage : la rangée déborde-t-elle ? Si oui, on la
  // centre sur le numéro du projet affiché
  useLayoutEffect(() => {
    const list = numsRef.current;
    if (!pagerOpen || !list) return;
    const overflow = list.scrollWidth > list.clientWidth;
    setNumsOverflow(overflow);
    const current = numRefs.current[currentIndex];
    if (overflow && current) {
      list.scrollLeft =
        current.offsetLeft - list.clientWidth / 2 + current.offsetWidth / 2;
    }
  }, [pagerOpen, currentIndex]);

  // Numéros dépliés : en mobile, la flèche retour de l'en-tête s'efface, ils
  // prennent sa place (en desktop, il y a la place pour les deux)
  useEffect(() => {
    setHideBack(pagerOpen);
  }, [pagerOpen, setHideBack]);
  useEffect(() => () => setHideBack(false), [setHideBack]);

  // Dépliage : chaque numéro monte de sous sa ligne, l'un après l'autre.
  // Avant l'affichage (useLayoutEffect) : sinon ils apparaîtraient un instant à
  // leur place avant de partir en bas
  useLayoutEffect(() => {
    const list = numsRef.current;
    if (!pagerOpen || !list) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const tween = gsap.fromTo(
      list.querySelectorAll('[data-num]'),
      { yPercent: 160 },
      { yPercent: 0, duration: 0.55, stagger: 0.025, ease: 'expo.out' },
    );
    return () => {
      tween.kill();
    };
  }, [pagerOpen]);

  // Mobile : un tap ailleurs replie les numéros
  useEffect(() => {
    if (!pagerOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!pagerRef.current?.contains(e.target as Node)) {
        closePagerRef.current();
      }
    };
    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, [pagerOpen]);

  // Clavier : écouteur posé une seule fois → il appelle toujours la version à jour
  const goRef = useRef(go);
  goRef.current = go;
  const hidePeekRef = useRef(hidePeek);
  hidePeekRef.current = hidePeek;
  const closePagerRef = useRef(closePager);
  closePagerRef.current = closePager;
  const indexesRef = useRef({ prevIndex, nextIndex });
  indexesRef.current = { prevIndex, nextIndex };

  useEffect(() => {
    setMounted(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePagerRef.current();
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target?.closest('input, textarea, select, [contenteditable="true"]')
      ) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        goRef.current(indexesRef.current.prevIndex, 'prev', null);
      }
      if (e.key === 'ArrowRight') {
        goRef.current(indexesRef.current.nextIndex, 'next', null);
      }
    };
    // La barre part avec le scroll, l'aperçu (fixe dans le canvas) ne la suit pas
    const onScroll = () => hidePeekRef.current();
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  if (!mounted || currentIndex < 0 || count < 2) return null;

  // Dans le body : l'overlay de la page projet (z-index) isolerait le mix-blend.
  // Même ligne que la flèche retour de l'en-tête (centrée à 114 px, 142 px en
  // desktop) : le compteur démarre juste après elle. En absolute, comme l'en-tête,
  // la barre défile avec la page et part avec lui.
  // Au-dessus de l'en-tête mais transparente aux clics, sauf ses boutons : en
  // mobile, la zone tactile du retour (44 px) déborde sous le début du compteur.
  const peekIndex = peekDir === 'prev' ? prevIndex : nextIndex;
  const shownTitle = projects[hoveredNum ?? currentIndex].title;

  return createPortal(
    <nav
      ref={navRef}
      aria-label="Navigation entre projets"
      className={`pointer-events-none absolute left-1/2 top-[96px] md:top-[124px] z-[110] flex w-[85%] -translate-x-1/2 items-center justify-between gap-4 font-fabrikatMono text-[11px] uppercase tracking-[0.14em] text-white mix-blend-difference transition-opacity duration-500 md:w-[90%] ${
        hidden
          ? 'opacity-0'
          : 'opacity-100 [&_button]:pointer-events-auto [&_ol]:pointer-events-auto'
      }`}
    >
      <div
        ref={pagerRef}
        className="flex min-w-0 items-center gap-3 whitespace-nowrap pl-[28px] md:pl-[32px]"
        onPointerEnter={(e) => e.pointerType === 'mouse' && openPager()}
        onPointerLeave={(e) => e.pointerType === 'mouse' && closePagerSoon()}
      >
        {pagerOpen ? (
          // Marge négative : « 01 » commence là où était « 05 / 09 »
          // data-lenis-prevent : la molette et le trackpad font défiler la rangée,
          // pas la page
          <ol
            ref={numsRef}
            id={numsId}
            aria-label="Aller à un projet"
            data-lenis-prevent
            className={`relative -ml-[4px] flex min-w-0 overflow-x-auto overscroll-x-contain [scrollbar-width:none] md:-ml-[7px] [&::-webkit-scrollbar]:hidden ${
              numsOverflow
                ? '[mask-image:linear-gradient(to_right,transparent,#000_20px,#000_calc(100%-20px),transparent)]'
                : ''
            }`}
          >
            {projects.map((project, i) => (
              <li key={project.title} className="shrink-0">
                <button
                  ref={(el) => {
                    numRefs.current[i] = el;
                  }}
                  type="button"
                  onClick={() => goTo(i)}
                  onPointerEnter={(e) => showNumPeek(e, i)}
                  onPointerLeave={() => {
                    setHoveredNum(null);
                    unpeek();
                  }}
                  onFocus={() => setHoveredNum(i)}
                  aria-label={`${pad(i + 1)}, ${project.title}`}
                  aria-current={i === currentIndex ? 'page' : undefined}
                  tabIndex={hidden ? -1 : 0}
                  className={`h-[36px] min-w-[24px] px-[4px] tabular-nums outline-none transition-opacity duration-300 hover:opacity-100 focus-visible:opacity-100 md:min-w-[30px] md:px-[7px] ${
                    i === currentIndex ? 'opacity-100' : 'opacity-40'
                  }`}
                >
                  {/* Fenêtre qui cache le chiffre tant qu'il est sous sa ligne
                      (allongée en bas pour laisser voir le soulignement) */}
                  <span className="-mb-[7px] block overflow-hidden pb-[7px]">
                    <span
                      data-num
                      className={`block ${
                        i === currentIndex
                          ? 'underline underline-offset-[5px]'
                          : ''
                      }`}
                    >
                      {pad(i + 1)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              openPager();
              // Ouvert au clavier (pas de clic réel) : on entre dans la liste
              if (e.detail === 0) {
                requestAnimationFrame(() =>
                  numRefs.current[currentIndex]?.focus({ preventScroll: true }),
                );
              }
            }}
            aria-expanded={false}
            aria-controls={numsId}
            aria-label={`Projet ${pad(currentIndex + 1)} sur ${pad(count)} : choisir un projet`}
            tabIndex={hidden ? -1 : 0}
            className="h-[36px] tabular-nums outline-none focus-visible:underline focus-visible:underline-offset-[5px]"
          >
            {pad(currentIndex + 1)} / {pad(count)}
          </button>
        )}
        {/* Titre du numéro survolé ; masqué en mobile quand les numéros prennent la place */}
        <span
          className={`min-w-0 truncate opacity-50 ${pagerOpen ? 'max-md:hidden' : ''}`}
        >
          {shownTitle}
        </span>
      </div>
      {/* Zone de clic 36 px, décalée pour aligner le pictogramme sur la marge */}
      <div className="-mr-[11px] flex shrink-0">
        {(
          [
            ['prev', prevIndex, 'Projet précédent'],
            ['next', nextIndex, 'Projet suivant'],
          ] as const
        ).map(([dir, index, label]) => (
          <button
            key={dir}
            type="button"
            onClick={() => go(index, dir, arrowsPeekRect())}
            onPointerEnter={(e) => showPeek(e, index, dir)}
            onPointerLeave={hidePeek}
            aria-label={`${label} : ${projects[index].title}`}
            tabIndex={hidden ? -1 : 0}
            className="grid h-[36px] w-[36px] place-items-center opacity-60 outline-none transition-opacity duration-300 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-6px] focus-visible:outline-current"
          >
            <Arrow dir={dir} />
          </button>
        ))}
      </div>
      {/* Légende de l'aperçu (l'image elle-même est dessinée par le Scene) */}
      <p
        aria-hidden
        className={`pointer-events-none absolute right-0 whitespace-nowrap transition-opacity duration-300 ${
          peekDir ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          top: `calc(100% + ${PROJECT_FLY.gap + peekHeight(window.innerWidth) + 10}px)`,
        }}
      >
        <span className="opacity-50">
          {peekDir === 'prev' ? 'Précédent' : 'Suivant'}
        </span>{' '}
        {projects[peekIndex].title}
      </p>
    </nav>,
    document.body,
  );
};

export default ProjectNav;
