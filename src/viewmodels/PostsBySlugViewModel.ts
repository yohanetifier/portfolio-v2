import { PostRepositoryImpl } from '../repositories/PostRepositoryImpl';
import { PostService } from '../services/PostService';

const postRepositoryImpl = new PostRepositoryImpl();
const postService = new PostService(postRepositoryImpl);

export const postsBySlugViewModel = async (slug: string) => {
  try {
    const data = await postService.getPostsBySlug(slug);
    console.log('data', data);
    return data;
  } catch (e) {
    console.log('Failed to fetch posts', e);
  }
};
