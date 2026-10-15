'use client';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useThreeJsContext } from '@/contexts/ThreeJsContext';
import { useHeaderContext } from '@/contexts/HeaderContext';
import { Project as ProjectModel } from '@/src/models/Project';
import { slugify } from '@/utils/slugify';
import { getLenis } from '@/utils/scroll';
import { useOpenProject } from './useOpenProject';
import { NEXT_PROJECT, measureTrack, nextProjectStore } from '@/utils/nextProject';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface Props {
  projects: Pick<ProjectModel, 'featuredImage' | 'title'>[];
  currentIndex: number;
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Fin de page projet : piste de scroll. Le Scene pose l'image du projet suivant
 * sur getNextRect() — petite au centre, puis plein écran. À 100 %, on change
 * de route sous l'image : la nouvelle page la prend comme hero, sans coupure.
 */
const NextProject = ({ projects, currentIndex }: Props) => {
  const { goToContact, goToWork, goToProject, returnHome } =
    useThreeJsContext();
  const openProject = useOpenProject(projects);
  const { isReturning } = useHeaderContext();

  const trackRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const counterRef = useRef<HTMLParagraphElement>(null);
  const swappedRef = useRef(false);
  const [mounted, setMounted] = useState(false);

  const nextIndex = (currentIndex + 1) % projects.length;
  const next = projects[nextIndex];
  const href = `/work/${slugify(next.title)}`;

  // Une autre transition (header, menu, retour) a la main : on ne bascule pas
  const blockedRef = useRef(false);
  blockedRef.current = Boolean(
    goToContact || goToWork || goToProject || returnHome || isReturning,
  );

  // Bascule armée par un geste fait sur CETTE page : sur mobile, l'élan d'un swipe
  // commencé sur la page précédente continue et enchaînerait une 2e bascule
  const armedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    const arm = (e: Event) => {
      if (armedRef.current) return;
      // Molette pendant le blocage d'arrivée = inertie du geste précédent
      if (e.type === 'wheel' && getLenis()?.isStopped) return;
      armedRef.current = true;
      // Déjà au bout (l'élan y a mené) : le scroll ne bouge plus, aucun onUpdate
      // ne viendrait → on tente la bascule tout de suite
      trySwapRef.current();
    };
    const events = ['pointerdown', 'wheel', 'keydown'] as const;
    events.forEach((type) =>
      window.addEventListener(type, arm, { passive: true }),
    );
    return () => events.forEach((type) => window.removeEventListener(type, arm));
  }, []);

  // Inscription auprès du Scene (qui lit la piste à chaque image)
  useEffect(() => {
    if (currentIndex < 0 || projects.length < 2) return;
    const track = trackRef.current;
    nextProjectStore.el = track;
    nextProjectStore.index = nextIndex;
    nextProjectStore.enter = 0;
    nextProjectStore.progress = 0;
    return () => {
      // Seulement si c'est encore nous (la page suivante a pu s'inscrire avant)
      if (nextProjectStore.el === track) {
        nextProjectStore.el = null;
        nextProjectStore.index = -1;
        nextProjectStore.enter = 0;
        nextProjectStore.progress = 0;
      }
    };
  }, [currentIndex, nextIndex, projects.length]);

  // L'image est plein écran : on change de projet sous elle
  const swap = () => {
    swappedRef.current = true;
    openProject(nextIndex);
  };

  const trySwap = () => {
    const track = trackRef.current;
    if (
      track &&
      nextProjectStore.el === track &&
      !swappedRef.current &&
      !blockedRef.current &&
      armedRef.current &&
      // Mesurée, pas lue dans le store : iOS peut laisser une valeur périmée
      measureTrack(track, window.innerHeight).progress >= NEXT_PROJECT.swapAt
    ) {
      swap();
    }
  };
  // Lu par des écouteurs posés une seule fois : toujours la version à jour
  const trySwapRef = useRef(trySwap);
  trySwapRef.current = trySwap;

  // Deux ScrollTrigger sur la piste : l'entrée de la section, puis la croissance.
  // Lenis est déjà branché sur ScrollTrigger (SmoothScroll.tsx).
  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track || currentIndex < 0 || projects.length < 2) return;
      // Une page quittée peut encore recevoir un dernier onUpdate : on l'ignore
      const isMine = () => nextProjectStore.el === track;

      const updateCounter = () => {
        const counter = counterRef.current;
        if (!counter) return;
        const { enter, progress } = nextProjectStore;
        const show =
          enter >= NEXT_PROJECT.counterInAt && progress < NEXT_PROJECT.counterOutAt;
        counter.style.opacity = show ? '1' : '0';
        counter.textContent = `[ ${String(Math.round(progress * 100)).padStart(3, '0')} ]`;
      };

      // 1. La section monte dans l'écran : l'image du suivant arrive avec elle
      ScrollTrigger.create({
        trigger: track,
        start: 'top bottom', // le haut de la section touche le bas de l'écran
        end: 'top top', // … puis le haut de l'écran
        onUpdate: (self) => {
          if (!isMine()) return;
          nextProjectStore.enter = self.progress;
          updateCounter();
        },
      });

      // 2. Section épinglée : les textes partent, l'image grandit, bascule à la fin
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: track,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true, // la timeline suit le scroll (Lenis lisse déjà)
            onUpdate: (self) => {
              if (!isMine()) return;
              nextProjectStore.progress = self.progress;
              updateCounter();
              trySwap();
            },
          },
        })
        // Timeline de durée 1 = toute la piste : 0.33 = son premier tiers
        .to(
          [labelRef.current, titleRef.current],
          { opacity: 0, duration: NEXT_PROJECT.textsOutAt },
          0,
        )
        .to(titleRef.current, { y: -NEXT_PROJECT.titleRise, duration: 1 }, 0);

      // Les visuels au-dessus se chargent après coup et allongent la page :
      // ScrollTrigger doit alors recalculer ses positions de départ et d'arrivée
      const observer = new ResizeObserver(() => ScrollTrigger.refresh());
      observer.observe(document.body);
      return () => observer.disconnect();
    },
    // swap lit des valeurs stables pour ce projet (nextIndex, href)
    { scope: trackRef, dependencies: [nextIndex] },
  );

  // Clic : on déroule la piste jusqu'au bout (la bascule se fait d'elle-même)
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (swappedRef.current || blockedRef.current) return;
    const end = document.documentElement.scrollHeight - window.innerHeight;
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(end, {
        duration: 1.5,
        easing: (t) => 1 - Math.pow(1 - t, 3),
      });
    } else {
      window.scrollTo({ top: end, behavior: 'smooth' });
    }
  };

  if (currentIndex < 0 || projects.length < 2) return null;

  return (
    <section
      ref={trackRef}
      aria-label="Projet suivant"
      className="relative"
      style={{ height: `${NEXT_PROJECT.trackVh}vh` }}
    >
      <div className="sticky top-0 h-screen">
        {/* Vrai lien : préchargé par Next dès qu'il est visible, lisible au clavier */}
        <Link
          href={href}
          prefetch={true}
          onClick={handleClick}
          aria-label={`Projet suivant : ${next.title}`}
          className="absolute inset-0 block"
        />
        <p
          ref={labelRef}
          className="pointer-events-none absolute left-[7.5%] top-[22vh] font-fabrikatMono text-[11px] uppercase tracking-[0.14em] text-black/55 md:left-[5%]"
        >
          [ Projet suivant — {pad(nextIndex + 1)} / {pad(projects.length)} ]
        </p>
        <p
          ref={titleRef}
          className="pointer-events-none absolute left-[7.5%] right-[7.5%] top-[calc(22vh+28px)] font-sans text-[clamp(2.4rem,7.2vw,7.4rem)] font-bold leading-[0.92] tracking-[-0.045em] text-black md:left-[5%] md:right-[5%]"
        >
          {next.title}
        </p>
      </div>
      {/* Hors de la section : un parent « sticky » isolerait le mix-blend */}
      {mounted
        ? createPortal(
            <p
              ref={counterRef}
              aria-hidden
              className="pointer-events-none fixed bottom-[28px] left-1/2 z-[60] -translate-x-1/2 font-fabrikatMono text-[11px] uppercase tracking-[0.14em] text-white tabular-nums opacity-0 mix-blend-difference"
            >
              [ 000 ]
            </p>,
            document.body,
          )
        : null}
    </section>
  );
};

export default NextProject;
