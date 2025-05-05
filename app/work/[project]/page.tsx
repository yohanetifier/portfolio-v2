import React from 'react';
import { ProjectViewModel } from '@/src/viewmodels/ProjectViewModel';
import Project from '@/common/components/Project/Project';
import { ProjectRepositoryImpl } from '@/src/repositories/ProjectRepositoryImpl';

const projectRepositoryImpl = new ProjectRepositoryImpl();
const projectViewModel = new ProjectViewModel(projectRepositoryImpl);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ project: string }>;
}) {
  const { project } = await params;
  const formattedProject = project.replace(/-/g, ' ');
  const data = await projectViewModel.getProjectByTitle(formattedProject);

  if (!data) {
    return {
      title: 'Project Not Found',
      description: 'The requested project could not be found.',
    };
  }

  return {
    title: `${data.title}`,
    description: `View ${data.title} project by Yohan Etifier. ${data.content.substring(0, 160)}...`,
    openGraph: {
      title: data.title,
      description: data.content.substring(0, 160),
      images: [
        {
          url: data.featuredImage.src,
          width: 1200,
          height: 630,
          alt: data.featuredImage.alt,
        },
      ],
    },
  };
}

const Work = async ({ params }: { params: Promise<{ project: string }> }) => {
  const { project } = await params;
  const formattedProject = project.replace(/-/g, ' ');
  const data = await projectViewModel.getProjectByTitle(formattedProject);
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
