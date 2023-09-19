import { CommentsForResponse } from '../types/types';

export const mapCommentWithLikes = (comment): CommentsForResponse => ({
  id: comment.id,
  content: comment.content,
  commentatorInfo: {
    userId: comment.userId,
    userLogin: comment.userLogin,
  },
  createdAt: comment.createdAt,
  likesInfo: {
    likesCount: +comment.likesCount,
    dislikesCount: +comment.dislikesCount,
    myStatus: comment.myStatus ? comment.myStatus : 'None',
  },
});
