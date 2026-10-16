import { Project } from '@/src/models/Project';

/**
 * Projets de la page affichée (titre, image), dans l'ordre des images du Scene.
 * Le Scene ne connaît que les images : pour ouvrir un projet depuis l'éventail du
 * menu, il lui faut son titre (l'URL). Rempli par IntroPhantomGrid, présente sur
 * toutes les pages. Un objet modifié en place, pas un état : rien à re-rendre.
 */
export const projectList: {
  current: Pick<Project, 'featuredImage' | 'title'>[];
} = { current: [] };
