// import { API_URL } from '@/config/constants';
import { GET_POSTS_BY_TITLE, GET_POSTS_QUERY } from '@/lib/graphql/queries';
import { Project } from '../models/Project';
import { ProjectRepository } from './ProjectRepository';
import { fetchData } from '@/common/utils/fetchData';
import { Data } from '../types/Data';

export class ProjectRepositoryImpl implements ProjectRepository {
  async getProjects(): Promise<Pick<Project, 'featuredImage' | 'title'>[]> {
    const { data } = await fetchData(GET_POSTS_QUERY);

    return data.posts.nodes.map((projects: Data) => ({
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
      title: data.posts.nodes[0].title,
      content: data.posts.nodes[0].content,
      featuredImage: {
        src: data.posts.nodes[0].featuredImage.node.sourceUrl,
        alt: data.posts.nodes[0].featuredImage.node.altText,
      },
    };
  }
}

// export async function getPosts() {
//   const res = await fetch(API_URL, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ query: GET_POSTS_QUERY }),
//   });
//   if (!res.ok) {
//     throw new Error('Failed to fetch posts');
//   }
//   const json = await res.json();
//   return json.data.posts.nodes.map((projects: Data) => ({
//     featuredImage: {
//       src: projects.featuredImage.node.sourceUrl,
//       alt: projects.featuredImage.node.altText,
//     },
//     title: projects.title,
//   }));
// }

// export async function getPostsByTitle(title: string): Promise<Project> {
//   const res = await fetch(API_URL, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       query: GET_POSTS_BY_TITLE,
//       variables: { title },
//     }),
//   });

//   if (!res.ok) {
//     throw new Error('Failed to fetch posts by title');
//   }

//   const json = await res.json();

//   return {
//     title: json.data.posts.nodes[0].title,
//     featuredImage: {
//       src: json.data.posts.nodes[0].featuredImage.sourceUrl,
//       alt: json.data.posts.nodes[0].featuredImage.altText,
//     },
//   };
//   // return json.data.posts.nodes.map((projects: Data) => ({
//   //   featuredImage: {
//   //     src: projects.featuredImage.node.sourceUrl,
//   //     alt: projects.featuredImage.node.altText,
//   //   },
//   //   title: projects.title,
//   // }));
// }
