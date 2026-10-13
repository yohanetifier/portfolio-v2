'use client';
import { usePathname } from 'next/navigation';
import { setSoundEnabled, useSoundState } from '@/utils/playSound';

/**
 * Indicateur [ sound : on/off ] — cliquable pour changer d'avis.
 * Sur la Home, caché tant que l'utilisateur n'a pas choisi via les deux boutons.
 */
const SoundToggle = () => {
  const pathname = usePathname();
  const { enabled, chosen } = useSoundState();
  const isVisible = chosen || (pathname !== null && pathname !== '/');

  return (
    <button
      type="button"
      onClick={() => setSoundEnabled(!enabled)}
      aria-pressed={enabled}
      aria-label={enabled ? 'Turn sound off' : 'Turn sound on'}
      tabIndex={isVisible ? 0 : -1}
      className={`fixed right-[max(7.5vw,env(safe-area-inset-right))] md:right-[max(5vw,env(safe-area-inset-right))] top-[max(0.75rem,env(safe-area-inset-top))] z-[110] cursor-pointer font-fabrikatMono text-[9px] uppercase tracking-[0.14em] text-white mix-blend-difference transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      [ sound : {enabled ? 'on' : 'off'} ]
    </button>
  );
};

export default SoundToggle;
