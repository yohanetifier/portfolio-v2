import { useSyncExternalStore } from 'react';

type SoundState = { enabled: boolean; chosen: boolean };

/** Choix de l'utilisateur — coupé tant qu'il n'a pas cliqué « avec le son ». */
const INITIAL_STATE: SoundState = { enabled: false, chosen: false };
let state = INITIAL_STATE;
const listeners = new Set<() => void>();

export function setSoundEnabled(enabled: boolean): void {
  // Nouvel objet à chaque changement : React compare la référence pour re-render
  state = { enabled, chosen: true };
  listeners.forEach((listener) => listener());
}

export function isSoundEnabled(): boolean {
  return state.enabled;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Lecture réactive du choix (re-render à chaque setSoundEnabled). */
export function useSoundState(): SoundState {
  return useSyncExternalStore(subscribe, () => state, () => INITIAL_STATE);
}

/** Joue un SFX (déclencher dans un geste user — clic / tap). */
export function playSound(
  src: string,
  volume = 0.08,
): void {
  if (!state.enabled) return;
  const audio = new Audio(src);
  audio.volume = volume;
  void audio.play().catch(() => {});
}

export const OPEN_WHOOSH = '/sounds/open-whoosh.wav';
