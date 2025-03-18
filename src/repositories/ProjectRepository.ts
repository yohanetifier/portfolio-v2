import { Project } from '../models/Project';

export interface ProjectRepository {
  getProjects(): Promise<Pick<Project, 'title' | 'featuredImage'>[]>;
  getProjectsByTitle(title: string): Promise<Project>;
}
