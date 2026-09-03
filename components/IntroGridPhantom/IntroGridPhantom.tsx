'use client';
import { Project } from '@/src/models/Project';
import Image from 'next/image';
import React, { useEffect, useRef } from 'react';
import {
  getStartingClass,
  INTRO_VISIBLE_COUNT,
} from '../WorkList/utils/classes';
import { ProjectItem, useThreeJsContext } from '@/contexts/ThreeJsContext';

export default function IntroGridPhantom({
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
      className="fixed top-0 left-0 flex justify-center items-center  w-[100vw] h-[100vh] transition-height duration-1000 border-2 border-blue-500"
      ref={mainWrapperRef}
    >
      <div
        className="relative w-full h-full rounded-xl flex justify-center items-center opacity-0"
        ref={wrapperImage}
      >
        {projects
          .slice(0, INTRO_VISIBLE_COUNT)
          .map(({ featuredImage }, index) => (
            <div
              key={index}
              className={`${getStartingClass(index)} border-2 border-red-500`}
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
