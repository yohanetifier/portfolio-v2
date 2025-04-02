// import { useState, useEffect } from 'react';
import { Project } from '../models/Project';
import { ProjectRepositoryImpl } from '../repositories/ProjectRepositoryImpl';
import { ProjectService } from '../services/ProjectService';

const projectRepository = new ProjectRepositoryImpl();
const projectService = new ProjectService(projectRepository);

export async function portfolioViewModel(): Promise<
  Pick<Project, 'title' | 'featuredImage'>[] | null
> {
  try {
    const data = await projectService.getProjects();
    return data;
  } catch (error) {
    console.error('Failed to fetch projects: ', error);
    return null;
  }
}
