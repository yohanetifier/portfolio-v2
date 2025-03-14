import { API_URL } from '@/config/constants';
import { GET_POSTS_BY_TITLE, GET_POSTS_QUERY } from '@/lib/graphql/queries';
import { Data } from '../types/Data';
import { Project } from '../models/Project';

export async function getPosts() {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: GET_POSTS_QUERY }),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }
  const json = await res.json();
  return json.data.posts.nodes.map((projects: Data) => ({
    featuredImage: {
      src: projects.featuredImage.node.sourceUrl,
      alt: projects.featuredImage.node.altText,
    },
    title: projects.title,
  }));
}

export async function getPostsByTitle(title: string): Promise<Project> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: GET_POSTS_BY_TITLE,
      variables: { title },
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch posts by title');
  }

  const json = await res.json();

  return {
    title: json.data.posts.nodes[0].title,
    featuredImage: {
      src: json.data.posts.nodes[0].featuredImage.sourceUrl,
      alt: json.data.posts.nodes[0].featuredImage.altText,
    },
  };
  // return json.data.posts.nodes.map((projects: Data) => ({
  //   featuredImage: {
  //     src: projects.featuredImage.node.sourceUrl,
  //     alt: projects.featuredImage.node.altText,
  //   },
  //   title: projects.title,
  // }));
}
