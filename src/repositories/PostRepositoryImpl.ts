import { GET_POSTS, GET_POSTS_BY_SLUG } from '@/lib/graphql/queries';
import { Post } from '../models/Post';
import { PostRepository } from './PostRepository';
import { fetchData } from '@/common/utils/fetchData';

export class PostRepositoryImpl implements PostRepository {
  async getPosts(): Promise<Omit<Post, 'content'>[]> {
    const posts = await fetchData(GET_POSTS);
    return posts.data.posts.nodes.map((post: Omit<Post, 'content'>) => ({
      date: post.date,
      title: post.title,
      slug: post.slug,
    }));
  }
  async getPostsBySlug(slug: string): Promise<Omit<Post, 'slug'>> {
    const posts = await fetchData(GET_POSTS_BY_SLUG, { slug });
    return {
      date: posts.data.post.date,
      title: posts.data.post.title,
      content: posts.data.post.content,
    };
  }
}
