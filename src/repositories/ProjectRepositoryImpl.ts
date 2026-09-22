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

  async getProjectsByTitle(title: string): Promise<Project | null> {
    const decodedTitle = decodeURIComponent(title);
    const { data } = await fetchData(GET_PROJECT_BY_TITLE, {
      title: decodedTitle,
    });

    const node = data?.works?.nodes?.[0];
    if (!node) return null;

    return {
      title: node.title,
      content: node.content,
      featuredImage: {
        src: node.featuredImage.node.sourceUrl,
        alt: node.featuredImage.node.altText,
      },
    };
  }
}
