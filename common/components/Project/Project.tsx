'use client';
import React, { useLayoutEffect } from 'react';
import Image from 'next/image';
import { Project as ProjectType } from '@/src/models/Project';
import { animateText } from '@/common/utils/animateText';

interface Props {
  data: ProjectType;
  mediaUrls: string[];
}

const Project = ({ data, mediaUrls }: Props) => {
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  useLayoutEffect(() => {
    document.body.style.overflow = 'visible';
    document.body.style.height = 'auto';
    const fullscreen = document.getElementById('fullscreen');
    const grid = document.getElementById('grid');
    const link = fullscreen?.firstChild;
    setTimeout(() => {
      link?.remove();
      // while (grid?.firstChild) {
      //   grid.removeChild(grid.firstChild);
      // }
      grid!.style.transform = 'scale(0)';
    }, 1000);
  }, []);

  return (
    <div className="w-screen h-screen relative z-[3]">
      <div className="w-screen h-screen relative flex justify-center items-center">
        <Image
          src={data!.featuredImage.src}
          alt={'first-image'}
          width={1000}
          height={1000}
          className="w-full h-full absolute top-0 left-0 object-cover"
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
            <div key={index} className="w-full h-full overflow-hidden p-4">
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
              src={element}
              alt={'first-image'}
              width={1000}
              height={1000}
              className="w-full h-full relative z-20 p-4"
            />
          );
        }
      })}
    </div>
  );
};

export default Project;
