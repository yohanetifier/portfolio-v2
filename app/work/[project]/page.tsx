'use client';
import { useParams } from 'next/navigation';
import React from 'react';
import Image from 'next/image';
import { useProjectViewModel } from '@/src/viewmodels/ProjectViewModel';

const Work = () => {
  const { project } = useParams();
  const view = useProjectViewModel(project as string);
  console.log('viwe', view);
  return (
    <div>
      <div className="w-screen h-screen">
        <Image
          src={'/images/first-image.png'}
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
