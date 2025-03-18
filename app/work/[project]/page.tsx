import React from 'react';
import Image from 'next/image';
import { ProjectViewModel } from '@/src/viewmodels/ProjectViewModel';
import Content from '@/common/components/Content/Content';

const projectViewModel = new ProjectViewModel();

const Work = async ({ params }: { params: { project: string } }) => {
  const { project } = await params;
  const data = await projectViewModel.getProjectByTitle(project as string);

  console.log('data', data);

  // let mediaUrls = [];

  // const regex = /<(img|video|source)[^>]+src="([^">]+)"/g;
  // let matches;
  // while ((matches = regex.exec(data!.content)) !== null) {
  //   mediaUrls.push(matches[2]);
  // }

  if (!data) return <p>chargement ...</p>;

  return (
    <div>
      <div className="w-screen h-screen border-2 border-red-500">
        <Image
          src={data!.featuredImage.src}
          alt={'first-image'}
          width={1000}
          height={1000}
          className="w-full h-full"
        />

        {/* {mediaUrls.map((element, index) => (
          <Image
            key={index}
            src={element}
            alt={'first-image'}
            width={1000}
            height={1000}
            className="w-full h-full"
          />
        ))} */}
        {/* <Content mediaUrls={mediaUrls} /> */}

        <p>Test</p>
      </div>
    </div>
  );
};

export default Work;
