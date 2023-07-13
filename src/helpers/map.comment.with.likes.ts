import { CommentsForResponse } from '../types/types';
import { CommentDocument } from '../repositories/comments/comments.shema';

export const mapCommentWithLikes = async (
  comment: CommentDocument,
  likesCount: number,
  dislikeCount: number,
  myStatus: string,
): Promise<CommentsForResponse> => ({
  id: comment.id,
  content: comment.content,
  commentatorInfo: {
    userId: comment.userId,
    userLogin: comment.userLogin,
  },
  createdAt: comment.createdAt,
  likesInfo: {
    likesCount: likesCount,
    dislikesCount: dislikeCount,
    myStatus: myStatus,
  },
});
