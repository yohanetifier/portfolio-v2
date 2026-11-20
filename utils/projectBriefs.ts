/**
 * Bandeau sous le hero d'une page projet : ton rôle, la stack, une phrase,
 * et (plus tard) le lien vers l'étude de cas.
 *
 * Clé = le titre du projet tel qu'il est dans le CMS (« LVA », « Les vergers »…).
 * Un projet absent de cette liste n'a pas de bandeau : sa page reste comme avant.
 */
export type ProjectBrief = {
  /** En petites capitales, en gras : « Architecte » */
  role: string;
  /** En petites capitales, en gris, séparées par des points */
  stack: string[];
  /** Une phrase : ce que tu as apporté */
  summary: string;
  /** Lien « Étude de cas → » ; sans lui, pas de lien */
  caseStudy?: string;
};

export const projectBriefs: Record<string, ProjectBrief> = {
  LVA: {
    role: 'Architecture · Full-stack · Maintenance',
    stack: ['Next.js', 'NestJS', 'PostgreSQL'],
    summary:
      'Une plateforme numérique réunissant plusieurs titres de presse spécialisés.',
    // Même slug que /work/LVA : le Scene y retrouve le projet (hero plein écran)
    caseStudy: '/case-studies/LVA',
  },
};
