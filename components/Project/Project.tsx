'use client';
import React, { useLayoutEffect } from 'react';
import Image from 'next/image';
import { Project as ProjectType } from '@/src/models/Project';
import { animateText } from '@/common/utils/animateText';
import { useParams } from 'next/navigation';
import { getFullSizeImage } from '@/utils/getFullSizeImage';

interface Props {
  data: ProjectType;
  mediaUrls: string[];
}

const Project = ({ data, mediaUrls }: Props) => {
  const titleRef = React.useRef<HTMLHeadingElement | null>(null);
  const featureImageRef = React.useRef<HTMLImageElement | null>(null);
  const { project } = useParams();
  useLayoutEffect(() => {
    // document.body.style.overflow = 'visible';
    document.body.style.height = 'auto';
    const fullscreen = document.getElementById('fullscreen');
    const grid = document.getElementById('grid');
    const link = fullscreen?.firstChild;
    setTimeout(() => {
      link?.remove();
      grid!.style.transform = 'scale(0)';
      document.body.style.overflow = 'visible';
    }, 1000);
  }, []);

  return (
    <div className="w-screen h-screen relative z-[3]">
      <div className="w-screen h-screen relative flex justify-center items-center p-4">
        <Image
          ref={featureImageRef}
          src={data!.featuredImage.src}
          alt={'first-image'}
          width={1000}
          height={1000}
          className="w-full h-full absolute top-0 left-0 object-cover filter brightness-50"
        />
        <h1
          className="relative z-1 text-[5vw] text-white"
          ref={titleRef}
          onPointerEnter={() => animateText(titleRef.current!)}
        >
          {data.title}
        </h1>
      </div>

      {mediaUrls.map((element, index) => {
        if (element.endsWith('mp4')) {
          return (
            <div
              key={index}
              className="md:w-full md:h-full overflow-hidden p-4"
            >
              <video
                key={index}
                loop
                autoPlay
                muted
                playsInline
                width={'100%'}
                height={'100%'}
              >
                <source src={element} type="video/mp4" />
              </video>
            </div>
          );
        } else {
          return (
            <Image
              key={index}
              src={getFullSizeImage(element)}
              alt={`Image du projet ${project}`}
              width={1000}
              height={1000}
              className="md:w-full md:h-full relative z-20 p-4 object-cover"
            />
          );
        }
      })}
    </div>
  );
};

export default Project;
