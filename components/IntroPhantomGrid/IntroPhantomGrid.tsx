'use client';
import { Project } from '@/src/models/Project';
import Image from 'next/image';
import React, { useEffect, useRef } from 'react';
import { getStartingClass } from '../WorkList/utils/classes';
import { ProjectItem, useThreeJsContext } from '@/contexts/ThreeJsContext';

export default function IntroPhantomGrid({
  projects,
}: {
  projects: Pick<Project, 'featuredImage'>[];
}) {
  const wrapperImage = useRef<HTMLDivElement>(null);
  const mainWrapperRef = useRef<HTMLDivElement>(null);
  const imgRefArray = useRef([]);
  const { setProjectsHomeCoords } = useThreeJsContext();

  const updateProjects = () => {
    const rects: ProjectItem[] = imgRefArray.current
      .map((element: HTMLElement, index) => {
        return {
          rects: element.getBoundingClientRect(),
          imageUrl: projects[index].featuredImage.src,
        };
      })
      .filter(Boolean);
    setProjectsHomeCoords(rects);
  };

  useEffect(() => {
    updateProjects();
  }, []);

  return (
    <div
      className="fixed top-0 left-0 flex justify-center items-center  w-[100vw] h-[100vh] transition-height duration-1000"
      ref={mainWrapperRef}
    >
      <div
        className="relative w-full h-full rounded-xl flex justify-center items-center opacity-0"
        ref={wrapperImage}
      >
        {projects.map(({ featuredImage }, index) => (
          <div
            key={index}
            className={`${getStartingClass(index)}`}
            ref={(el) => (imgRefArray.current[index] = el)}
          >
            <Image
              src={featuredImage.src}
              alt={featuredImage.alt}
              width={1000}
              height={1000}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
