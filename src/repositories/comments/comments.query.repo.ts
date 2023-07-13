import {
  CommentsForResponse,
  CommentsPaginationResponse,
} from '../../types/types';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { Comment, CommentDocument } from './comments.shema';
import { mapCommentWithLikes } from '../../helpers/map.comment.with.likes';
import { PaginationDto } from '../../types/dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { LikesRepository } from '../likes/likes.repo';
import { Post, PostDocument } from '../posts/posts.schema';
import { mapCommentsForBlog } from '../../helpers/map.comments.for.Blog';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    protected likesRepository: LikesRepository,
  ) {}

  async getCommentById(
    id: string,
    userId: string | null,
  ): Promise<CommentsForResponse | null> {
    const comment = await this.commentModel.findOne({
      id: id,
      isVisible: true,
    });
    if (!comment) throw new NotFoundException('Comment not found');
    const likesCount = await this.likesRepository.likesCount(id);
    const dislikeCount = await this.likesRepository.dislikeCount(id);
    const myStatus = await this.likesRepository.getMyStatus(id, userId);
    return mapCommentWithLikes(comment, likesCount, dislikeCount, myStatus);
  }

  async getCommentsForPost(
    id: string,
    query: PaginationDto,
    userId: string | null,
  ): Promise<CommentsPaginationResponse> {
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'createdAt';
    const sortDirection: 'asc' | 'desc' = query.sortDirection || 'desc';

    const items = await this.commentModel
      .find({ postId: id, isVisible: true })
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    const itemsWithLikes = await Promise.all(
      items.map(async (i) => {
        const likesCount = await this.likesRepository.likesCount(i.id);
        const dislikeCount = await this.likesRepository.dislikeCount(i.id);
        const myStatus = await this.likesRepository.getMyStatus(i.id, userId);
        const mappedForResponse: CommentsForResponse =
          await mapCommentWithLikes(i, likesCount, dislikeCount, myStatus);
        return mappedForResponse;
      }),
    );
    return {
      pagesCount: Math.ceil(
        (await this.commentModel.count({ postId: id })) / pageSize,
      ),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: await this.commentModel.count({ postId: id }),
      items: itemsWithLikes,
    };
  }

  async findCommentById(id: string): Promise<CommentDocument> {
    return this.commentModel.findOne({ id: id });
  }

  async findAllCommentsForBlogOwner(userId: string, query: PaginationDto) {
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'createdAt';
    const sortDirection = query.sortDirection === 'asc' ? 1 : -1;

    const items = await this.commentModel.aggregate([
      ...this.lookUpAllCommentsForBlogOwner(userId),
      { $sort: { [sortBy]: sortDirection } },
      { $skip: (pageNumber - 1) * pageSize },
      { $limit: pageSize },
    ]);

    const itemsForResponse = items.map((item) =>
      mapCommentsForBlog(item, userId),
    );

    const totalCount = await this.commentModel.aggregate([
      ...this.lookUpAllCommentsForBlogOwner(userId),
      { $count: 'Total' },
    ]);

    return {
      pagesCount: Math.ceil(totalCount[0].Total / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount[0].Total,
      items: itemsForResponse,
    };
  }

  private lookUpAllCommentsForBlogOwner(userId: string): PipelineStage[] {
    return [
      {
        $lookup: {
          from: 'posts',
          localField: 'postId',
          foreignField: 'id',
          as: 'postInfo',
        },
      },
      { $unwind: { path: '$postInfo' } },
      { $match: { 'postInfo.userId': userId, isVisible: true } },
      {
        $lookup: {
          from: 'likes',
          localField: 'id',
          foreignField: 'idOfEntity',
          as: 'likesInfo',
        },
      },
    ];
  }
}
