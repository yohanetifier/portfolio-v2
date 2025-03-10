import { API_URL } from '@/config/constants';
import { GET_POSTS_QUERY } from './graphql/queries';

export async function getPosts() {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ quuery: GET_POSTS_QUERY }),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }
  const json = await res.json();
  console.log('json', json);
  //   return json.data.posts.nodes.map((post: any) => post.featuredImage?.node?.sourceUrl);
}
