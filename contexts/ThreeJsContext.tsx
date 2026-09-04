import React, { createContext, ReactNode, useContext, useState } from 'react';
export interface ProjectItem {
  rects: DOMRect;
  imageUrl: string;
}

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
  projectsCoords: DOMRect[] | null;
  setProjectsCoords: (arg: DOMRect[] | null) => void;
  projectsHomeCoords: ProjectItem[] | null;
  setProjectsHomeCoords: (projectsDetails: ProjectItem[]) => void;
  fromHome: boolean;
  setFromHome: (arg: boolean) => void;
  returnHome: boolean;
  setReturnHome: (arg: boolean) => void;
  isAnimating: boolean;
  setIsAnimating: (arg: boolean) => void;
  hoveredIndex: number | null;
  setHoveredIndex: (arg: number | null) => void;
  uv: { x: number | null; y: number | null };
  setUv: (arg: Uv) => void;
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
  const [returnHome, setReturnHome] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [projectsCoords, setProjectsCoords] = useState([]);
  const [projectsHomeCoords, setProjectsHomeCoords] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [uv, setUv] = useState<Uv>({ x: null, y: null });

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
        returnHome,
        setReturnHome,
        isAnimating,
        setIsAnimating,
        hoveredIndex,
        setHoveredIndex,
        uv,
        setUv,
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
