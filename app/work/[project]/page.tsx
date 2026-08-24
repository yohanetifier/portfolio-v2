import React from 'react';
import { ProjectViewModel } from '@/src/viewmodels/ProjectViewModel';
import Project from '@/components/Project/Project';
import { ProjectRepositoryImpl } from '@/src/repositories/ProjectRepositoryImpl';
import { portfolioViewModel } from '@/src/viewmodels/PortfolioViewModel';

const projectRepositoryImpl = new ProjectRepositoryImpl();
const projectViewModel = new ProjectViewModel(projectRepositoryImpl);

const Work = async ({ params }: { params: Promise<{ project: string }> }) => {
  const { project } = await params;
  const formattedProject = project.replace(/-/g, ' ');
  const data = await projectViewModel.getProjectByTitle(formattedProject);
  const mediaUrls = [];
  const projects = await portfolioViewModel();

  const regex = /<(img|video|source)[^>]+src="([^">]+)"/g;
  let matches;
  while ((matches = regex.exec(data!.content)) !== null) {
    mediaUrls.push(matches[2]);
  }

  if (!data) return <p>chargement ...</p>;

  return (
    <div>
      <Project data={data} mediaUrls={mediaUrls} projects={projects!} />
    </div>
  );
};

export default Work;
