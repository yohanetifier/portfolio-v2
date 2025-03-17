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
  // const [project, setProject] = useState<Project[]>([]);
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   async function fetchProjects() {
  //     try {
  //       setLoading(true);
  //       // const data = await getPostsByTitle(title);
  //       const data = await projectService.getProjectByTitle(title);
  //       console.log('data', data);
  //       // setProject(data);
  //     } catch {
  //       setError('Failed to fetch');
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  //   fetchProjects();
  // }, [title]);

  // return { project, loading, error };
}
