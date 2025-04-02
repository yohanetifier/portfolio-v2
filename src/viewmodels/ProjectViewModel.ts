import { ProjectRepository } from '../repositories/ProjectRepository';
import { ProjectService } from '../services/ProjectService';

export class ProjectViewModel {
  private projectService: ProjectService;
  constructor(repository: ProjectRepository) {
    this.projectService = new ProjectService(repository);
  }

  async getProjectByTitle(title: string) {
    try {
      const project = await this.projectService.getProjectByTitle(title);
      return project;
    } catch (error) {
      console.error('Failed to fetch: ', error);
    }
  }
}
