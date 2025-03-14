import { Project } from '../models/Project';

export interface ProjectRepositories {
  getPosts: Promise<Project[]>;
  getPostsByTitle(title: string): Promise<Project>;
}
