import { useState, useEffect } from 'react';
import { Project } from '../models/Project';
import { getPosts } from '../repositories/ProjectRepositories';

export function usePortfolioViewModel() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const data = await getPosts();
        setProjects(data);
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
