import { ProjectRepositoryImpl } from '../repositories/ProjectRepositoryImpl';

export class ProjectService {
  private repository: ProjectRepositoryImpl;
  constructor() {
    this.repository = new ProjectRepositoryImpl();
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
