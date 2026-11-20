/**
 * Champs ACF d'un projet, tels que GraphQL les renvoie (groupe « Projet — fiche
 * et étude de cas », champ GraphQL `projectDetails`). Un champ vide vaut null.
 */
export type ProjectDetails = {
  role: string | null;
  technologies: string | null;
  summary: string | null;
  etiquette: string | null;
  nomDuProjet: string | null;
  titre: string | null;
  caseIntro: string | null;
  caseContext: string | null;
  caseRole: string | null;
  caseTech: string | null;
  caseResults: string | null;
};
