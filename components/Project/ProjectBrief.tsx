'use client';
import { useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ProjectBrief as Brief } from '@/utils/projectDetails';

/**
 * En bas du hero, par-dessus l'image du projet (comme un générique) :
 * à gauche le rôle, la stack et une phrase ; à droite le lien « Étude de cas ».
 * Il défile avec le hero.
 */
const ProjectBrief = ({ brief }: { brief: Brief }) => {
  const ref = useRef<HTMLDivElement>(null);
  const caps = 'text-[10px] md:text-[11px] uppercase tracking-[0.14em]';

  // Entre une fois l'image du projet en place (son vol dure ~1 s)
  useLayoutEffect(() => {
    if (!ref.current) return;
    const tween = gsap.fromTo(
      ref.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', delay: 0.9 },
    );
    return () => {
      tween.kill();
    };
  }, []);

  return (
    <>
      {/* Voile en bas de l'image : le texte blanc reste lisible sur une photo claire */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-black/45 to-transparent"
      />
      {/* Mêmes bords que le header et la nav projet : 85 % / 90 % de large, centrés */}
      <div
        ref={ref}
        className="absolute bottom-0 left-1/2 flex w-[85%] -translate-x-1/2 items-end justify-between gap-6 pb-8 text-white opacity-0 md:w-[90%] md:pb-10"
      >
        <div className="flex min-w-0 max-w-[520px] flex-col gap-2.5">
          <p className={`${caps} flex flex-col gap-1.5`}>
            <b className="font-bold">{brief.role}</b>
            <span className="text-white/75">{brief.stack.join(' · ')}</span>
          </p>
          <p className="text-[13px] leading-[1.6] md:text-[14px]">
            {brief.summary}
          </p>
        </div>

        {brief.caseStudy && (
          <Link
            href={brief.caseStudy}
            className={`${caps} inline-flex min-h-[44px] shrink-0 items-end gap-3 pb-1 whitespace-nowrap border-b border-white`}
          >
            Étude de cas <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
    </>
  );
};

export default ProjectBrief;
