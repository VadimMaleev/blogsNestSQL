import { Injectable } from '@nestjs/common';
import {
  BlogsForResponse,
  PostsForResponse,
  PostsPaginationResponse,
} from '../../types/types';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './posts.schema';
import { Model } from 'mongoose';
import { mapPostWithLikes } from '../../helpers/map.post.with.likes';
import { PaginationDto } from '../../types/dto';
import { LikesRepository } from '../likes/likes.repo';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    protected likesRepository: LikesRepository,
  ) {}

  async getPostById(
    id: string,
    userId: string | null,
  ): Promise<PostsForResponse | null> {
    const post = await this.postModel.findOne({ id: id, isVisible: true });
    if (!post) return null;
    const likesCount = await this.likesRepository.likesCount(id);
    const dislikeCount = await this.likesRepository.dislikeCount(id);
    const myStatus = await this.likesRepository.getMyStatus(id, userId);
    const newestLikes = await this.likesRepository.getNewestLikes(id);
    return mapPostWithLikes(
      post,
      likesCount,
      dislikeCount,
      myStatus,
      newestLikes,
    );
  }

  async getPosts(
    query: PaginationDto,
    userId: string | null,
  ): Promise<PostsPaginationResponse> {
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'createdAt';
    const sortDirection: 'asc' | 'desc' = query.sortDirection || 'desc';

    const items = await this.postModel
      .find({ isVisible: true })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection });

    const itemsWithLikes = await Promise.all(
      items.map(async (i) => {
        const likesCount = await this.likesRepository.likesCount(i.id);
        const dislikeCount = await this.likesRepository.dislikeCount(i.id);
        const myStatus = await this.likesRepository.getMyStatus(i.id, userId);
        const newestLikes = await this.likesRepository.getNewestLikes(i.id);
        const mappedForResponse: PostsForResponse = await mapPostWithLikes(
          i,
          likesCount,
          dislikeCount,
          myStatus,
          newestLikes,
        );
        return mappedForResponse;
      }),
    );
    return {
      pagesCount: Math.ceil((await this.postModel.count({})) / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: await this.postModel.count({}),
      items: itemsWithLikes,
    };
  }

  async getPostsForBlog(
    blog: BlogsForResponse,
    query: PaginationDto,
    userId: string | null,
  ): Promise<PostsPaginationResponse> {
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'createdAt';
    const sortDirection: 'asc' | 'desc' = query.sortDirection || 'desc';

    const items = await this.postModel
      .find({ blogId: blog.id, isVisible: true })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection });

    const itemsWithLikes = await Promise.all(
      items.map(async (i) => {
        const likesCount = await this.likesRepository.likesCount(i.id);
        const dislikeCount = await this.likesRepository.dislikeCount(i.id);
        const myStatus = await this.likesRepository.getMyStatus(i.id, userId);
        const newestLikes = await this.likesRepository.getNewestLikes(i.id);
        const mappedForResponse: PostsForResponse = await mapPostWithLikes(
          i,
          likesCount,
          dislikeCount,
          myStatus,
          newestLikes,
        );
        return mappedForResponse;
      }),
    );
    return {
      pagesCount: Math.ceil(
        (await this.postModel.count({ blogId: blog.id })) / pageSize,
      ),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: await this.postModel.count({ blogId: blog.id }),
      items: itemsWithLikes,
    };
  }

  async findPostById(id: string): Promise<PostDocument> {
    return this.postModel.findOne({ id: id });
  }
}
