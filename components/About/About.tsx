'use client';

import { Project } from '@/src/models/Project';
import { useEffect, useLayoutEffect } from 'react';
import { useThreeJsContext } from '@/contexts/ThreeJsContext';
import WorklistPhantomGrid from '../WorklistPhantomGrid/WorklistPhantomGrid';
import IntroGridPhantom from '../IntroPhantomGrid/IntroPhantomGrid';
import ContactPhantomGrid from '../Contact/ContactPhantomGrid';
import { PAPER } from '@/utils/theme';

type Props = {
  projects: Pick<Project, 'title' | 'featuredImage'>[];
};

const ROWS = [
  {
    title: 'Le métier',
    tag: 'Commerces · artisans',
    text: 'Poissonnier, marchés, hôtels, artisans : des métiers concrets, des clients sans service marketing, un budget qui doit servir.',
  },
  {
    title: 'La méthode',
    tag: 'Un seul interlocuteur',
    text: 'Je travaille seul, de la première maquette à la mise en ligne. Un site qui n’a pas été dessiné par quelqu’un qui ne le codera jamais.',
  },
  {
    title: 'Les outils',
    tag: 'Next.js · Astro · GSAP',
    text: 'Next.js ou Astro selon le projet, Three.js et GSAP quand le mouvement s’impose. Un CMS que le client utilise sans moi.',
  },
];

const STEPS = [
  {
    day: 'J+0',
    title: 'Maquette',
    text: 'On part de votre boutique, de vos clients, de vos photos. Une maquette validée ensemble avant la première ligne de code.',
  },
  {
    day: 'J+21',
    title: 'Code',
    text: 'Le site est construit sur mesure. Le mouvement arrive seulement s’il aide à vendre.',
  },
  {
    day: 'J+45',
    title: 'En ligne',
    text: 'Mise en ligne, prise en main du CMS, et je reste joignable après.',
  },
];

const STATS = [
  { value: '06', label: 'Sites en ligne' },
  { value: '03', label: 'Ans à mon compte' },
  { value: '01', label: 'Interlocuteur' },
];

const label = 'text-[10px] md:text-[11px] uppercase tracking-[0.14em]';
const display = 'font-sans font-bold tracking-[-0.03em] leading-[0.98] [text-wrap:balance]';
const soft = 'text-[13px] leading-[1.6] text-black/60';
// Colonne de texte : à gauche, les images occupent la droite
const col = 'w-full md:w-[min(560px,46vw)]';

export default function About({ projects }: Props) {
  const { setProjects, setScrollY, setIsLostPage, projectsContactCoords } =
    useThreeJsContext();

  useEffect(() => {
    setScrollY(0);
    document.body.style.backgroundColor = PAPER;
  }, [setScrollY]);

  useLayoutEffect(() => {
    setIsLostPage(false);
  }, [setIsLostPage]);

  // Provisoire (jusqu'à l'étape 3) : les images se rangent dans la grille de
  // Contact, à droite. Ensuite, le Scene les placera section par section.
  useEffect(() => {
    if (projectsContactCoords?.length) setProjects(projectsContactCoords);
  }, [projectsContactCoords, setProjects]);

  return (
    <>
      <WorklistPhantomGrid projects={projects} />
      <IntroGridPhantom projects={projects} />
      <ContactPhantomGrid projects={projects} />

      <main className="relative z-[2] text-black px-[8vw] md:px-[10vw] overflow-x-hidden">
        {/* Hero */}
        <section className="flex min-h-[100svh] flex-col justify-start gap-7 pt-[18vh] md:justify-center md:pt-0">
          <p className={label}>[ À propos ]</p>
          <h1 className={`${display} ${col} text-[clamp(2rem,4.6vw,4.1rem)]`}>
            Je conçois et je code des sites pour des commerces qui méritent
            mieux qu’un template.
          </h1>
          <p className={`${label} flex flex-wrap gap-8`}>
            <span>Yohan Etifier — Paris</span>
            <span>↓ Scroll</span>
          </p>
        </section>

        {/* Portrait : la légende (les images formeront le portrait à droite) */}
        <section className="flex min-h-[100svh] flex-col justify-start gap-5 pt-[13vh] md:justify-center md:pt-0">
          <p className={label}>[ Yohan Etifier ]</p>
          <h2 className={`${display} ${col} text-[clamp(1.9rem,4vw,3.6rem)]`}>
            Six sites en ligne. Une seule personne derrière.
          </h2>
          <p className={`${soft} hidden max-w-[34ch] md:block`}>
            Designer et développeur. De la première maquette à la mise en
            ligne, sans intermédiaire.
          </p>
        </section>

        {/* Manifeste */}
        <section className="flex min-h-[120vh] items-center py-[20vh]">
          <div className={`${col} flex flex-col gap-8`}>
            <p className={label}>[ Manifeste ]</p>
            <p className={`${display} text-[clamp(1.6rem,3.1vw,2.75rem)] leading-[1.08]`}>
              Un poissonnier n’a pas de service marketing. Il a un étal, des
              clients fidèles et dix minutes le dimanche soir pour mettre son
              site à jour. Je fais des sites pour lui : simples à tenir,
              impossibles à confondre avec un template.
            </p>
          </div>
        </section>

        {/* En bref */}
        <section className="flex min-h-[110vh] items-center py-[16vh]">
          <div className={`${col} flex flex-col gap-7`}>
            <p className={label}>[ En bref ]</p>
            <div className="border-b border-black/15">
              {ROWS.map((row) => (
                <div
                  key={row.title}
                  className="grid gap-2.5 border-t border-black/15 py-[26px]"
                >
                  <h3 className="flex items-baseline justify-between gap-4 font-sans text-[clamp(1.5rem,2.6vw,2.3rem)] font-bold tracking-[-0.02em]">
                    <span>{row.title}</span>
                    <small className={`${label} whitespace-nowrap text-black/60`}>
                      {row.tag}
                    </small>
                  </h3>
                  <p className={`${soft} max-w-[52ch]`}>{row.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Méthode */}
        <section className="flex min-h-[120vh] items-center py-[16vh]">
          <div className={`${col} flex flex-col gap-9`}>
            <p className={label}>[ Méthode — un projet type ]</p>
            <div className="h-px bg-black/15" />
            <ol>
              {STEPS.map((step) => (
                <li
                  key={step.day}
                  className="grid grid-cols-[74px_1fr] gap-5 border-t border-black/15 py-[22px] last:border-b"
                >
                  <b className="pt-1.5 text-[11px] tracking-[0.14em]">
                    {step.day}
                  </b>
                  <div>
                    <h3 className="mb-2 font-sans text-[clamp(1.4rem,2.2vw,2rem)] font-bold tracking-[-0.02em]">
                      {step.title}
                    </h3>
                    <p className={soft}>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Chiffres */}
        <section className="flex min-h-[100vh] items-center py-[16vh]">
          <div className={`${col} flex flex-col gap-7`}>
            <p className={label}>[ En chiffres ]</p>
            <dl>
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-baseline justify-between gap-4 border-t border-black/15 py-3.5 last:border-b"
                >
                  <dd className="font-sans text-[clamp(3.2rem,7vw,6.4rem)] font-bold leading-[0.9] tracking-[-0.04em] tabular-nums">
                    {stat.value}
                  </dd>
                  <dt className={`${label} text-right`}>{stat.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Contact */}
        <section className="flex min-h-[100svh] flex-col items-center justify-center gap-6 py-[12vh] text-center">
          <p className={label}>[ Un projet ? ]</p>
          <a
            href="mailto:contact@yohanetifier.com"
            className="font-sans text-[clamp(1.3rem,5.4vw,4.5rem)] font-bold leading-none tracking-[-0.02em] [overflow-wrap:anywhere] cursor-none"
            data-cursor
          >
            contact@yohanetifier.com
          </a>
          <p className={`${label} flex flex-wrap justify-center gap-7`}>
            <span>
              <span aria-hidden className="mr-1.5 text-[8px]">
                ●
              </span>
              Disponible pour de nouveaux projets
            </span>
            <span>Paris</span>
          </p>
        </section>
      </main>
    </>
  );
}
