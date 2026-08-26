import React, {
  createContext,
  ReactNode,
  useContext,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
export interface ProjectItem {
  rects: DOMRect;
  imageUrl: string;
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
  projectsAtTheBottom: React.MutableRefObject<Record<string, number>>;
  projectsAtTheTop: React.MutableRefObject<Record<string, number>>;
  projectsAtTheBottomRef: React.MutableRefObject<THREE.Group[]>;
  projectsAtTheTopRef: React.MutableRefObject<THREE.Group[]>;
  groupRefArray: React.MutableRefObject<(THREE.Group | null)[]>;
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
  const projectsAtTheBottom = useRef<Record<string, number>>({});
  const projectsAtTheTop = useRef<Record<string, number>>({});
  const projectsAtTheBottomRef = useRef<THREE.Group[]>([]);
  const projectsAtTheTopRef = useRef<THREE.Group[]>([]);
  const groupRefArray = useRef<(THREE.Group | null)[]>([]);

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
        projectsAtTheBottom,
        projectsAtTheTop,
        projectsAtTheBottomRef,
        projectsAtTheTopRef,
        groupRefArray,
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
