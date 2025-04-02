import { GET_POSTS } from '@/lib/graphql/queries';
import { Post } from '../models/Post';
import { PostRepository } from './PostRepository';
import { fetchData } from '@/common/utils/fetchData';

export class PostRepositoryImpl implements PostRepository {
  async getPosts(): Promise<Post[]> {
    const posts = await fetchData(GET_POSTS);
    // if (!response.ok) {
    //   throw new Error('failed to fetch');
    // }
    // const posts = await response.json();
    // console.log('posts', posts);
    console.log('posts', posts.data.posts.nodes);
    return posts.data.posts.nodes.map((post) => ({
      title: post.title,
      content: post.content,
      slug: post.slug,
    }));
  }
}
