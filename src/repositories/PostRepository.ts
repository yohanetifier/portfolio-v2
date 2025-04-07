import { Post } from '../models/Post';

export interface PostRepository {
  getPosts(): Promise<Omit<Post, 'content'>[]>;
  getPostsBySlug(slug: string): Promise<Omit<Post, 'slug'>>;
}
