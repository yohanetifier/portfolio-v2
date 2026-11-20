import { Image } from '../types/Image';
import { ProjectDetails } from '../types/ProjectDetails';

export interface Project {
  content: string;
  title: string;
  featuredImage: Image;
  /** Champs ACF du back-office (bloc du hero, étude de cas) ; vides = rien à afficher */
  details?: ProjectDetails | null;
}
