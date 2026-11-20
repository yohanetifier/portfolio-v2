import { ProjectDetails } from '@/src/types/ProjectDetails';
import { slugify } from './slugify';

/**
 * Les champs ACF d'un projet (back-office) → ce qu'affichent le bloc du hero et
 * la page étude de cas. Un champ vide (null ou espaces) = rien à afficher.
 */

/** Bloc en bas du hero de /work/[projet] */
export type ProjectBrief = {
  /** En petites capitales, en gras : « Architecture · Full-stack · Maintenance » */
  role: string;
  /** En petites capitales, en gris */
  stack: string[];
  /** Une phrase : ce qu'est le projet */
  summary: string;
  /** Lien « Étude de cas → » ; sans lui, pas de lien */
  caseStudy?: string;
};

/** Page /case-studies/[projet] */
export type CaseStudy = {
  /** « Étude de cas 01 » */
  label: string;
  /** Ce qu'est le projet, bien visible sur le hero : « LVA — Plateforme… » */
  project: string;
  /** Titre au centre du hero */
  title: string;
  /** Une phrase de présentation, en tête du contenu */
  intro: string;
  role: string[];
  stack: string[];
  sections: { title: string; text: string }[];
};

/** Texte du champ sans espaces autour ; '' si vide */
const text = (value: string | null | undefined) => (value ?? '').trim();

/** « A · B · C » → ['A', 'B', 'C'] (les éléments sont séparés par un point médian) */
const list = (value: string | null | undefined) =>
  text(value)
    .split('·')
    .map((item) => item.trim())
    .filter(Boolean);

/** Les 4 parties de l'étude de cas, dans l'ordre ; une partie vide est sautée */
const SECTIONS = [
  ['Contexte', 'caseContext'],
  ['Mon rôle', 'caseRole'],
  ['Choix techniques', 'caseTech'],
  ['Résultats', 'caseResults'],
] as const;

/** L'étude de cas existe dès que son titre est rempli */
export const hasCaseStudy = (details?: ProjectDetails | null) =>
  Boolean(text(details?.titre));

/** Le bloc du hero existe dès que le rôle est rempli */
export function toBrief(
  title: string,
  details?: ProjectDetails | null,
): ProjectBrief | undefined {
  if (!details || !text(details.role)) return undefined;
  return {
    role: text(details.role),
    stack: list(details.technologies),
    summary: text(details.summary),
    caseStudy: hasCaseStudy(details)
      ? `/case-studies/${slugify(title)}`
      : undefined,
  };
}

export function toCaseStudy(
  details?: ProjectDetails | null,
): CaseStudy | undefined {
  if (!details || !hasCaseStudy(details)) return undefined;
  return {
    label: text(details.etiquette),
    project: text(details.nomDuProjet),
    title: text(details.titre),
    intro: text(details.caseIntro),
    role: list(details.role),
    stack: list(details.technologies),
    sections: SECTIONS.map(([title, key]) => ({
      title,
      text: text(details[key]),
    })).filter((section) => section.text),
  };
}
