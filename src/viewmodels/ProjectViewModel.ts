import { ProjectService } from '../services/ProjectService';

export class ProjectViewModel {
  private projectService: ProjectService;
  constructor() {
    this.projectService = new ProjectService();
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
