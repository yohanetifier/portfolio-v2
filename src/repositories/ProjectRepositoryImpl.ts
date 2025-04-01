// import { API_URL } from '@/config/constants';
import { GET_POSTS_BY_TITLE, GET_POSTS_QUERY } from '@/lib/graphql/queries';
import { Project } from '../models/Project';
import { ProjectRepository } from './ProjectRepository';
import { fetchData } from '@/common/utils/fetchData';
import { Data } from '../types/Data';

export class ProjectRepositoryImpl implements ProjectRepository {
  async getProjects(): Promise<Pick<Project, 'featuredImage' | 'title'>[]> {
    const { data } = await fetchData(GET_POSTS_QUERY);

    return data.works.nodes.map((projects: Data) => ({
      featuredImage: {
        src: projects.featuredImage.node.sourceUrl,
        alt: projects.featuredImage.node.altText,
      },
      title: projects.title,
    }));
  }
  async getProjectsByTitle(title: string): Promise<Project> {
    const { data } = await fetchData(GET_POSTS_BY_TITLE, { title });

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
