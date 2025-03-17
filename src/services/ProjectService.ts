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
    const project = this.repository.getProjectsByTitle(title);
    console.log('project', project);
    return project;
  }
}
