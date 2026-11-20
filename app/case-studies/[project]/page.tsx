import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProjectViewModel } from '@/src/viewmodels/ProjectViewModel';
import Project from '@/components/Project/Project';
import { ProjectRepositoryImpl } from '@/src/repositories/ProjectRepositoryImpl';
import { portfolioViewModel } from '@/src/viewmodels/PortfolioViewModel';
import { toCaseStudy } from '@/utils/projectDetails';

const projectViewModel = new ProjectViewModel(new ProjectRepositoryImpl());

type Params = { params: Promise<{ project: string }> };

/** /case-studies/LVA → le titre « LVA » dans le CMS (même slug que /work/LVA) */
const titleFromSlug = (slug: string) =>
  decodeURIComponent(slug).replace(/-/g, ' ');

/** Le projet et son étude de cas, lue dans les champs ACF du back-office */
const getCaseStudy = async (slug: string) => {
  const data = await projectViewModel.getProjectByTitle(titleFromSlug(slug));
  const study = toCaseStudy(data?.details);
  return data && study ? { data, study } : null;
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { project } = await params;
  const found = await getCaseStudy(project);
  if (!found) return {};
  return {
    title: `${found.data.title} — étude de cas`,
    description: found.study.intro || found.study.project,
    alternates: { canonical: `/case-studies/${project}` },
  };
}

// Même hero que la page projet (l'image du projet plein écran) : on réutilise
// le composant Project, avec le contenu de l'étude de cas à la place des captures
const CaseStudyPage = async ({ params }: Params) => {
  const { project } = await params;
  const found = await getCaseStudy(project);
  // Projet inconnu, ou titre de l'étude de cas vide dans le back-office
  if (!found) notFound();

  const projects = await portfolioViewModel();

  return (
    <div>
      <Project
        data={found.data}
        mediaUrls={[]}
        projects={projects!}
        caseStudy={found.study}
      />
    </div>
  );
};

export default CaseStudyPage;
