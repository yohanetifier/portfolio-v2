'use client';
import React, {
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useThreeJsContext } from '@/contexts/ThreeJsContext';
import { useHeaderContext } from '@/contexts/HeaderContext';
import { ThemeContext } from '@/contexts/MenuProvider';
import { Project as ProjectModel } from '@/src/models/Project';
import { PROJECT_FLY, peekHeight } from '@/utils/projectFly';
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
 */
const ProjectNav = ({ projects, currentIndex, contentRef }: Props) => {
  const { goToContact, goToWork, goToProject, returnHome } =
    useThreeJsContext();
  const { isReturning } = useHeaderContext();
  const { isOpen: menuOpen } = useContext(ThemeContext);
  const { peek, unpeek, fly } = useFlyToProject(projects, contentRef);
  const navRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  // Un projet est en train de s'ouvrir : un 2e clic ne doit rien relancer
  const [leaving, setLeaving] = useState(false);
  // Flèche survolée : sa légende s'affiche sous l'aperçu
  const [peekDir, setPeekDir] = useState<Dir | null>(null);

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

  const barRect = () => navRef.current?.getBoundingClientRect() ?? null;

  const go = (index: number, dir: Dir) => {
    if (hidden) return;
    setLeaving(true);
    setPeekDir(null);
    fly(index, dir, barRect());
  };

  // Souris seulement : au doigt, le tap lance directement le vol
  const showPeek = (e: React.PointerEvent, index: number, dir: Dir) => {
    const bar = barRect();
    if (e.pointerType !== 'mouse' || hidden || !bar) return;
    setPeekDir(dir);
    peek(index, bar);
  };
  const hidePeek = () => {
    setPeekDir(null);
    unpeek();
  };

  // Menu ouvert, autre transition : l'aperçu part avec la barre
  useEffect(() => {
    if (hidden && !leaving) hidePeek();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hidden, leaving]);

  // Clavier : écouteur posé une seule fois → il appelle toujours la version à jour
  const goRef = useRef(go);
  goRef.current = go;
  const hidePeekRef = useRef(hidePeek);
  hidePeekRef.current = hidePeek;
  const indexesRef = useRef({ prevIndex, nextIndex });
  indexesRef.current = { prevIndex, nextIndex };

  useEffect(() => {
    setMounted(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target?.closest('input, textarea, select, [contenteditable="true"]')
      ) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        goRef.current(indexesRef.current.prevIndex, 'prev');
      }
      if (e.key === 'ArrowRight') {
        goRef.current(indexesRef.current.nextIndex, 'next');
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
  const peekIndex = peekDir === 'prev' ? prevIndex : nextIndex;

  return createPortal(
    <nav
      ref={navRef}
      aria-label="Navigation entre projets"
      className={`absolute left-1/2 top-[96px] md:top-[124px] z-[60] flex w-[85%] -translate-x-1/2 items-center justify-between gap-4 font-fabrikatMono text-[11px] uppercase tracking-[0.14em] text-white mix-blend-difference transition-opacity duration-500 md:w-[90%] ${
        hidden ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <p className="flex min-w-0 items-center gap-3 whitespace-nowrap pl-[28px] md:pl-[32px]">
        <span className="tabular-nums">
          {pad(currentIndex + 1)} / {pad(count)}
        </span>
        <span className="min-w-0 truncate opacity-50">
          {projects[currentIndex].title}
        </span>
      </p>
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
            onClick={() => go(index, dir)}
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
