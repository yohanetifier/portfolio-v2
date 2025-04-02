import { Project } from '../models/Project';
import { ProjectRepository } from './ProjectRepository';
import { fetchData } from '@/common/utils/fetchData';
import { Data } from '../types/Data';
import { GET_PROJECT_BY_TITLE, GET_PROJECTS } from '@/lib/graphql/queries';

export class ProjectRepositoryImpl implements ProjectRepository {
  async getProjects(): Promise<Pick<Project, 'featuredImage' | 'title'>[]> {
    const { data } = await fetchData(GET_PROJECTS);

    return data.works.nodes.map((projects: Data) => ({
      featuredImage: {
        src: projects.featuredImage.node.sourceUrl,
        alt: projects.featuredImage.node.altText,
      },
      title: projects.title,
    }));
  }
  async getProjectsByTitle(title: string): Promise<Project> {
    const { data } = await fetchData(GET_PROJECT_BY_TITLE, { title });

    return {
      title: data.works.nodes[0].title,
      content: data.works.nodes[0].content,
      featuredImage: {
        src: data.works.nodes[0].featuredImage.node.sourceUrl,
        alt: data.works.nodes[0].featuredImage.node.altText,
      },
    };
  }
}
