import { Project } from '../models/Project';

export interface ProjectRepository {
  getProjects(): Promise<Project[]>;
  getProjectsByTitle(title: string): Promise<Project>;
}
