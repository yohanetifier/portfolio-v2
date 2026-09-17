'use client';

import { Project } from '@/src/models/Project';
import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/all';
import { useThreeJsContext } from '@/contexts/ThreeJsContext';
import { useFinePointer } from '@/utils/useFinePointer';
import ContactPhantomGrid from './ContactPhantomGrid';
import WorklistPhantomGrid from '../WorklistPhantomGrid/WorklistPhantomGrid';

gsap.registerPlugin(SplitText);

const SOCIAL_LINKS = [
  { label: 'GITHUB', href: 'https://github.com/yohanetifier' },
  { label: 'LINKEDIN', href: 'https://www.linkedin.com/in/yohanetifier/' },
] as const;

type Props = {
  projects: Pick<Project, 'title' | 'featuredImage'>[];
};

export default function Contact({ projects }: Props) {
  const date = new Date();
  const init = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  const [now, setNow] = useState(init);
  const contentRef = useRef<HTMLDivElement>(null);
  const mailRef = useRef<HTMLAnchorElement>(null);
  const finePointer = useFinePointer();
  const { setProjects, setHoveredIndex, setUv, setScrollY, setIsLostPage, projectsContactCoords, goToWork, returnHome, goToProject } =
    useThreeJsContext();

  useEffect(() => {
    const id = window.setInterval(() => {
      const date = new Date();
      setNow(
        `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
      );
    }, 30000);
    return () => window.clearInterval(id);
  }, []);

  // Remet le scroll en haut pour le retour Works / projet
  useEffect(() => {
    setScrollY(0);
  }, [setScrollY]);

  useLayoutEffect(() => {
    setIsLostPage(false);
  }, [setIsLostPage]);

  useEffect(() => {
    if (!projectsContactCoords?.length) return;
    setProjects(projectsContactCoords);
  }, [projectsContactCoords, setProjects]);

  // Arrivée en cascade — hidden en CSS puis anim avant paint (évite flash visible→caché→visible)
  useLayoutEffect(() => {
    const root = contentRef.current;
    if (!root) return;

    const items = root.querySelectorAll<HTMLElement>('[data-reveal]');
    gsap.set(items, { opacity: 0, y: 18 });
    const tween = gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: 0.55,
      stagger: 0.12,
      ease: 'power3.out',
      delay: 0.15,
    });

    return () => {
      tween.kill();
    };
  }, []);

  // Vague sur le mail (desktop / fine pointer)
  useEffect(() => {
    const el = mailRef.current;
    if (!el || !finePointer) return;

    const split = SplitText.create(el, { type: 'chars' });
    const wave = gsap.to(split.chars, {
      yPercent: -22,
      duration: 0.5,
      ease: 'sine.inOut',
      stagger: { each: 0.055, from: 'start', repeat: -1, yoyo: true },
      paused: true,
    });

    const onEnter = () => {
      wave.play();
    };
    const onLeave = () => {
      wave.pause().progress(0);
    };

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);

    return () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      wave.kill();
      split.revert();
    };
  }, [finePointer]);

  // Sortie Contact → Works / Yeti / Projet : fade texte
  useEffect(() => {
    if ((!goToWork && !returnHome && !goToProject) || !contentRef.current)
      return;

    gsap.to(contentRef.current, {
      opacity: 0,
      duration: 1,
      ease: 'power2.inOut',
      overwrite: 'auto',
    });
  }, [goToWork, returnHome, goToProject]);

  // Accès direct / refresh sur Contact (sans écraser une anim en cours)
  useEffect(() => {
    document.body.style.backgroundColor = '#f4f3f0';
    return () => {
      // Laissé à Scene (returnHome / goToWork) — pas de snap blanc ici
    };
  }, []);

  return (
    <>
      <div
        className="pointer-events-none opacity-0 fixed inset-0 overflow-hidden"
        aria-hidden
      >
        <WorklistPhantomGrid projects={projects} />
      </div>

      <main className="relative z-[2] min-h-screen flex items-center text-black px-[8vw] md:px-[10vw] overflow-x-hidden">
        <div
          ref={contentRef}
          className="relative w-full max-w-[52%] pointer-events-none [&_a]:pointer-events-auto [&_[data-reveal]]:opacity-0"
        >
          <p
            data-reveal
            className="text-[10px] md:text-[11px] uppercase tracking-[0.12em] mb-6 md:mb-8"
          >
            [ UN PROJET ? ]
          </p>

          <a
            ref={mailRef}
            data-reveal
            href="mailto:contact@yohanetifier.com"
            className="block font-sans font-bold text-[clamp(1.6rem,5.5vw,4.5rem)] leading-[0.95] tracking-[-0.02em] mb-10 md:mb-14 cursor-none overflow-visible whitespace-nowrap"
            data-cursor
          >
            contact@yohanetifier.com
          </a>

          <nav
            data-reveal
            className="flex flex-wrap gap-x-10 md:gap-x-16 gap-y-3 mb-10 md:mb-12"
          >
            {SOCIAL_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] md:text-[11px] uppercase tracking-[0.12em] cursor-none"
                data-cursor
              >
                {label} ↗
              </Link>
            ))}
          </nav>

          <div data-reveal className="h-px w-full bg-black/80 mb-4 md:mb-5" />

          <div
            data-reveal
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[10px] md:text-[11px] uppercase tracking-[0.12em]"
          >
            <p className="flex items-center gap-2">
              <span aria-hidden className="text-[8px] leading-none">
                ●
              </span>
              Disponible pour de nouveaux projets
            </p>
            <p className="sm:text-right">
              Paris — <span>{now}</span>
            </p>
          </div>
        </div>

        <ContactPhantomGrid
          projects={projects}
          interactive
          onHover={(index, uv) => {
            setUv(uv);
            setHoveredIndex(index);
          }}
          onLeave={() => setHoveredIndex(null)}
        />
      </main>
    </>
  );
}
