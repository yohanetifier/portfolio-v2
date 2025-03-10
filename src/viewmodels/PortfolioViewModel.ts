import { useState, useEffect } from 'react';
import { Project } from '../models/Project';

export function usePortfolioViewModel() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setProjects([
        {
          title: 'Projet 1',
          featuredImage: {
            src: '',
            alt: '',
          },
        },
        {
          title: 'Projet 2',
          featuredImage: { src: '/images/second-image.png', alt: '' },
        },
      ]);
    }, 1000);
  }, []);

  return { projects };
}
