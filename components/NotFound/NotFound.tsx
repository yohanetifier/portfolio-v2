'use client';

import { Project } from '@/src/models/Project';
import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, type MouseEvent } from 'react';
import gsap from 'gsap';
import { useThreeJsContext } from '@/contexts/ThreeJsContext';
import WorklistPhantomGrid from '../WorklistPhantomGrid/WorklistPhantomGrid';
import IntroGridPhantom from '../IntroPhantomGrid/IntroPhantomGrid';
import NotFoundPhantomGrid from './NotFoundPhantomGrid';
import ContactPhantomGrid from '../Contact/ContactPhantomGrid';
import { slugify } from '@/utils/slugify';

type Props = {
  projects: Pick<Project, 'title' | 'featuredImage'>[];
};

/**
 * Markup aligné sur Yeti Portfolio.dc.html → section nfRef.
 */
export default function NotFoundView({ projects }: Props) {
  const nfNumRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLElement>(null);
  const {
    setHoveredIndex,
    setUv,
    setScrollY,
    setIsLostPage,
    setIsAnimating,
    setReturnHome,
    setGoToContact,
    setGoToProject,
    setFromProjectSlug,
    setFromProjectIndex,
    setSelectedIndex,
    setProjectImageSelected,
    goToContact,
    goToWork,
    returnHome,
    goToProject,
  } = useThreeJsContext();

  useLayoutEffect(() => {
    setIsLostPage(true);
    setScrollY(0);
    document.body.style.backgroundColor = '#f4f3f0';
    return () => {
      setIsLostPage(false);
    };
  }, [setIsLostPage, setScrollY]);

  // Vague 404 — mêmes amplitudes / déphasage que le HTML, en GSAP (comme le mail)
  useEffect(() => {
    const host = nfNumRef.current;
    if (!host) return;

    const glyphs = host.querySelectorAll<HTMLElement>('[data-nf-glyph]');
    if (!glyphs.length) return;

    const tween = gsap.fromTo(
      glyphs,
      { y: 10, rotation: -1.1 },
      {
        y: -10,
        rotation: 1.1,
        duration: Math.PI / 1.5,
        ease: 'sine.inOut',
        stagger: {
          each: 0.7 / 1.5,
          from: 'start',
          repeat: -1,
          yoyo: true,
        },
      },
    );

    return () => {
      tween.kill();
      gsap.set(glyphs, { y: 0, rotation: 0 });
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      setHoveredIndex(null);
      setReturnHome(true);
      setIsAnimating(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setReturnHome, setIsAnimating]);

  // Sortie 404 → Contact / Works / Yeti / Projet : fade du texte
  useEffect(() => {
    if (
      (!goToContact && !goToWork && !returnHome && !goToProject) ||
      !contentRef.current
    )
      return;

    gsap.to(contentRef.current, {
      opacity: 0,
      duration: 1,
      ease: 'power2.inOut',
      overwrite: 'auto',
    });
  }, [goToContact, goToWork, returnHome, goToProject]);

  const goHome = (e: MouseEvent) => {
    e.preventDefault();
    setHoveredIndex(null);
    setReturnHome(true);
    setIsAnimating(true);
  };

  const goContact = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHoveredIndex(null);
    setFromProjectSlug(null);
    setFromProjectIndex(-1);
    setGoToContact(true);
    setIsAnimating(true);
  };

  const openProject = (index: number) => {
    const project = projects[index];
    if (!project) return;
    const slug = slugify(project.title);
    setHoveredIndex(null);
    setSelectedIndex(index);
    setFromProjectIndex(index);
    setFromProjectSlug(slug);
    setProjectImageSelected(project.featuredImage.src);
    setGoToProject(true);
    setIsAnimating(true);
  };

  return (
    <>
      {/* Cibles transitions — hors overflow/opacity (sinon rects faux → bugs après la 404) */}
      <WorklistPhantomGrid projects={projects} />
      <IntroGridPhantom projects={projects} />
      <ContactPhantomGrid projects={projects} />

      {/* === section nfRef (HTML source) === */}
      <section
        ref={contentRef}
        data-nf
        className="fixed inset-0 z-[2] overflow-hidden text-[#12120f]"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(72% 58% at 30% 46%, rgba(244,243,240,0.96) 0%, rgba(244,243,240,0.78) 46%, rgba(244,243,240,0.18) 78%, rgba(244,243,240,0) 100%)',
          }}
        />

        <div
          className="pane relative flex h-full max-w-[min(760px,62vw)] flex-col items-start justify-start gap-[clamp(16px,3vh,36px)] overflow-y-auto px-[6vw] pb-[92px] pt-[100px] font-fabrikatMono font-normal pointer-events-none [&_a]:pointer-events-auto"
        >
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#12120f]">
            [ error 404 — lost at sea ]
          </span>

          <div
            ref={nfNumRef}
            data-nf-num
            className="mt-auto flex overflow-visible font-fabrikatMono text-[clamp(76px,22vw,260px)] font-bold leading-[0.8] tracking-[-0.045em] text-[#12120f]"
          >
            {'404'.split('').map((ch, i) => (
              <span
                key={i}
                data-nf-glyph={i}
                className="inline-block will-change-transform"
              >
                {ch}
              </span>
            ))}
          </div>

          <p className="m-0 max-w-[46ch] text-[13px] leading-[1.7] text-[#12120f] text-pretty">
            This page sank. The six projects are drifting around you — move the
            mouse to stir the current, click a wreck to surface.
          </p>

          <div className="mb-auto flex flex-wrap gap-x-[26px] gap-y-3 pointer-events-auto">
            <Link
              href="/"
              onClick={goHome}
              data-cursor
              data-magnet="1"
              className="flex min-h-12 cursor-none items-center rounded-full border border-[#12120f] px-[26px] text-[11px] uppercase tracking-[0.22em] text-[#12120f] hover:bg-[#12120f] hover:text-[#f4f3f0]"
            >
              Back to the index
            </Link>
            <button
              type="button"
              onClick={goContact}
              data-cursor
              data-magnet="1"
              className="flex min-h-12 cursor-none items-center border-0 bg-transparent p-0 text-[11px] uppercase tracking-[0.22em] text-[#12120f] opacity-70"
            >
              Contact ↗
            </button>
          </div>
        </div>
      </section>

      <NotFoundPhantomGrid
        projects={projects}
        onHover={(index, uv) => {
          setUv(uv);
          setHoveredIndex(index);
        }}
        onLeave={() => setHoveredIndex(null)}
        onSelect={openProject}
      />

      <p className="pointer-events-none fixed bottom-[22px] right-[34px] z-[40] font-fabrikatMono font-normal text-[10px] uppercase tracking-[0.22em] text-[#f4f3f0] mix-blend-difference">
        Esc for index
      </p>
    </>
  );
}
