'use client';
import React, { useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
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
import { clearFlag, getFlag } from '@/utils/fromWorkList';
import ContactPhantomGrid from '../Contact/ContactPhantomGrid';
import IntroGridPhantom from '../IntroPhantomGrid/IntroPhantomGrid';

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
    setFromWorkPage,
    setScrollY,
    scrollY,
    setProjectSelectedCoords,
    goToContact,
    returnHome,
  } = useThreeJsContext();
  const workPath = usePathname().split('/')[2];
  const overlayRef = useRef<HTMLDivElement>(null);

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
    if (itemIndex >= 0) {
      setSelectedIndex(itemIndex);
      setFromWorkPage(itemIndex);
    }
    const itemCoords = itemIndex >= 0 ? rects[itemIndex] : undefined;
    if (scrollY === null && itemCoords) {
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
    const handleScroll = () => {
      const offset = window.innerHeight / 2;
      const offScreen = window.scrollY > offset;
      const progress = offScreen ? 0 : Math.abs(window.scrollY / offset - 1);
      if (titleRef.current) {
        titleRef.current.style.opacity = String(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Masque le HTML projet avant le paint → le canvas 3D prend le relais sans flash
  useLayoutEffect(() => {
    if ((!goToContact && !returnHome) || !overlayRef.current) return;
    gsap.set(overlayRef.current, { opacity: 0, pointerEvents: 'none' });
  }, [goToContact, returnHome]);

  return (
    <div className="w-screen min-h-screen relative z-[3]">
      {/* Cibles Yeti — grille intro réelle (pas dans un wrapper overflow qui fausse les rects) */}
      <IntroGridPhantom projects={projects} />
      <ContactPhantomGrid projects={projects} />
      {/*
        fixed (pas absolute) : sinon metrics.height (~300vh) allonge le document
        et au scroll mobile on tombe sur le hero WebGL vide en bas.
      */}
      <div
        className="flex justify-center items-center fixed top-0 left-0 w-[100vw] transition-height duration-1000 z-[1] pointer-events-none opacity-0"
        ref={mainWrapperRef}
        aria-hidden
        style={{
          height: metrics.height,
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
                style={placement.style}
                ref={(el) => {
                  linkArray.current[index] = el!;
                }}
              ></Link>
            );
          })}
        </div>
      </div>

      <div ref={overlayRef} className="relative z-[20]">
        {/* Transparent : laisse voir le plane WebGL en hero */}
        <div className="w-screen h-screen relative flex justify-center items-center font-fabrikatMono">
          <h1
            className="fixed z-1 text-[5vw] text-white"
            ref={titleRef}
            onPointerEnter={() => animateText(titleRef.current!)}
          >
            {data.title}
          </h1>
        </div>

        <div className="relative z-[20] bg-white">
          {mediaUrls.map((element, index) => {
            if (element.endsWith('mp4')) {
              return (
                <div
                  key={index}
                  className="w-full overflow-hidden block aspect-video bg-white"
                >
                  <video
                    key={index}
                    loop
                    autoPlay
                    muted
                    playsInline
                    className="block w-full h-full object-cover"
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
                  width={1600}
                  height={1000}
                  sizes="100vw"
                  className="w-full h-auto relative z-20 block bg-white"
                  style={{ width: '100%', height: 'auto' }}
                />
              );
            }
          })}
        </div>
      </div>
    </div>
  );
};

export default Project;
