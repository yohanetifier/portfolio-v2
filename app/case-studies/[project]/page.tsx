import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProjectViewModel } from '@/src/viewmodels/ProjectViewModel';
import Project from '@/components/Project/Project';
import { ProjectRepositoryImpl } from '@/src/repositories/ProjectRepositoryImpl';
import { portfolioViewModel } from '@/src/viewmodels/PortfolioViewModel';
import { caseStudies } from '@/utils/caseStudies';

const projectViewModel = new ProjectViewModel(new ProjectRepositoryImpl());

type Params = { params: Promise<{ project: string }> };

/** /case-studies/LVA → la clé « LVA » (même slug que /work/LVA) */
const titleFromSlug = (slug: string) => decodeURIComponent(slug).replace(/-/g, ' ');

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { project } = await params;
  const title = titleFromSlug(project);
  const study = caseStudies[title];
  if (!study) return {};
  return {
    title: `${title} — étude de cas`,
    description: study.intro,
    alternates: { canonical: `/case-studies/${project}` },
  };
}

// Même hero que la page projet (l'image du projet plein écran) : on réutilise
// le composant Project, avec le contenu de l'étude de cas à la place des captures
const CaseStudyPage = async ({ params }: Params) => {
  const { project } = await params;
  const title = titleFromSlug(project);
  const study = caseStudies[title];
  if (!study) notFound();

  const data = await projectViewModel.getProjectByTitle(title);
  const projects = await portfolioViewModel();
  if (!data) notFound();

  return (
    <div>
      <Project data={data} mediaUrls={[]} projects={projects!} caseStudy={study} />
    </div>
  );
};

export default CaseStudyPage;
