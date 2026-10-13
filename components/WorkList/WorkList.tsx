'use client';
import { Project } from '@/src/models/Project';
import gsap from 'gsap';
import { Flip, ScrollTrigger, SplitText } from 'gsap/all';
import Link from 'next/link';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { getGridMetrics, getGridPlacement } from './utils/classes';
import {
  ProjectItem,
  WorksView,
  useThreeJsContext,
} from '@/contexts/ThreeJsContext';
import { useHeaderContext } from '@/contexts/HeaderContext';
import { slugify } from '@/utils/slugify';
import { getFlag, setFlag } from '@/utils/fromWorkList';
import { getLenis, lockScroll, unlockScroll } from '@/utils/scroll';
import IntroGridPhantom from '../IntroPhantomGrid/IntroPhantomGrid';
import ContactPhantomGrid from '../Contact/ContactPhantomGrid';
import { useFinePointer } from '@/utils/useFinePointer';
import { OPEN_WHOOSH, playSound } from '@/utils/playSound';
import {
  LIST_EXIT,
  LIST_PREVIEW,
  LIST_REVEAL,
  VIEW_SWITCH,
} from '@/utils/worksView';

gsap.registerPlugin(Flip, ScrollTrigger, SplitText);

/** Boîte écran en px (coin haut-gauche + taille) */
type Box = { x: number; y: number; w: number; h: number };

const toBox = (r: DOMRect): Box => ({
  x: r.left,
  y: r.top,
  w: r.width,
  h: r.height,
});

/** Aperçu de la liste : à droite du curseur, gardé dans l'écran */
const previewBox = (pointer: { x: number; y: number }): Box => {
  const w = Math.min(
    LIST_PREVIEW.maxWidth,
    window.innerWidth * LIST_PREVIEW.widthRatio,
  );
  const h = w * LIST_PREVIEW.ratio;
  const m = LIST_PREVIEW.margin;
  return {
    x: Math.min(
      Math.max(pointer.x + LIST_PREVIEW.offsetX, m),
      window.innerWidth - w - m,
    ),
    y: Math.min(
      Math.max(pointer.y - h / 2, m),
      window.innerHeight - h - m,
    ),
    w,
    h,
  };
};

/** Pictogrammes de la bascule : 4 carrés / 3 lignes « miniature + titre » */
const ViewIcon = ({ view }: { view: WorksView }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden fill="currentColor">
    {view === 'grid' ? (
      <>
        <rect x="0" y="0" width="6" height="6" />
        <rect x="8" y="0" width="6" height="6" />
        <rect x="0" y="8" width="6" height="6" />
        <rect x="8" y="8" width="6" height="6" />
      </>
    ) : (
      [0, 5, 10].map((y) => (
        <React.Fragment key={y}>
          <rect x="0" y={y} width="4" height="4" />
          <rect x="6" y={y + 1.5} width="8" height="1" />
        </React.Fragment>
      ))
    )}
  </svg>
);

export default function WorkList({
  projects,
}: {
  projects: Pick<Project, 'featuredImage' | 'title'>[];
}) {
  const {
    setProjects,
    setSelectedIndex,
    setSelectedSlug,
    setProjectImageSelected,
    setProjectSelectedCoords,
    setScrollY,
    scrollY,
    selectedIndex,
    fromHome,
    isAnimating,
    setIsAnimating,
    setHoveredIndex,
    setUv,
    hoveredIndex,
    setIsLostPage,
    goToContact,
    goToWork,
    returnHome,
    goToProject,
    setFromWorkPage,
    worksView,
    setWorksView,
    isViewSwitching,
    setIsViewSwitching,
  } = useThreeJsContext();
  const { isReturning } = useHeaderContext();
  const finePointer = useFinePointer();
  const linkArray = useRef<HTMLAnchorElement[]>([]);
  /** Liste : une miniature fantôme par ligne = cible du plane au repos */
  const thumbRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mainWrapperRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const metrics = getGridMetrics(projects.length);
  const isAnimatingRef = useRef(false);
  isAnimatingRef.current = isAnimating;
  const leavingRef = useRef(false);
  leavingRef.current = Boolean(
    goToContact || goToWork || returnHome || goToProject,
  );
  const targetX = useRef<number>(0);
  const targetY = useRef<number>(0);
  const currentX = useRef<number | null>(null);
  const currentY = useRef<number | null>(null);
  const hoveredIndexRef = useRef<number | null>(null);
  const titleWrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const [active, setActive] = useState<boolean | null>(false);

  // Vue : on ne restaure la liste qu'au retour d'une page projet ouverte depuis Works.
  // Les autres arrivées (home, contact, 404) visent la grille → on démarre en grille.
  /**
   * Liste → grille : la liste reste affichée (par-dessus, sans interaction) le temps
   * que ses filets finissent de se rétracter, alors que la grille est déjà là
   */
  const [lingerList, setLingerList] = useState(false);
  const [view, setView] = useState<WorksView>(() =>
    typeof window !== 'undefined' && isReturning && getFlag()
      ? worksView
      : 'grid',
  );
  const viewRef = useRef(view);
  viewRef.current = view;
  /** Mis à true dès le clic (avant le rendu) pour bloquer les mesures pendant la bascule */
  const switchingRef = useRef(false);
  const pendingSwitchRef = useRef(false);
  /**
   * Projet cliqué : on quitte la page. isAnimating repasse à false dès le plein écran
   * atteint (Plane), avant le changement de route — sans ce verrou, un survol à ce
   * moment ouvrirait un aperçu et enregistrerait sa position pour le retour.
   * Remis à zéro naturellement : WorkList est recréé au retour.
   */
  const navigatingRef = useRef(false);

  /** Liste : ligne survolée, position souris et boîtes des aperçus en mouvement */
  const hoveredRowRef = useRef<number | null>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const previewBoxes = useRef(new Map<number, Box>());

  /** Liste : texte caché à l'arrivée, révélé quand les miniatures sont posées */
  const listRef = useRef<HTMLUListElement>(null);
  const revealPendingRef = useRef(false);
  /** Sortie du texte en cours (liste → grille) */
  const exitTlRef = useRef<gsap.core.Timeline | null>(null);
  /** Sortie du texte au départ vers un projet (ne touche pas au scroll) */
  const projectExitTlRef = useRef<gsap.core.Timeline | null>(null);
  /** Retour d'une page projet en liste : texte révélé quand l'image a fini de rentrer */
  const revealOnReturnRef = useRef(false);
  const wasSwitchingRef = useRef(false);
  /** Grille → liste : déclenchement différé de l'entrée du texte */
  const revealTimerRef = useRef<gsap.core.Tween | null>(null);

  // --- Texte de la liste : les trois états, partagés par toutes les transitions ---

  /** État de départ : filets rétractés, titres sous leur masque, numéros invisibles */
  const hideListText = () => {
    const root = listRef.current;
    if (!root) return false;
    const q = gsap.utils.selector(root);
    gsap.set(q('[data-line]'), { scaleX: 0, transformOrigin: 'left center' });
    gsap.set(q('[data-title]'), { yPercent: 110 });
    gsap.set(q('[data-meta]'), { opacity: 0 });
    return true;
  };

  /** Entrée : filets de gauche à droite, puis titres, puis numéros */
  const revealListText = () => {
    const root = listRef.current;
    if (!root) return null;
    const q = gsap.utils.selector(root);
    const { lineDuration, titleDuration, stagger, titlesDelay } = LIST_REVEAL;
    return gsap
      .timeline()
      .to(q('[data-line]'), {
        scaleX: 1,
        transformOrigin: 'left center',
        duration: lineDuration,
        stagger,
        ease: 'power3.inOut',
      })
      .to(
        q('[data-title]'),
        { yPercent: 0, duration: titleDuration, stagger, ease: 'power3.out' },
        titlesDelay,
      )
      .to(
        q('[data-meta]'),
        { opacity: 1, duration: 0.6, stagger, ease: 'power2.out' },
        titlesDelay + 0.2,
      );
  };

  /**
   * Sortie : l'inverse de l'entrée, plus courte (filets rétractés vers la droite).
   * cue : callback lancé à un moment précis de la sortie (ex. passage au plein écran)
   */
  const exitListText = (
    onComplete?: () => void,
    cue?: { at: number; fn: () => void },
  ) => {
    const root = listRef.current;
    if (!root) return null;
    const q = gsap.utils.selector(root);
    const { metaDuration, titleDuration, lineDuration, stagger, linesDelay } =
      LIST_EXIT;
    const tl = gsap
      .timeline({ onComplete })
      .to(
        q('[data-meta]'),
        { opacity: 0, duration: metaDuration, ease: 'power2.out' },
        0,
      )
      // Ease « out » : la sortie répond au clic dès la première image
      // (un « in » démarre trop lentement, le titre semble ne pas réagir)
      .to(
        q('[data-title]'),
        { yPercent: 110, duration: titleDuration, stagger, ease: 'power3.out' },
        0,
      )
      .to(
        q('[data-line]'),
        {
          scaleX: 0,
          transformOrigin: 'right center',
          duration: lineDuration,
          stagger,
          ease: 'power3.inOut',
        },
        linesDelay,
      );
    if (cue) tl.add(cue.fn, cue.at);
    return tl;
  };

  // Grille → liste : le texte entre à VIEW_SWITCH.revealAt, quand les images sont
  // visuellement posées, sans attendre la fin technique du glissement.
  // Fin de bascule (true → false) : on débloque, et on révèle si ce n'est pas fait.
  useEffect(() => {
    if (isViewSwitching) {
      wasSwitchingRef.current = true;
      if (revealPendingRef.current) {
        revealTimerRef.current = gsap.delayedCall(VIEW_SWITCH.revealAt, () => {
          revealTimerRef.current = null;
          revealPendingRef.current = false;
          revealListText();
        });
      }
      return;
    }
    if (!wasSwitchingRef.current) return;
    wasSwitchingRef.current = false;
    switchingRef.current = false;

    // Glissement plus court que revealAt (peu de projets) : révéler maintenant
    if (revealPendingRef.current) {
      revealTimerRef.current?.kill();
      revealTimerRef.current = null;
      revealPendingRef.current = false;
      revealListText();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isViewSwitching]);

  // Retour d'une page projet en liste : texte caché avant le paint…
  useLayoutEffect(() => {
    if (viewRef.current === 'list' && isReturning && hideListText()) {
      revealOnReturnRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // …puis révélé quand le Scene a fini de ramener l'image (isReturning → false)
  useEffect(() => {
    if (isReturning || !revealOnReturnRef.current) return;
    revealOnReturnRef.current = false;
    const tl = revealListText();
    return () => {
      tl?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReturning]);

  /** Rectangle écran que le plane i doit occuper dans la vue actuelle */
  const measure = (): ProjectItem[] =>
    projects
      .map((project, i) => {
        let rects: DOMRect | undefined;
        if (viewRef.current === 'grid') {
          rects = linkArray.current[i]?.getBoundingClientRect();
        } else {
          const box = previewBoxes.current.get(i);
          rects = box
            ? new DOMRect(box.x, box.y, box.w, box.h)
            : thumbRefs.current[i]?.getBoundingClientRect();
        }
        return rects ? { rects, imageUrl: project.featuredImage.src } : null;
      })
      .filter((item): item is ProjectItem => item !== null);

  const handleTransition = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    title: string,
    index: number,
    featuredImage: { src: string; alt: string },
    /** Cible du retour depuis la page projet (liste : la miniature) */
    returnRect: DOMRect = e.currentTarget.getBoundingClientRect(),
  ) => {
    e.preventDefault();
    if (switchingRef.current || navigatingRef.current) return;
    navigatingRef.current = true;
    playSound(OPEN_WHOOSH);
    setActive(false);

    // Lance le plein écran : le Scene démarre sur le changement de selectedIndex
    const startProjectTransition = (target: DOMRect) => {
      setSelectedIndex(index);
      setFromWorkPage(index);
      setSelectedSlug(slugify(title));
      setProjectImageSelected(featuredImage.src);
      setProjectSelectedCoords(target);
      setScrollY(window.scrollY);
      setFlag();
      setIsAnimating(true);
      setHoveredIndex(null);
    };

    if (viewRef.current !== 'list') {
      startProjectTransition(returnRect);
      return;
    }

    // 1. Cible du retour = miniature au repos. La ligne survolée est décalée
    //    (padding animé) ; au retour plus rien n'est survolé → on retire ce décalage.
    const shift = parseFloat(getComputedStyle(e.currentTarget).paddingLeft) || 0;
    const target = new DOMRect(
      returnRect.x - shift,
      returnRect.y,
      returnRect.width,
      returnRect.height,
    );

    // 2. Les autres aperçus encore en mouvement retournent sur leur miniature
    //    AVANT que le Scene ne mémorise leurs positions pour le retour.
    //    L'aperçu cliqué reste figé en place pendant la sortie du texte.
    hoveredRowRef.current = null;
    const clicked = previewBoxes.current.get(index);
    previewBoxes.current.clear();
    if (clicked) previewBoxes.current.set(index, clicked);
    setProjects(measure());

    // La page projet relit ces positions pour le retour → les miniatures seules,
    // et pour la ligne cliquée sa miniature au repos (sans le décalage du survol)
    previewBoxes.current.clear();
    const rests = measure().map((item, i) =>
      i === index ? { ...item, rects: target } : item,
    );
    localStorage.setItem('projectsDetails', JSON.stringify({ rects: rests }));

    // 3. Les titres sortent, puis l'image part en plein écran sans temps mort :
    //    le relais se fait dès les titres sortis, les filets finissent en parallèle.
    //    Scroll bloqué avant le relais : les positions mesurées doivent rester justes.
    lockScroll();
    const exit = exitListText(undefined, {
      at: LIST_EXIT.handoffAt,
      fn: () => {
        // Le plein écran prend la main (scroll compris) : plus rien à nettoyer ici
        projectExitTlRef.current = null;
        // Navigation lancée ailleurs entre-temps (header, menu) : on n'ouvre pas le projet
        if (leavingRef.current) {
          unlockScroll();
          return;
        }
        startProjectTransition(target);
      },
    });
    if (exit) projectExitTlRef.current = exit;
    else startProjectTransition(target);
  };

  const updateProjects = (force = false) => {
    // Pendant / juste après une transition : ne pas écraser les cibles GSAP
    if (
      !force &&
      (isAnimatingRef.current ||
        leavingRef.current ||
        switchingRef.current ||
        navigatingRef.current)
    )
      return;
    const rects = measure();
    if (rects.length === 0) return;
    setProjects(rects);
    const localStorageValue = JSON.stringify({ rects });
    localStorage.setItem('projectsDetails', localStorageValue);
  };

  /** Grille ↔ liste : on bascule le DOM, puis le layout effect envoie les cibles au Scene */
  const switchView = (next: WorksView) => {
    if (
      next === viewRef.current ||
      switchingRef.current ||
      navigatingRef.current ||
      isAnimatingRef.current ||
      leavingRef.current
    )
      return;
    switchingRef.current = true;
    // Plus de ligne survolée : les aperçus ouverts rétrécissent vers leur miniature
    // pendant la sortie du texte (la boucle d'aperçu continue de tourner)
    hoveredRowRef.current = null;
    setActive(false);
    setHoveredIndex(null);

    // Bascule réelle du DOM (le layout effect enchaîne sur le glissement des images)
    const commit = () => {
      exitTlRef.current = null;
      pendingSwitchRef.current = true;
      setView(next);
      setWorksView(next);
    };

    const root = listRef.current;
    if (viewRef.current !== 'list' || !root) {
      commit();
      return;
    }

    // Liste → grille : les titres sortent, puis les images partent sans temps mort.
    // Au relais, la grille est montée mais la liste reste par-dessus jusqu'à la fin
    // de ses filets (sinon ils disparaîtraient d'un coup).
    lockScroll();
    exitTlRef.current = exitListText(() => setLingerList(false), {
      at: LIST_EXIT.handoffAt,
      fn: () => {
        setLingerList(true);
        commit();
      },
    });
  };

  // Sur Works, worksView = la vue affichée : le Scene s'y fie pour caler ses départs
  useEffect(() => {
    setWorksView(view);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  // Départ vers Home / Contact depuis la liste : même sortie que liste → grille.
  // Le Scene lance les images à LIST_EXIT.handoffAt, une fois les titres sortis.
  useEffect(() => {
    if (!(goToContact || returnHome) || viewRef.current !== 'list') return;
    hoveredRowRef.current = null;
    setHoveredIndex(null);
    revealTimerRef.current?.kill();
    revealPendingRef.current = false;
    const tl = exitListText();
    return () => {
      tl?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goToContact, returnHome]);

  // Sortie interrompue (navigation pendant l'animation) : ne pas laisser le scroll bloqué
  useEffect(
    () => () => {
      if (exitTlRef.current) {
        exitTlRef.current.kill();
        unlockScroll();
      }
      revealTimerRef.current?.kill();
      // Démonté pendant la sortie du texte (projet pas encore lancé) : débloquer
      if (projectExitTlRef.current) {
        projectExitTlRef.current.kill();
        unlockScroll();
      }
    },
    [],
  );

  // Après la bascule du DOM (avant le paint) : remonter en haut, mesurer, lancer le glissement
  useLayoutEffect(() => {
    if (!pendingSwitchRef.current) return;
    pendingSwitchRef.current = false;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
    lockScroll();
    // Arrivée en liste : texte caché avant le paint, révélé après le glissement
    if (view === 'list' && hideListText()) {
      revealPendingRef.current = true;
    }
    const rects = measure();
    // Même rendu : le Scene voit les nouvelles cibles ET isViewSwitching
    setIsViewSwitching(true);
    setProjects(rects);
    localStorage.setItem('projectsDetails', JSON.stringify({ rects }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  useLayoutEffect(() => {
    setIsLostPage(false);
    // Pendant le reverse le scroll reste verrouillé (Scene)
    if (!isReturning) unlockScroll();
  }, [setIsLostPage, isReturning]);

  // Mesure quand on est bien installé sur /work (pas en train de partir vers contact/home)
  useLayoutEffect(() => {
    if (
      fromHome ||
      isAnimating ||
      goToContact ||
      goToWork ||
      returnHome ||
      goToProject ||
      isViewSwitching
    )
      return;
    updateProjects();
  }, [
    fromHome,
    isAnimating,
    goToContact,
    goToWork,
    returnHome,
    goToProject,
    isViewSwitching,
  ]);

  // Contact→works : scroll + re-mesure derrière le plane fullscreen
  // + sync projectSelectedCoords (même cible que works→projet→works)
  useLayoutEffect(() => {
    window.scrollTo(0, scrollY ?? 0);
    if (isReturning && !getFlag()) {
      updateProjects(true);
      if (selectedIndex !== null) {
        const el = linkArray.current[selectedIndex];
        if (el) setProjectSelectedCoords(el.getBoundingClientRect());
      }
    }
  }, [isReturning, scrollY, selectedIndex, setProjectSelectedCoords]);

  useEffect(() => {
    const grid = document.getElementById('grid');
    setTimeout(() => {
      while (grid?.firstChild) {
        grid.removeChild(grid.firstChild);
      }
    }, 300);

    const onScrollOrResize = () => updateProjects();
    window.addEventListener('scroll', onScrollOrResize);
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, []);

  useLayoutEffect(() => {
    if (!finePointer || !titleRef.current) return;
    const tl = gsap.timeline();
    const splitTitle = SplitText.create(titleRef.current, {
      type: 'chars',
    });

    if (active) {
      tl.fromTo(
        splitTitle.chars,
        { yPercent: 110 },
        { yPercent: 0, stagger: 0.03, ease: 'expo.out' },
      );
    } else {
      tl.fromTo(
        splitTitle.chars,
        { yPercent: 0 },
        {
          yPercent: 110,
          stagger: 0.03,
          duration: 0.6,
          ease: 'expo.out',
          onComplete: () => {
            hoveredIndexRef.current = null;
          },
        },
      );
    }
  }, [active, finePointer]);

  const handleMouseMove = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    index: number | null,
  ) => {
    if (
      !finePointer ||
      index === null ||
      switchingRef.current ||
      navigatingRef.current
    )
      return;
    const rects = e.currentTarget.getBoundingClientRect();
    const pointXCoords = e.clientX - rects.left;
    const pointYCoords = e.clientY - rects.top;
    const pointX = pointXCoords / rects.width;
    const pointY = 1 - pointYCoords / rects.height;
    const uv = { x: pointX, y: pointY };
    setUv(uv);
    setHoveredIndex(index);
    hoveredIndexRef.current = index;
    setActive(true);
  };

  const handleMouseLeave = () => {
    if (!finePointer) return;
    setActive(false);
    setHoveredIndex(null);
  };

  /** Liste : survol d'une ligne */
  const handleRowEnter = (index: number) => {
    if (
      switchingRef.current ||
      isAnimatingRef.current ||
      navigatingRef.current
    )
      return;
    hoveredRowRef.current = index;
    setHoveredIndex(index);
  };

  const handleRowLeave = () => {
    hoveredRowRef.current = null;
    setHoveredIndex(null);
  };

  // Liste (souris) : chaque image, l'aperçu survolé glisse vers le curseur,
  // les autres reviennent à leur miniature. Même lissage en temps réel que le loader.
  useEffect(() => {
    if (view !== 'list' || !finePointer) return;
    const boxes = previewBoxes.current;
    let id = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(now - last, 32);
      last = now;
      // Départ vers un projet : plus aucun aperçu ni mesure
      if (navigatingRef.current) {
        id = requestAnimationFrame(tick);
        return;
      }
      const k = 1 - Math.pow(1 - LIST_PREVIEW.smoothing, dt / 16.67);
      const hovered = hoveredRowRef.current;
      const pointer = pointerRef.current;

      // Nouvelle ligne survolée : l'aperçu part de sa miniature
      if (hovered !== null && !boxes.has(hovered)) {
        const thumb = thumbRefs.current[hovered];
        if (thumb) boxes.set(hovered, toBox(thumb.getBoundingClientRect()));
      }

      let moved = false;
      boxes.forEach((box, i) => {
        const thumb = thumbRefs.current[i];
        if (!thumb) return;
        const target =
          i === hovered && pointer
            ? previewBox(pointer)
            : toBox(thumb.getBoundingClientRect());
        const dx = target.x - box.x;
        const dy = target.y - box.y;
        const dw = target.w - box.w;
        const dh = target.h - box.h;
        // Revenue sur sa miniature : la mesure normale reprend la main
        if (i !== hovered && Math.abs(dx) + Math.abs(dy) + Math.abs(dw) < 0.5) {
          boxes.delete(i);
          moved = true;
          return;
        }
        if (Math.abs(dx) + Math.abs(dy) + Math.abs(dw) + Math.abs(dh) > 0.05) {
          box.x += dx * k;
          box.y += dy * k;
          box.w += dw * k;
          box.h += dh * k;
          moved = true;
        }
      });

      // Pendant la sortie du texte, les aperçus doivent finir de rentrer :
      // seule exception au blocage des mesures pendant une bascule
      if (moved) updateProjects(Boolean(exitTlRef.current));

      // Ondulation : point d'impact = curseur, relatif à l'aperçu
      if (hovered !== null && pointer) {
        const box = boxes.get(hovered);
        if (box) {
          setUv({
            x: (pointer.x - box.x) / box.w,
            y: 1 - (pointer.y - box.y) / box.h,
          });
        }
      }

      id = requestAnimationFrame(tick);
    };

    id = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(id);
      boxes.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, finePointer]);

  useEffect(() => {
    if (!finePointer) return;

    const tick = () => {
      if (
        currentX.current === null ||
        currentY.current === null ||
        hoveredIndexRef.current === null
      ) {
        requestAnimationFrame(tick);
      } else if (titleWrapperRef.current) {
        currentX.current =
          currentX.current + (targetX.current - currentX.current) * 0.1;
        currentY.current =
          currentY.current + (targetY.current - currentY.current) * 0.1;
        titleWrapperRef.current.style.left = currentX.current + 'px';
        titleWrapperRef.current.style.top = currentY.current + 'px';
        requestAnimationFrame(tick);
      } else {
        requestAnimationFrame(tick);
      }
    };
    const id = requestAnimationFrame(tick);
    const handleMove = (e: MouseEvent) => {
      pointerRef.current = { x: e.clientX, y: e.clientY };
      targetX.current = e.clientX + 50;
      targetY.current = e.clientY - 10;
      if (currentX.current === null) {
        currentX.current = targetX.current;
      }
      if (currentY.current === null) {
        currentY.current = targetY.current;
      }
    };
    window.addEventListener('mousemove', handleMove);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      cancelAnimationFrame(id);
    };
  }, [finePointer]);

  // Barre grille / liste masquée pendant une transition de page
  const barHidden =
    isAnimating || goToContact || goToWork || returnHome || goToProject;

  return (
    <>
      <div
        className={`fixed left-1/2 top-[96px] z-[60] flex w-[85%] -translate-x-1/2 items-center justify-between font-fabrikatMono text-[11px] uppercase tracking-[0.14em] text-white mix-blend-difference transition-opacity duration-500 md:w-[90%] ${
          barHidden ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      >
        <p>
          Works{' '}
          <span className="opacity-50 tabular-nums">
            ({String(projects.length).padStart(2, '0')})
          </span>
        </p>
        {/* Icônes : zone de clic 36 px, décalée pour aligner le pictogramme sur la marge */}
        <div
          className="-mr-[11px] flex"
          role="group"
          aria-label="Affichage"
        >
          {(['grid', 'list'] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              aria-label={v === 'grid' ? 'Grille' : 'Liste'}
              title={v === 'grid' ? 'Grille' : 'Liste'}
              onClick={() => switchView(v)}
              className={`grid h-[36px] w-[36px] place-items-center outline-none transition-opacity duration-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-6px] focus-visible:outline-current ${
                view === v ? 'opacity-100' : 'opacity-35 hover:opacity-100'
              } ${finePointer ? 'cursor-none' : ''}`}
            >
              <ViewIcon view={v} />
            </button>
          ))}
        </div>
      </div>

      <div
        className={`relative w-[100vw] z-[10] ${
          view === 'grid'
            ? 'flex justify-center items-center transition-height duration-1000'
            : ''
        }`}
        ref={mainWrapperRef}
        style={view === 'grid' ? { height: metrics.height } : undefined}
      >
        <IntroGridPhantom projects={projects} />
        <ContactPhantomGrid projects={projects} />

        {view === 'grid' ? (
          <div
            className={`w-full grid grid-cols-10 gap-[20px] z-[2] `}
            ref={gridRef}
            style={{
              height: metrics.height,
              gridTemplateRows: `repeat(${metrics.rows}, minmax(0, 1fr))`,
            }}
          >
            {projects.map(({ title, featuredImage }, index) => {
              const placement = getGridPlacement(index);
              return (
                <Link
                  key={index}
                  href={`/work/${slugify(title)}`}
                  prefetch={true}
                  className={`${placement.className} ${finePointer ? 'cursor-none' : ''}`}
                  onClick={(e) =>
                    handleTransition(e, title, index, featuredImage)
                  }
                  onMouseMove={
                    finePointer ? (e) => handleMouseMove(e, index) : undefined
                  }
                  onMouseLeave={finePointer ? handleMouseLeave : undefined}
                  style={placement.style}
                  ref={(el) => {
                    linkArray.current[index] = el!;
                  }}
                ></Link>
              );
            })}
            {finePointer ? (
              <div
                className="fixed overflow-hidden pointer-events-none"
                ref={titleWrapperRef}
              >
                <p
                  className=" font-fabrikatMono "
                  style={{
                    color: 'black',
                    fontSize: 'clamp(36px, 4vw, 60px)',
                    letterSpacing: '-0.01em',
                    textShadow:
                      '0 2px 34px rgba(10,12,14,0.55), 0 0 2px rgba(10,12,14,0.4)',
                  }}
                  ref={titleRef}
                >
                  {hoveredIndexRef.current === null
                    ? null
                    : projects[hoveredIndexRef.current].title}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
        {/* Deux emplacements distincts (pas un ternaire) : la liste garde le même
            nœud DOM pendant qu'elle s'attarde, donc ses animations continuent */}
        {view === 'list' || lingerList ? (
          <ul
            ref={listRef}
            className={`z-[2] mx-auto w-[85%] pb-0 pt-[160px] md:w-[90%] md:pt-[180px] ${
              view === 'list'
                ? 'relative'
                : 'pointer-events-none absolute inset-x-0 top-0'
            }`}
            aria-label="Liste des projets"
            aria-hidden={view !== 'list'}
          >
            {projects.map(({ title, featuredImage }, index) => {
              const isOn = hoveredIndex === index;
              const isDimmed = hoveredIndex !== null && !isOn;
              return (
                <li key={index} className="relative">
                  {/* Filet animé (scaleX) à la place d'une bordure */}
                  <span
                    data-line
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left bg-black/15"
                  />
                  <Link
                    href={`/work/${slugify(title)}`}
                    prefetch={true}
                    onClick={(e) =>
                      handleTransition(
                        e,
                        title,
                        index,
                        featuredImage,
                        thumbRefs.current[index]?.getBoundingClientRect(),
                      )
                    }
                    onMouseEnter={
                      finePointer ? () => handleRowEnter(index) : undefined
                    }
                    onMouseLeave={finePointer ? handleRowLeave : undefined}
                    className={`grid grid-cols-[64px_minmax(0,1fr)] items-center gap-4 py-[18px] text-black transition-[opacity,padding] duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] md:grid-cols-[40px_76px_minmax(0,1fr)_24px] md:gap-6 md:py-[22px] ${
                      isDimmed ? 'opacity-30' : 'opacity-100'
                    } ${isOn ? 'md:pl-[14px]' : ''} ${
                      finePointer ? 'cursor-none' : ''
                    }`}
                  >
                    <span
                      data-meta
                      className="hidden font-fabrikatMono text-[11px] tracking-[0.14em] text-black/60 tabular-nums md:block"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {/* Fantôme : le plane WebGL se pose ici */}
                    <div
                      aria-hidden
                      className="h-[64px] w-[64px] md:h-[56px] md:w-[76px]"
                      ref={(el) => {
                        thumbRefs.current[index] = el;
                      }}
                    />
                    {/* Masque : le padding laisse la place aux accents et jambages (É, g, j) */}
                    <span className="-my-[0.1em] block min-w-0 overflow-hidden py-[0.1em] font-sans text-[1.7rem] font-bold leading-[0.95] tracking-[-0.035em] [overflow-wrap:anywhere] md:text-[clamp(1.8rem,4.4vw,4.4rem)]">
                      <span data-title className="block">
                        {title}
                      </span>
                    </span>
                    <span
                      data-meta
                      aria-hidden
                      className={`hidden text-[18px] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] md:block ${
                        isOn ? 'translate-x-1 -translate-y-1' : ''
                      }`}
                    >
                      ↗
                    </span>
                  </Link>
                </li>
              );
            })}
            {/* Filet de fermeture sous la dernière ligne */}
            <li aria-hidden className="relative h-px">
              <span
                data-line
                className="absolute inset-x-0 top-0 h-px origin-left bg-black/15"
              />
            </li>
          </ul>
        ) : null}
      </div>
    </>
  );
}
