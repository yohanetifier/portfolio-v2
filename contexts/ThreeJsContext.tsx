import React, { createContext, ReactNode, useContext, useState } from 'react';
export interface ProjectItem {
  rects: DOMRect;
  imageUrl: string;
}

export type ProjectCoordsItem = {
  rects: DOMRect;
};

interface Uv {
  x: number | null;
  y: number | null;
}

interface ThreeJsContextType {
  projectsDetails: ProjectItem[];
  setProjects: (projectsDetails: ProjectItem[]) => void;
  selectedIndex: number | null;
  setSelectedIndex: (selectedIndex: number | null) => void;
  selectedSlug: string;
  setSelectedSlug: (slug: string) => void;
  projectImageSelected: string;
  setProjectImageSelected: (image: string) => void;
  projectSelectedCoords: DOMRect | null;
  setProjectSelectedCoords: (arg: DOMRect) => void;
  scrollY: number | null;
  setScrollY: (arg: number) => void;
  projectsCoords: ProjectCoordsItem[] | null;
  setProjectsCoords: (arg: ProjectCoordsItem[] | null) => void;
  projectsHomeCoords: ProjectItem[] | null;
  setProjectsHomeCoords: (projectsDetails: ProjectItem[]) => void;
  projectsContactCoords: ProjectItem[] | null;
  setProjectsContactCoords: (arg: ProjectItem[] | null) => void;
  fromHome: boolean;
  setFromHome: (arg: boolean) => void;
  fromWorkPage: number;
  setFromWorkPage: (arg: number) => void;
  returnHome: boolean;
  setReturnHome: (arg: boolean) => void;
  goToContact: boolean;
  setGoToContact: (arg: boolean) => void;
  goToWork: boolean;
  setGoToWork: (arg: boolean) => void;
  goToProject: boolean;
  setGoToProject: (arg: boolean) => void;
  fromProjectSlug: string | null;
  setFromProjectSlug: (arg: string | null) => void;
  fromProjectIndex: number;
  setFromProjectIndex: (arg: number) => void;
  isLostPage: boolean;
  setIsLostPage: (arg: boolean) => void;
  /** Ouverture projet depuis la 404 — Works doit aller à la grille, pas reverse vers les épaves */
  fromLostPage: boolean;
  setFromLostPage: (arg: boolean) => void;
  isAnimating: boolean;
  setIsAnimating: (arg: boolean) => void;
  hoveredIndex: number | null;
  setHoveredIndex: (arg: number | null) => void;
  uv: { x: number | null; y: number | null };
  setUv: (arg: Uv) => void;
  mouseCoords: Uv;
  setMouseCoords: (arg: Uv) => void;
  cursorHover: boolean;
  setCursorHover: (arg: boolean) => void;
}

const ThreeJsContext = createContext<ThreeJsContextType | undefined>(undefined);

export const ThreeJsProvider = ({ children }: { children: ReactNode }) => {
  const [projectsDetails, setProjects] = useState<ProjectItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [projectImageSelected, setProjectImageSelected] = useState<string>('');
  const [projectSelectedCoords, setProjectSelectedCoords] =
    useState<DOMRect | null>(null);
  const [scrollY, setScrollY] = useState<number | null>(null);
  const [fromHome, setFromHome] = useState(false);
  const [fromWorkPage, setFromWorkPage] = useState(-1);
  const [returnHome, setReturnHome] = useState(false);
  const [goToContact, setGoToContact] = useState(false);
  const [goToWork, setGoToWork] = useState(false);
  const [goToProject, setGoToProject] = useState(false);
  const [fromProjectSlug, setFromProjectSlug] = useState<string | null>(null);
  const [fromProjectIndex, setFromProjectIndex] = useState(-1);
  const [isLostPage, setIsLostPage] = useState(false);
  const [fromLostPage, setFromLostPage] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [projectsCoords, setProjectsCoords] = useState<ProjectCoordsItem[] | null>(
    null,
  );
  const [projectsHomeCoords, setProjectsHomeCoords] = useState<ProjectItem[]>(
    [],
  );
  const [projectsContactCoords, setProjectsContactCoords] = useState<
    ProjectItem[] | null
  >(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [uv, setUv] = useState<Uv>({ x: null, y: null });
  const [mouseCoords, setMouseCoords] = useState<Uv>({ x: null, y: null });
  const [cursorHover, setCursorHover] = useState(false);

  return (
    <ThreeJsContext.Provider
      value={{
        projectsDetails,
        setProjects,
        selectedIndex,
        setSelectedIndex,
        selectedSlug,
        setSelectedSlug,
        projectImageSelected,
        setProjectImageSelected,
        projectSelectedCoords,
        setProjectSelectedCoords,
        scrollY,
        setScrollY,
        fromHome,
        setFromHome,
        projectsCoords,
        setProjectsCoords,
        projectsHomeCoords,
        setProjectsHomeCoords,
        projectsContactCoords,
        setProjectsContactCoords,
        returnHome,
        setReturnHome,
        goToContact,
        setGoToContact,
        goToWork,
        setGoToWork,
        goToProject,
        setGoToProject,
        fromProjectSlug,
        setFromProjectSlug,
        fromProjectIndex,
        setFromProjectIndex,
        isLostPage,
        setIsLostPage,
        fromLostPage,
        setFromLostPage,
        isAnimating,
        setIsAnimating,
        hoveredIndex,
        setHoveredIndex,
        uv,
        setUv,
        mouseCoords,
        setMouseCoords,
        fromWorkPage,
        setFromWorkPage,
        cursorHover,
        setCursorHover,
      }}
    >
      {children}
    </ThreeJsContext.Provider>
  );
};

export function useThreeJsContext(): ThreeJsContextType {
  const context = useContext(ThreeJsContext);
  if (context === undefined) {
    throw new Error('useThreeJsContext must be used within a ThreeJsProvider');
  }
  return context;
}
