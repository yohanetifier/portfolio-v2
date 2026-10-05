'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { usePathname } from 'next/navigation';
import { useThreeJsContext } from '@/contexts/ThreeJsContext';
import { INTRO } from '@/utils/introTiming';
import { lockScroll, unlockScroll } from '@/utils/scroll';
import { randomChars, scrambleText } from '@/utils/scrambleText';

const LOADER_NAME = 'Yohan Etifier';
/**
 * Délai entre deux tirages de caractères brouillés : ≈ 30 changements/s,
 * identique en 60 Hz et 120 Hz (rester sous 33 ms évite un rythme irrégulier en 60 Hz)
 */
const SCRAMBLE_INTERVAL_MS = 30;

/**
 * Vitesse du compteur (en % par ms) — bornée pour que chaque lettre du nom
 * ait le temps de se transformer, même si le chargement saute ou traîne.
 * MAX : 100 % en 1,4 s minimum (≈ 1 lettre / 110 ms). MIN : pas de traîne vers 100.
 */
const DISPLAY_MAX_SPEED = 100 / 1400;
const DISPLAY_MIN_SPEED = 100 / 5000;
/** Temps max pris en compte entre deux frames : un gel de la page n'est pas « rattrapé » */
const MAX_FRAME_MS = 32;

function isLostPath(pathname: string | null, isLostPage: boolean) {
  if (isLostPage) return true;
  if (!pathname) return false;
  return (
    pathname !== '/' &&
    pathname !== '/contact' &&
    pathname !== '/about' &&
    !pathname.startsWith('/work') &&
    !pathname.startsWith('/blogs')
  );
}

/** Pages sans preload textures — pas de loader % */
function skipLoaderPath(pathname: string | null, isLostPage: boolean) {
  // /about charge des wrecks → laisser le loader (textures)
  return isLostPath(pathname, isLostPage);
}

const LoaderUI = () => {
  const { progress, active, total } = useProgress();
  const { setIntroReady, isLostPage } = useThreeJsContext();
  const pathname = usePathname();
  const skipLoader = skipLoaderPath(pathname, isLostPage);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [display, setDisplay] = useState(0);
  const displayRef = useRef(0);
  const progressRef = useRef(0);
  const assetsReadyRef = useRef(false);
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  // Bruit du brouillage : renouvelé toutes les SCRAMBLE_INTERVAL_MS dans tick()
  const noiseRef = useRef(randomChars(LOADER_NAME.length));
  const lastScrambleRef = useRef(0);
  const lastTickRef = useRef(0);

  // 404 / lost : pas de loader UX — textures loadent en silence
  useEffect(() => {
    if (!skipLoader) {
      lockScroll();
      return;
    }
    setIntroReady(true);
    setHasLoaded(true);
    unlockScroll();
  }, [skipLoader, setIntroReady]);

  useEffect(() => {
    if (skipLoader) return;
    if (total > 0 && !active && progress >= 100) {
      assetsReadyRef.current = true;
      progressRef.current = 100;
    } else {
      progressRef.current = progress;
    }
  }, [progress, active, total, skipLoader]);

  useEffect(() => {
    if (skipLoader) return;
    let id = 0;
    const tick = () => {
      const now = performance.now();
      if (now - lastScrambleRef.current >= SCRAMBLE_INTERVAL_MS) {
        noiseRef.current = randomChars(LOADER_NAME.length);
        lastScrambleRef.current = now;
      }
      // Temps écoulé depuis la frame précédente, plafonné (gel au chargement de Three.js)
      const dt = lastTickRef.current
        ? Math.min(now - lastTickRef.current, MAX_FRAME_MS)
        : 0;
      lastTickRef.current = now;

      // Lissage vers la vraie progression, borné entre une vitesse min et max
      const gap = progressRef.current - displayRef.current;
      if (gap > 0) {
        const eased = gap * (1 - Math.pow(0.95, dt / 16.67));
        const step = Math.min(
          Math.max(eased, DISPLAY_MIN_SPEED * dt),
          DISPLAY_MAX_SPEED * dt,
          gap,
        );
        displayRef.current += step;
      }

      if (assetsReadyRef.current && displayRef.current >= 99.5) {
        displayRef.current = 100;
        setDisplay(100);
        setIsExiting(true);
        setIntroReady(true);
        return;
      }

      setDisplay(displayRef.current);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [setIntroReady, skipLoader]);

  const finishLoader = () => {
    setHasLoaded(true);
    if (pathnameRef.current === '/') {
      lockScroll();
    } else {
      unlockScroll();
    }
  };

  if (hasLoaded || skipLoader) return null;

  return (
    <>
      <div className="fixed inset-0 z-[199]" aria-hidden />
      <div
        className="fixed inset-0 z-[200] bg-paper"
        style={{
          transition: `clip-path ${INTRO.wipeDuration}s ${INTRO.wipeEase}`,
          clipPath: isExiting ? 'inset(0 0 100% 0)' : 'inset(0%)',
          pointerEvents: isExiting ? 'none' : 'auto',
        }}
        onTransitionEnd={(e) => {
          if (e.propertyName === 'clip-path') finishLoader();
        }}
      >
        {/* Compteur au-dessus du nom — bloc ancré en bas à gauche */}
        <div className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-[max(1.25rem,env(safe-area-inset-left))] flex flex-col gap-[14px] md:bottom-[50px] md:left-[50px]">
          {/* Compteur : simple fondu */}
          <span
            className="font-fabrikatMono text-[11px] uppercase tracking-[0.14em]"
            style={{
              transition: `opacity 0.45s ${INTRO.wipeEase}, transform 0.45s ${INTRO.wipeEase}`,
              opacity: isExiting ? 0 : 1,
              transform: isExiting ? 'translateY(12px)' : 'translateY(0)',
            }}
          >
            [ {String(Math.round(display)).padStart(3, '0')} ]
          </span>
          {/* Nom : masque — le parent coupe, l'enfant glisse dessous */}
          <span
            aria-label={LOADER_NAME}
            // Écart du proto : 1em du nom + 25px (le pt de 0.08em est compensé)
            className="mt-[calc(0.92em+11px)] block overflow-hidden pt-[0.08em] font-sans font-bold leading-[0.9] tracking-[-0.04em]"
            style={{ fontSize: 'clamp(40px, 12vw, 148px)' }}
          >
            {/* Texte brouillé masqué aux lecteurs d'écran — ils lisent l'aria-label */}
            {/* Aléatoire voulu : serveur et navigateur tirent des caractères différents */}
            <span
              aria-hidden
              suppressHydrationWarning
              className="block"
              style={{
                transition: `transform 0.7s ${INTRO.wipeEase}`,
                transform: isExiting ? 'translateY(110%)' : 'translateY(0)',
              }}
            >
              {scrambleText(LOADER_NAME, display, noiseRef.current)}
            </span>
          </span>
        </div>
      </div>
    </>
  );
};

export default LoaderUI;
