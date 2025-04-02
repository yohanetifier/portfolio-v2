import { ProjectRepository } from '../repositories/ProjectRepository';

export class ProjectService {
  private repository: ProjectRepository;
  constructor(repository: ProjectRepository) {
    this.repository = repository;
  }

  async getProjects() {
    const projects = await this.repository.getProjects();
    return projects;
  }
  async getProjectByTitle(title: string) {
    const project = await this.repository.getProjectsByTitle(title);
    return project;
  }
}
