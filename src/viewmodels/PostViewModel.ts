import { PostRepositoryImpl } from '../repositories/PostRepositoryImpl';
import { PostService } from '../services/PostService';

const postRepositoryImpl = new PostRepositoryImpl();
const postService = new PostService(postRepositoryImpl);

export const postsViewModel = async () => {
  try {
    const data = await postService.getPosts();
    return data;
  } catch (e) {
    console.log('Failed to fetch posts', e);
  }
};
