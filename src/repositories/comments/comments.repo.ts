import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from './comments.shema';
import { Model } from 'mongoose';
import { CreateCommentDto } from '../../types/dto';
import { plugForCreatingComment } from '../../helpers/plug.for.creating.posts.and.comments';
import { Like, LikeDocument } from '../likes/likes.schema';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Like.name) private likesModel: Model<LikeDocument>,
  ) {}
  async deleteComment(id: string): Promise<boolean> {
    const commentInstance = await this.commentModel.findOne({ id: id });
    if (!commentInstance) return false;

    await commentInstance.deleteOne();
    return true;
  }

  async createComment(newComment: CreateCommentDto) {
    await new this.commentModel(newComment).save();
    return plugForCreatingComment(newComment);
  }

  async updateComment(id: string, content: string): Promise<boolean> {
    const commentInstance: CommentDocument = await this.commentModel.findOne({
      id: id,
    });
    if (!commentInstance) return false;

    commentInstance.updateComment(content);
    await commentInstance.save();
    return true;
  }

  async updateVisibleStatus(userId: string, banStatus: boolean) {
    await this.commentModel.updateMany(
      { userId: userId },
      { isVisible: !banStatus },
    );
  }
}
