import { PostsForResponse } from '../types/types';

export const mapPostWithLikes = (post): PostsForResponse => ({
  id: post.id,
  title: post.title,
  shortDescription: post.shortDescription,
  content: post.content,
  blogId: post.blogId,
  blogName: post.blogName,
  createdAt: post.createdAt,
  extendedLikesInfo: {
    likesCount: +post.likesCount,
    dislikesCount: +post.dislikesCount,
    myStatus: post.myStatus ? post.myStatus : 'None',
    newestLikes: post.newestLikes,
  },
});
