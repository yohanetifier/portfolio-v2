import React, { createContext, ReactNode, useContext, useState } from 'react';

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
  fetchFromWorkProjectPage: ProjectItem[];
  setFetchFromWorkProjectPage: (arg: ProjectItem[]) => void;
}

const ThreeJsContext = createContext<ThreeJsContextType | undefined>(undefined);

export const ThreeJsProvider = ({ children }: { children: ReactNode }) => {
  const [projectsDetails, setProjects] = useState<ProjectItem[]>([]);
  const [fetchFromWorkProjectPage, setFetchFromWorkProjectPage] = useState<
    ProjectItem[]
  >([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [projectImageSelected, setProjectImageSelected] = useState<string>('');

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
        fetchFromWorkProjectPage,
        setFetchFromWorkProjectPage,
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
