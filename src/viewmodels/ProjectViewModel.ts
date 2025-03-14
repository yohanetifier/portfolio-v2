import { useState, useEffect } from 'react';
import { Project } from '../models/Project';
import { getPostsByTitle } from '../repositories/ProjectRepositoryImpl';

export function useProjectViewModel(title: string) {
  const [project, setProject] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const data = await getPostsByTitle(title);
        setProject(data);
      } catch {
        setError('Failed to fetch');
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [title]);

  return { project, loading, error };
}
