import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from './comments.shema';
import { Model } from 'mongoose';
import { CreateCommentDto } from '../../types/dto';
import { plugForCreatingComment } from '../../helpers/plug.for.creating.posts.and.comments';
import { Like, LikeDocument } from '../likes/likes.schema';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Like.name) private likesModel: Model<LikeDocument>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}
  async deleteComment(id: string): Promise<boolean> {
    await this.dataSource.query(
      `
      DELETE FROM public."Comments"
      WHERE "id" = $1
      `,
      [id],
    );
    return true;
  }

  async createComment(newComment: CreateCommentDto) {
    await this.dataSource.query(
      `
        INSERT INTO public."Comments"(
        "id", "content", "userId", "userLogin", "createdAt", "postId", "isVisible")
        VALUES ($1, $2, $3, $4, $5, $6, $7);
      `,
      [
        newComment.id,
        newComment.content,
        newComment.userId,
        newComment.userLogin,
        newComment.createdAt,
        newComment.postId,
        newComment.isVisible,
      ],
    );
    return plugForCreatingComment(newComment);
  }

  async updateComment(id: string, content: string): Promise<boolean> {
    await this.dataSource.query(
      `
      UPDATE public."Comments"
      SET "content" = $1
      WHERE "id" = $2
      `,
      [content, id],
    );
    return true;
  }

  async updateVisibleStatus(userId: string, banStatus: boolean) {
    await this.commentModel.updateMany(
      { userId: userId },
      { isVisible: !banStatus },
    );
  }

  async findCommentById(id: string) {
    const comment = await this.dataSource.query(
      `
      SELECT "id", "content", "userId", "userLogin", "createdAt", "postId", "isVisible"
      FROM public."Comments"
      WHERE "id" = $1
      `,
      [id],
    );
    return comment[0];
  }
}
