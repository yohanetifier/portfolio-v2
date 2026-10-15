'use client';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useThreeJsContext } from '@/contexts/ThreeJsContext';
import { Project as ProjectModel } from '@/src/models/Project';
import { slugify } from '@/utils/slugify';
import { lockScroll } from '@/utils/scroll';
import { getProjectsFromLocalStorage } from '@/utils/getProjectsFromLocalStorage';
import { focusWorksLayout, nextProjectStore } from '@/utils/nextProject';

/**
 * Ouvre un autre projet depuis une page projet, sous l'image déjà plein écran :
 * partagé par le scroll « projet suivant », les flèches et (plus tard) les numéros.
 */
export function useOpenProject(
  projects: Pick<ProjectModel, 'featuredImage' | 'title'>[],
) {
  const router = useRouter();
  const {
    setSelectedIndex,
    setFromWorkPage,
    setSelectedSlug,
    setProjectImageSelected,
    setProjectSelectedCoords,
    scrollY,
    setScrollY,
  } = useThreeJsContext();

  // Lu au moment de l'ouverture, depuis des écouteurs posés une seule fois
  // (ScrollTrigger, clavier) : toujours la valeur à jour
  const scrollYRef = useRef(scrollY);
  scrollYRef.current = scrollY;

  return (index: number) => {
    const project = projects[index];
    if (!project) return;

    // L'élan du scroll (inertie du trackpad) ne doit pas continuer sur la nouvelle
    // page : on bloque, la page suivante débloque une fois son titre entré
    lockScroll();
    // Le Scene arrête de piloter l'image : React la tient en hero (index sélectionné)
    nextProjectStore.index = -1;
    nextProjectStore.justSwapped = true;

    setSelectedIndex(index);
    setFromWorkPage(index);
    setSelectedSlug(slugify(project.title));
    setProjectImageSelected(project.featuredImage.src);
    // Retour vers Works : l'image doit rétrécir dans SA case, pas celle du projet
    // quitté. Si cette case est hors écran au scroll mémorisé, on recentre le scroll
    // et toute la disposition enregistrée (relue par la nouvelle page au montage).
    const saved = getProjectsFromLocalStorage('projectsDetails');
    const focused = saved?.rects
      ? focusWorksLayout(
          saved.rects,
          index,
          scrollYRef.current ?? 0,
          window.innerHeight,
        )
      : null;
    if (focused) {
      localStorage.setItem('projectsDetails', JSON.stringify({ rects: focused.items }));
      setScrollY(focused.scroll);
      setProjectSelectedCoords(focused.items[index].rects as DOMRect);
    }

    router.push(`/work/${slugify(project.title)}`);
  };
}
