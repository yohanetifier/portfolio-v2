import { Post } from '../models/Post';
import { PostRepository } from '../repositories/PostRepository';

export class PostService {
  private repository;
  constructor(repository: PostRepository) {
    this.repository = repository;
  }
  getPosts(): Promise<Post[]> {
    const posts = this.repository.getPosts();
    return posts;
  }
}
