import { API_URL } from '@/config/constants';
import { GET_POSTS_QUERY } from '@/lib/graphql/queries';

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
  return json.data.posts.nodes.map((projects: any) => ({
    imageUrl: projects.featuredImage.node.sourceUrl,
  }));
  //   return json.data.posts.nodes.map(
  //     (post: any) => post.featuredImage?.node?.sourceUrl,
  //   );
}
