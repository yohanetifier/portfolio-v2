import { GET_POSTS } from '@/lib/graphql/queries';
import { Post } from '../models/Post';
import { PostRepository } from './PostRepository';
import { fetchData } from '@/common/utils/fetchData';

export class PostRepositoryImpl implements PostRepository {
  async getPosts(): Promise<Omit<Post, 'content'>[]> {
    const posts = await fetchData(GET_POSTS);
    return posts.data.posts.nodes.map((post) => ({
      date: post.date,
      title: post.title,
      slug: post.slug,
    }));
  }
}
