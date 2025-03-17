import { useState, useEffect } from 'react';
import { Project } from '../models/Project';
import { getPostsByTitle } from '../repositories/ProjectRepositoryImpl';
import { ProjectService } from '../services/ProjectService';

const projectService = new ProjectService();

export function useProjectViewModel(title: string) {
  const [project, setProject] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        // const data = await getPostsByTitle(title);
        const data = await projectService.getProjectByTitle(title);
        console.log('data', data);
        // setProject(data);
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
