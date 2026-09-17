'use client';
import { Project } from '@/src/models/Project';
import Image from 'next/image';
import React, { useLayoutEffect, useRef } from 'react';
import { getStartingClass } from '../WorkList/utils/classes';
import { ProjectItem, useThreeJsContext } from '@/contexts/ThreeJsContext';

export default function IntroPhantomGrid({
  projects,
  /** false = affichage/mesure désactivée (évite d’écraser les coords depuis un phantom caché) */
  writeCoords = true,
}: {
  projects: Pick<Project, 'featuredImage'>[];
  writeCoords?: boolean;
}) {
  const wrapperImage = useRef<HTMLDivElement>(null);
  const mainWrapperRef = useRef<HTMLDivElement>(null);
  const imgRefArray = useRef<(HTMLDivElement | null)[]>([]);
  const { setProjectsHomeCoords } = useThreeJsContext();

  useLayoutEffect(() => {
    if (!writeCoords) return;

    const rects: ProjectItem[] = imgRefArray.current
      .map((element, index) => {
        if (!element || !projects[index]) return null;
        return {
          rects: element.getBoundingClientRect(),
          imageUrl: projects[index].featuredImage.src,
        };
      })
      .filter((item): item is ProjectItem => item !== null);

    if (rects.length) setProjectsHomeCoords(rects);
  }, [projects, setProjectsHomeCoords, writeCoords]);

  return (
    <div
      className="pointer-events-none fixed top-0 left-0 flex justify-center items-center w-[100vw] h-[100vh] transition-height duration-1000"
      ref={mainWrapperRef}
      aria-hidden
    >
      <div
        className="relative w-full h-full rounded-xl flex justify-center items-center opacity-0"
        ref={wrapperImage}
      >
        {projects.map(({ featuredImage }, index) => (
          <div
            key={index}
            className={`${getStartingClass(index)}`}
            ref={(el) => {
              imgRefArray.current[index] = el;
            }}
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
