'use client';

import { Project } from '@/src/models/Project';
import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger, SplitText } from 'gsap/all';
import { useFinePointer } from '@/utils/useFinePointer';
import { randomChars, scrambleText } from '@/utils/scrambleText';
import { useThreeJsContext } from '@/contexts/ThreeJsContext';
import WorklistPhantomGrid from '../WorklistPhantomGrid/WorklistPhantomGrid';
import IntroGridPhantom from '../IntroPhantomGrid/IntroPhantomGrid';
import ContactPhantomGrid from '../Contact/ContactPhantomGrid';
import { PAPER } from '@/utils/theme';
import { getLenis } from '@/utils/scroll';
import { aboutAnchors, measureAboutAnchors } from '@/utils/aboutLayout';

gsap.registerPlugin(ScrollTrigger, SplitText);

type Props = {
  projects: Pick<Project, 'title' | 'featuredImage'>[];
};

const EXPERTISES = [
  {
    title: 'Développement sur mesure',
    tag: 'Applications métier, plateformes web, interfaces et API.',
    text: 'Je développe des solutions adaptées à vos processus, à vos utilisateurs et à vos objectifs.',
  },
  {
    title: 'Architecture technique',
    tag: 'Conception d’architectures applicatives, organisation des services et choix technologiques.',
    text: 'Je construis des systèmes fiables, maintenables et capables d’accompagner l’évolution de votre activité.',
  },
  {
    title: 'Intégration & déploiement',
    tag: 'Interconnexion d’applications, déploiement et mise en production de solutions fiables, sécurisées et adaptées à votre environnement technique.',
    text: '',
  },
];

const STEPS = [
  {
    title: 'Comprendre',
    text: 'Analyser votre activité, vos besoins et vos contraintes.',
  },
  {
    title: 'Concevoir',
    text: 'Définir une solution technique cohérente et adaptée à vos objectifs.',
  },
  {
    title: 'Développer',
    text: 'Construire une application fiable, performante et simple à utiliser.',
  },
  {
    title: 'Déployer & accompagner',
    text: 'Mettre en production, assurer le suivi et faire évoluer votre solution.',
  },
];

const pad = (n: number) => String(n).padStart(2, '0');

const label = 'text-[10px] md:text-[11px] uppercase tracking-[0.14em]';
const display = 'font-sans font-bold tracking-[-0.03em] leading-[0.98] [text-wrap:balance]';
const soft = 'text-[13px] leading-[1.6] text-black/60';
// Colonne de texte : à gauche, les images occupent la droite
const col = 'w-full md:w-[min(560px,46vw)]';
// Une initiale mise en avant, en jaune : celles que dessinent les images (C, S,
// R) et celles des mots clés des deux premières sections (ambitions, vision)
const letter = 'text-[#FFC400]';

export default function About({ projects }: Props) {
  const {
    setProjects,
    setScrollY,
    setIsLostPage,
    projectsContactCoords,
    goToWork,
    goToContact,
    returnHome,
    goToProject,
  } = useThreeJsContext();
  const contentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setScrollY(0);
    document.body.style.backgroundColor = PAPER;
  }, [setScrollY]);

  useLayoutEffect(() => {
    setIsLostPage(false);
    // En haut de la page dès l'arrivée : depuis le menu, la navigation garde le
    // défilement de la page quittée (Works descendu → About au milieu)
    getLenis()?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
  }, [setIsLostPage]);

  // Où chaque section est centrée : le Scene y place la disposition de ses images.
  // Re-mesuré quand la page change de hauteur (resize, polices chargées).
  useLayoutEffect(() => {
    measureAboutAnchors();
    document.fonts?.ready.then(measureAboutAnchors);
    window.addEventListener('resize', measureAboutAnchors);
    return () => {
      window.removeEventListener('resize', measureAboutAnchors);
      aboutAnchors.current = [];
    };
  }, []);

  // Arrivée : le texte apparaît en fondu pendant que les images s'installent
  // (même durée et même courbe que leur vol, et que les fondus de Contact)
  useLayoutEffect(() => {
    const tween = gsap.fromTo(
      contentRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: 'power2.inOut' },
    );
    return () => {
      tween.kill();
    };
  }, []);

  // Départ (Works, Contact, Yeti, un projet) : le texte s'efface pendant que les
  // images partent vers la page suivante
  useEffect(() => {
    if (!(goToWork || goToContact || returnHome || goToProject)) return;
    gsap.to(contentRef.current, {
      opacity: 0,
      duration: 1,
      ease: 'power2.inOut',
      overwrite: 'auto',
    });
  }, [goToWork, goToContact, returnHome, goToProject]);

  // Animations du texte (prototype About). Une seule fois au montage ; tout
  // est annulé (textes découpés remis en place) en quittant la page.
  useLayoutEffect(() => {
    const root = contentRef.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const splits: SplitText[] = [];

    const ctx = gsap.context(() => {
      // 1. Titres : chaque ligne monte derrière un masque (une fente). Le hero
      //    à l'arrivée, les autres quand ils entrent dans l'écran
      root.querySelectorAll<HTMLElement>('[data-lines]').forEach((title) => {
        const split = SplitText.create(title, { type: 'lines', mask: 'lines' });
        splits.push(split);
        const inHero = Boolean(title.closest('[data-about-layout="hero"]'));
        gsap.from(split.lines, {
          yPercent: 105,
          duration: 1.1,
          stagger: 0.09,
          ease: 'power3.out',
          delay: inHero ? 0.3 : 0,
          scrollTrigger: inHero ? undefined : { trigger: title, start: 'top 85%' },
        });
      });

      // 2. Le reste de chaque section monte en fondu, élément par élément
      root.querySelectorAll<HTMLElement>('[data-about-layout]').forEach((section) => {
        const items = section.querySelectorAll<HTMLElement>('[data-rise]');
        if (items.length === 0) return;
        const inHero = section.dataset.aboutLayout === 'hero';
        gsap.from(items, {
          opacity: 0,
          y: 24,
          duration: 0.9,
          stagger: 0.1,
          ease: 'power3.out',
          delay: inHero ? 0.5 : 0,
          scrollTrigger: inHero ? undefined : { trigger: items[0], start: 'top 85%' },
        });
      });

      // 3. Philosophie : le paragraphe s'allume mot par mot, au rythme du
      //    défilement (scrub : remonter l'éteint à nouveau)
      const paragraph = root.querySelector<HTMLElement>('[data-words]');
      if (paragraph) {
        const split = SplitText.create(paragraph, { type: 'words' });
        splits.push(split);
        gsap.fromTo(
          split.words,
          { opacity: 0.14 },
          {
            opacity: 1,
            stagger: 0.1,
            ease: 'none',
            scrollTrigger: {
              trigger: paragraph,
              start: 'top 80%',
              end: 'bottom 45%',
              scrub: true,
            },
          },
        );
      }

      // 4. Méthode : le trait se remplit pendant qu'on traverse la section
      const track = root.querySelector<HTMLElement>('[data-track]');
      if (track) {
        gsap.to(track, {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: track.closest('section'),
            start: 'top 60%',
            end: 'bottom 70%',
            scrub: true,
          },
        });
      }
    }, root);

    // Le découpage en lignes peut changer la hauteur des titres : on re-mesure
    measureAboutAnchors();
    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
      splits.forEach((split) => split.revert());
    };
  }, []);

  // Survols (souris seulement) : titres des expertises brouillés puis
  // reformés (comme le loader), vague sur « Parlons de votre projet »
  const finePointer = useFinePointer();
  useEffect(() => {
    const root = contentRef.current;
    if (!root || !finePointer) return;
    const cleanups: (() => void)[] = [];

    root.querySelectorAll<HTMLElement>('[data-scramble]').forEach((el) => {
      const final = el.textContent ?? '';
      const state = { progress: 0 };
      let tween: gsap.core.Tween | null = null;
      const onEnter = () => {
        tween?.kill();
        state.progress = 0;
        tween = gsap.to(state, {
          progress: 100,
          duration: 0.6,
          ease: 'none',
          onUpdate: () => {
            el.textContent = scrambleText(final, state.progress, randomChars(final.length));
          },
          onComplete: () => {
            el.textContent = final;
          },
        });
      };
      el.closest('[data-rise]')?.addEventListener('mouseenter', onEnter);
      cleanups.push(() => {
        el.closest('[data-rise]')?.removeEventListener('mouseenter', onEnter);
        tween?.kill();
        el.textContent = final;
      });
    });

    const waveEl = root.querySelector<HTMLElement>('[data-wave]');
    if (waveEl) {
      const split = SplitText.create(waveEl, { type: 'chars' });
      const wave = gsap.to(split.chars, {
        yPercent: -22,
        duration: 0.5,
        ease: 'sine.inOut',
        stagger: { each: 0.045, repeat: -1, yoyo: true },
        paused: true,
      });
      const link = waveEl.closest('a');
      const play = () => wave.play();
      const stop = () => wave.pause().progress(0);
      link?.addEventListener('mouseenter', play);
      link?.addEventListener('mouseleave', stop);
      cleanups.push(() => {
        link?.removeEventListener('mouseenter', play);
        link?.removeEventListener('mouseleave', stop);
        wave.kill();
        split.revert();
      });
    }

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [finePointer]);

  // Liste des images pour le Scene (même en arrivant directement sur /about) et
  // poses de départ des transitions de sortie (à revoir à l'étape 7). Sur la
  // page, c'est le Scene qui place les images, section par section.
  useEffect(() => {
    if (projectsContactCoords?.length) setProjects(projectsContactCoords);
  }, [projectsContactCoords, setProjects]);

  return (
    <>
      <WorklistPhantomGrid projects={projects} />
      <IntroGridPhantom projects={projects} />
      <ContactPhantomGrid projects={projects} />

      <main
        ref={contentRef}
        className="relative z-[2] text-black px-[8vw] md:px-[10vw] overflow-x-hidden">
        {/* 01 — Introduction */}
        <section data-about-layout="hero" className="relative flex min-h-[100svh] flex-col justify-start gap-7 pt-[18vh] md:justify-center md:pt-0">
          {/* Même voile que la 404 : les images qui passent sous le texte
              s'estompent. Sur toute la largeur (les marges de main en négatif) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -inset-x-[8vw] md:-inset-x-[10vw]"
            style={{
              background:
                'radial-gradient(72% 58% at 30% 46%, color-mix(in srgb, var(--background) 96%, transparent) 0%, color-mix(in srgb, var(--background) 78%, transparent) 46%, color-mix(in srgb, var(--background) 18%, transparent) 78%, transparent 100%)',
            }}
          />
          <p data-rise className={`${label} relative`}>
            [ Consultant en solutions numériques sur mesure ]
          </p>
          <h1 data-lines className={`${display} ${col} relative text-[clamp(2rem,4.6vw,4.1rem)]`}>
            La technologie au service de vos{' '}
            <span className={letter}>a</span>mbitions.
          </h1>
          <div data-rise className={`${col} relative flex flex-col gap-3`}>
            <p className={`${soft} max-w-[46ch]`}>
              Je conçois et développe des solutions numériques sur mesure
              pour aider les entreprises à simplifier leur fonctionnement,
              améliorer leurs outils et accompagner leur croissance.
            </p>
            <p className={`${soft} max-w-[46ch]`}>
              De l’analyse de vos besoins à la mise en production, je transforme
              vos idées en solutions concrètes.
            </p>
          </div>
          <p data-rise className={`${label} relative flex flex-wrap gap-8`}>
            <span>Yohan Etifier — Paris</span>
            <span>↓ Scroll</span>
          </p>
        </section>

        {/* 02 — À propos (les images forment le portrait à droite) */}
        <section data-about-layout="portrait" className="flex min-h-[100svh] flex-col justify-start gap-5 py-[13vh] md:justify-center">
          <p data-rise className={label}>[ À propos ]</p>
          <h2 data-lines className={`${display} ${col} text-[clamp(1.9rem,4vw,3.6rem)]`}>
            Derrière chaque solution, une <span className={letter}>v</span>ision.
          </h2>
          <div data-rise className={`${col} flex flex-col gap-3`}>
            <p className={`${soft} max-w-[46ch]`}>
              Je suis Yohan Etifier, consultant technique et développeur
              fullstack indépendant. J’accompagne les entreprises dans la
              conception, le développement et l’évolution de leurs
              applications et plateformes numériques.
            </p>
            <p className={`${soft} max-w-[46ch]`}>
              Ma conviction : une bonne solution technique commence par une
              compréhension précise du besoin métier.
            </p>
            <p className={`${soft} max-w-[46ch]`}>
              J’associe vision globale et expertise technique pour concevoir
              des outils fiables, performants et adaptés à votre activité.
            </p>
          </div>
          <p data-rise className={label}>
            Un seul interlocuteur, de la réflexion à la réalisation.
          </p>
        </section>

        {/* 03 — Ma philosophie */}
        <section data-about-layout="letterC" className="flex min-h-[120vh] items-center py-[20vh]">
          <div className={`${col} flex flex-col gap-8`}>
            <p data-rise className={label}>[ Ma philosophie ]</p>
            <h2 data-lines className={`${display} text-[clamp(1.9rem,4vw,3.6rem)]`}>
              <span className={letter}>C</span>omprendre d’abord. Construire
              ensuite.
            </h2>
            <p data-words className={`${display} text-[clamp(1.25rem,2.2vw,1.9rem)] leading-[1.15]`}>
              Chaque entreprise possède ses propres enjeux. Une solution
              pertinente doit répondre à ses besoins réels, sans complexité
              inutile. Mon rôle est de traduire vos objectifs métier en
              solutions techniques concrètes.
            </p>
            <p data-rise className={`${soft} max-w-[52ch]`}>
              De la conception d’une application à l’intégration de vos
              systèmes, je privilégie la simplicité, la fiabilité et
              l’évolutivité.
            </p>
            <p data-rise className={label}>Moins de complexité. Plus d’impact.</p>
          </div>
        </section>

        {/* 04 — Mes expertises */}
        <section data-about-layout="letterS" className="flex min-h-[110vh] items-center py-[16vh]">
          <div className={`${col} flex flex-col gap-7`}>
            <p data-rise className={label}>[ Mes expertises ]</p>
            <h2 data-lines className={`${display} text-[clamp(1.9rem,4vw,3.6rem)]`}>
              Des idées aux <span className={letter}>s</span>olutions.
            </h2>
            <div className="border-b border-black/15">
              {EXPERTISES.map((item, i) => (
                <div
                  key={item.title}
                  data-rise
                  className="grid gap-2.5 border-t border-black/15 py-[26px]"
                >
                  <h3 className="flex items-baseline gap-4 font-sans text-[clamp(1.5rem,2.6vw,2.3rem)] font-bold tracking-[-0.02em]">
                    <small className={`${label} font-fabrikatMono font-normal`}>
                      {pad(i + 1)}
                    </small>
                    <span data-scramble>{item.title}</span>
                  </h3>
                  <p className={`${label} text-black/60`}>{item.tag}</p>
                  {item.text && (
                    <p className={`${soft} max-w-[52ch]`}>{item.text}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 05 — Ma méthode */}
        <section data-about-layout="letterR" className="flex min-h-[120vh] items-center py-[16vh]">
          <div className={`${col} flex flex-col gap-9`}>
            <p data-rise className={label}>[ Ma méthode ]</p>
            <h2 data-lines className={`${display} text-[clamp(1.9rem,4vw,3.6rem)]`}>
              De votre besoin à sa <span className={letter}>r</span>éalisation.
            </h2>
            {/* Trait qui se remplit pendant qu'on traverse la section */}
            <div className="relative h-px bg-black/15">
              <i
                data-track
                className="absolute inset-0 origin-left scale-x-0 bg-black"
              />
            </div>
            <ol>
              {STEPS.map((step, i) => (
                <li
                  key={step.title}
                  data-rise
                  className="grid grid-cols-[74px_1fr] gap-5 border-t border-black/15 py-[22px] last:border-b"
                >
                  <b className="pt-1.5 text-[11px] tracking-[0.14em]">
                    {pad(i + 1)}
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

        {/* 06 — Contact */}
        <section data-about-layout="ring" className="flex min-h-[100svh] flex-col items-center justify-center gap-6 py-[12vh] text-center">
          {/* La boucle de la page : le a jaune du premier titre (ambitions)
              revient, avec le r de la méthode (réalisation) */}
          <h2 data-lines className={`${display} max-w-[22ch] text-[clamp(1.6rem,3.4vw,3rem)]`}>
            De vos <span className={letter}>a</span>mbitions à leur{' '}
            <span className={letter}>r</span>éalisation.
          </h2>
          <p data-rise className="font-sans text-[clamp(1rem,1.4vw,1.25rem)] font-bold tracking-[-0.01em]">
            Et si nous donnions vie à votre prochain projet ?
          </p>
          <p data-rise className={`${soft} max-w-[46ch]`}>
            Une application à développer ? Une plateforme à moderniser ? Des
            outils à connecter ? Échangeons sur vos besoins pour construire
            ensemble une solution adaptée à votre entreprise.
          </p>
          {/* Le seul lien de la section : le mail, sous forme de bouton */}
          <a
            data-rise
            href="mailto:contact@yohanetifier.com"
            className="flex min-h-12 cursor-none items-center rounded-full border border-[#12120f] px-[26px] text-[11px] uppercase tracking-[0.22em] text-[#12120f] transition-colors hover:bg-[#12120f] hover:text-[#f4f3f0]"
            data-cursor
          >
            <span data-wave>Parlons de votre projet</span>
          </a>
        </section>
      </main>
    </>
  );
}
