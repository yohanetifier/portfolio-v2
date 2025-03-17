import React from 'react';
import Image from 'next/image';
import { ProjectViewModel } from '@/src/viewmodels/ProjectViewModel';

const projectViewModel = new ProjectViewModel();

const Work = async ({ params }: { params: { project: string } }) => {
  const data = await projectViewModel.getProjectByTitle(
    params.project as string,
  );

  return (
    <div>
      <div className="w-screen h-screen">
        <Image
          src={data!.featuredImage.src}
          alt={'first-image'}
          width={1000}
          height={1000}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default Work;
