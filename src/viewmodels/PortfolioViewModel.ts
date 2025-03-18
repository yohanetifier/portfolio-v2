// import { useState, useEffect } from 'react';
import { Project } from '../models/Project';
import { ProjectService } from '../services/ProjectService';

const projectService = new ProjectService();

export async function portfolioViewModel(): Promise<Project[] | null> {
  // const [projects, setProjects] = useState<Project[]>([]);
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);
  // useEffect(() => {
  //   async function fetchProjects() {
  //     try {
  //       setLoading(true);
  //       const projects = await projectService.getProjects();
  //       setProjects(projects);
  //     } catch {
  //       setError('Failed to fetch');
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  //   fetchProjects();
  // }, []);
  // return { projects, loading, error };

  try {
    const data = await projectService.getProjects();
    return data;
  } catch (error) {
    console.error('Failed to fetch projects: ', error);
    return null;
  }
}
