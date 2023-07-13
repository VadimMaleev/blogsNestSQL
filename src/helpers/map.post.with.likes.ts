import { NewestLikes, PostsForResponse } from '../types/types';
import { PostDocument } from '../repositories/posts/posts.schema';

export const mapPostWithLikes = async (
  post: PostDocument,
  likesCount: number,
  dislikeCount: number,
  myStatus: string,
  newestLikes: NewestLikes[],
): Promise<PostsForResponse> => ({
  id: post.id,
  title: post.title,
  shortDescription: post.shortDescription,
  content: post.content,
  blogId: post.blogId,
  blogName: post.blogName,
  createdAt: post.createdAt,
  extendedLikesInfo: {
    likesCount: likesCount,
    dislikesCount: dislikeCount,
    myStatus: myStatus,
    newestLikes: newestLikes,
  },
});
