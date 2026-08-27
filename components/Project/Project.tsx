'use client';
import React, { useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import { Project as ProjectType } from '@/src/models/Project';
import { animateText } from '@/common/utils/animateText';
import { useParams, usePathname } from 'next/navigation';
import { getFullSizeImage } from '@/utils/getFullSizeImage';
import { useThreeJsContext } from '@/contexts/ThreeJsContext';
import { getGridMetrics, getGridPlacement } from '../WorkList/utils/classes';
import { Project as ProjectModel } from '@/src/models/Project';
import Link from 'next/link';
import { getProjectsFromLocalStorage } from '@/utils/getProjectsFromLocalStorage';
import { slugify } from '@/utils/slugify';

interface Props {
  data: ProjectType;
  mediaUrls: string[];
  projects: Pick<ProjectModel, 'featuredImage' | 'title'>[];
}

const Project = ({ data, mediaUrls, projects }: Props) => {
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const mainWrapperRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const metrics = getGridMetrics(projects.length);
  const linkArray = useRef<HTMLAnchorElement[]>([]);
  const { project } = useParams();
  const {
    setProjectImageSelected,
    setProjects,
    setSelectedIndex,
    setScrollY,
    scrollY,
    setProjectSelectedCoords,
  } = useThreeJsContext();
  const workPath = usePathname().split('/')[2];

  const updateProjects = () => {
    const checkIfProjectsAlreadySet =
      getProjectsFromLocalStorage('projectsDetails');
    const rects = linkArray.current
      .map((el, i) => {
        return {
          rects: el.getBoundingClientRect(),
          imageUrl: projects[i].featuredImage.src,
        };
      })
      .filter(Boolean);

    if (checkIfProjectsAlreadySet === null) {
      setProjects(rects);
    } else {
      setProjects(checkIfProjectsAlreadySet.rects);
    }
    const itemIndex = projects.findIndex((project) => {
      return slugify(project.title) === workPath;
    });
    setSelectedIndex(itemIndex);
    const itemCoords = rects[itemIndex];
    if (scrollY === null) {
      const isInFirstScreen =
        itemCoords.rects.top + itemCoords.rects.height < window.innerHeight;

      setScrollY(isInFirstScreen ? 0 : itemCoords.rects.top);

      const updatedProjectCoord: DOMRect = {
        x: itemCoords.rects.x,
        height: itemCoords.rects.height,
        width: itemCoords.rects.width,
        top: isInFirstScreen ? itemCoords.rects.top : 0,
        y: 0,
        bottom: itemCoords.rects.bottom,
        left: itemCoords.rects.left,
        right: itemCoords.rects.right,
        toJSON: function () {
          throw new Error('Function not implemented.');
        },
      };

      setProjectSelectedCoords(updatedProjectCoord);
    }
    const localStorageValue = JSON.stringify({ rects });
    localStorage.setItem('projectsDetails', localStorageValue);
  };

  useLayoutEffect(() => {
    updateProjects();
    setProjectImageSelected(data.featuredImage.src);
  }, []);

  return (
    <div className="w-screen h-screen relative z-[3]">
      <div
        className="flex justify-center items-center absolute w-[100vw] transition-height duration-1000 z-[1] pointer-events-none"
        ref={mainWrapperRef}
        style={{
          height: metrics.height,
          opacity: 0,
        }}
      >
        <div
          className={`w-full grid grid-cols-10 gap-[20px] z-[2]`}
          ref={gridRef}
          style={{
            height: metrics.height,
            gridTemplateRows: `repeat(${metrics.rows}, minmax(0, 1fr))`,
          }}
        >
          {projects.map(({ title }, index) => {
            const placement = getGridPlacement(index);
            return (
              <Link
                key={index}
                href={`/work/${title.replace(/\s+/g, '-')}`}
                prefetch={true}
                className={`${placement.className} `}
                // onClick={(e) =>
                //   handleTransition(e, title, index, featuredImage)
                // }
                style={placement.style}
                ref={(el) => {
                  linkArray.current[index] = el!;
                }}
              ></Link>
            );
          })}
        </div>
      </div>
      <div className="w-screen h-screen relative flex justify-center items-center p-4">
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
