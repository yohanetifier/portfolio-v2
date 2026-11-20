/**
 * Études de cas : /case-studies/[projet]. Clé = le titre du projet dans le CMS.
 * Plus tard, ces données viendront du back-office (WordPress).
 */
export type CaseStudy = {
  /** « Étude de cas 01 » */
  label: string;
  /** Ce qu'est le projet, bien visible sur le hero : « LVA — Plateforme… » */
  project: string;
  /** Titre affiché sur l'image du hero */
  title: string;
  /** Une phrase de présentation du projet */
  intro: string;
  role: string[];
  stack: string[];
  sections: { title: string; text: string }[];
};

export const caseStudies: Record<string, CaseStudy> = {
  LVA: {
    label: 'Étude de cas 01',
    project: 'LVA — Plateforme de presse numérique',
    title: 'De la vision à l’architecture.',
    intro:
      'LVA — Une plateforme numérique réunissant plusieurs titres de presse spécialisés.',
    role: ['Architecture', 'Full-stack', 'Maintenance'],
    stack: ['Next.js', 'NestJS', 'PostgreSQL'],
    sections: [
      {
        title: 'Contexte',
        text: 'Réunir plusieurs magazines spécialisés sur une plateforme commune, intégrant contenus éditoriaux, abonnements numériques, événements et publicité.',
      },
      {
        title: 'Mon rôle',
        text: 'Conception de l’architecture, mise en place des fondations techniques, développement en équipe et accompagnement continu du client.',
      },
      {
        title: 'Choix techniques',
        text: 'Architecture microservices pour séparer les domaines métier, Next.js pour le front-end, PostgreSQL pour les données, Redis et Elasticsearch pour les besoins de cache et de recherche, et CI/CD GitLab pour les livraisons.',
      },
      {
        title: 'Résultats',
        // « Près de 150 versions livrées depuis 2024 » : à ajouter une fois le
        // décompte vérifié
        text: 'Une plateforme réunissant plusieurs titres, avec gestion des parutions, recherche éditoriale et agenda des événements.',
      },
    ],
  },
};
