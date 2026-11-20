'use client';
import { useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { CaseStudy } from '@/utils/caseStudies';

const pad = (n: number) => String(n).padStart(2, '0');
const caps = 'text-[10px] md:text-[11px] uppercase tracking-[0.14em]';

/**
 * Le contenu d'une étude de cas, sous l'image du hero (même place que les
 * captures d'une page projet) : présentation, rôle et technologies, puis les
 * quatre parties numérotées.
 */
const CaseStudyBody = ({
  study,
  projectHref,
}: {
  study: CaseStudy;
  projectHref: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // Les parties montent en fondu en arrivant dans l'écran
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-rise]').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 24,
          duration: 0.9,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="font-fabrikatMono text-black">
      <section className="mx-auto flex w-[85%] flex-col gap-14 py-20 md:w-[90%] md:flex-row md:flex-wrap md:gap-16 md:py-32">
        {/* Ordinateur : la colonne reste à l'écran (sticky) pendant qu'on lit
            les 4 parties → « Voir le projet » est toujours visible */}
        <div
          data-rise
          className="flex min-w-0 flex-col gap-10 self-start md:sticky md:top-[20vh] md:flex-[1_1_380px]"
        >
          <p className="max-w-[34ch] font-sans text-[22px] font-bold leading-[1.15] tracking-[-0.02em] md:text-[30px]">
            {study.intro}
          </p>
          <dl className="grid grid-cols-[120px_minmax(0,1fr)] gap-x-4 gap-y-3.5 text-[14px] leading-[1.5] md:text-[15px]">
            <dt className={`${caps} pt-1 text-black/70`}>Rôle</dt>
            <dd>{study.role.join(' · ')}</dd>
            <dt className={`${caps} pt-1 text-black/70`}>Technologies</dt>
            <dd>{study.stack.join(' · ')}</dd>
          </dl>
          <Link
            href={projectHref}
            className={`${caps} hidden min-h-[44px] items-end gap-3 self-start border-b border-black pb-1 md:inline-flex`}
          >
            <span aria-hidden="true">←</span> Voir le projet
          </Link>
        </div>

        <ol className="min-w-0 md:flex-[1.4_1_520px]">
          {study.sections.map((section, i) => (
            <li
              key={section.title}
              data-rise
              className="grid grid-cols-[48px_1fr] gap-4 border-t border-black/15 py-6 last:border-b md:grid-cols-[74px_1fr] md:gap-5"
            >
              <b className="pt-1.5 text-[11px] tracking-[0.14em]">{pad(i + 1)}</b>
              <div>
                <h2 className="mb-2 font-sans text-[22px] font-bold tracking-[-0.02em] md:text-[30px]">
                  {section.title}
                </h2>
                <p className="max-w-[60ch] text-[15px] leading-[1.65] text-black/80 md:text-[16px]">
                  {section.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Mobile : la colonne passe au-dessus des parties, le lien va à la fin */}
      <div className="mx-auto flex w-[85%] justify-start pb-20 md:hidden">
        <Link
          href={projectHref}
          className={`${caps} inline-flex min-h-[44px] items-end gap-3 border-b border-black pb-1`}
        >
          <span aria-hidden="true">←</span> Voir le projet
        </Link>
      </div>
    </div>
  );
};

export default CaseStudyBody;
