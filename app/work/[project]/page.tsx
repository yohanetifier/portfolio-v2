import React from 'react';
import { ProjectViewModel } from '@/src/viewmodels/ProjectViewModel';
import Project from '@/common/components/Project/Project';
import { ProjectRepositoryImpl } from '@/src/repositories/ProjectRepositoryImpl';

const projectRepositoryImpl = new ProjectRepositoryImpl();
const projectViewModel = new ProjectViewModel(projectRepositoryImpl);

const Work = async ({ params }: { params: Promise<{ project: string }> }) => {
  const { project } = await params;
  const data = await projectViewModel.getProjectByTitle(project);
  const mediaUrls = [];

  const regex = /<(img|video|source)[^>]+src="([^">]+)"/g;
  let matches;
  while ((matches = regex.exec(data!.content)) !== null) {
    mediaUrls.push(matches[2]);
  }

  if (!data) return <p>chargement ...</p>;

  return (
    <div>
      <Project data={data} mediaUrls={mediaUrls} />
    </div>
  );
};

export default Work;
