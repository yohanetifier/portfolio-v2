import { useState, useEffect } from 'react';
import { Project } from '../models/Project';
import { ProjectService } from '../services/ProjectService';

const projectService = new ProjectService();

export function usePortfolioViewModel() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const projects = await projectService.getProjects();
        setProjects(projects);
      } catch {
        setError('Failed to fetch');
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  return { projects, loading, error };
}
