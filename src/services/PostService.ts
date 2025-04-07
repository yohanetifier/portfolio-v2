import { Post } from '../models/Post';
import { PostRepository } from '../repositories/PostRepository';

export class PostService {
  private repository;
  constructor(repository: PostRepository) {
    this.repository = repository;
  }
  getPosts(): Promise<Omit<Post, 'content'>[]> {
    const posts = this.repository.getPosts();
    return posts;
  }
  getPostsBySlug(slug: string): Promise<Omit<Post, 'slug'>> {
    const posts = this.repository.getPostsBySlug(slug);
    return posts;
  }
}
