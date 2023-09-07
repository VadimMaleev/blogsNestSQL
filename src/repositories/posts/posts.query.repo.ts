import { Injectable } from '@nestjs/common';
import { PostsForResponse, PostsPaginationResponse } from '../../types/types';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './posts.schema';
import { Model } from 'mongoose';
import { mapPostWithLikes } from '../../helpers/map.post.with.likes';
import { PaginationDto } from '../../types/dto';
import { LikesRepository } from '../likes/likes.repo';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { plugForCreatingPosts } from '../../helpers/plug.for.creating.posts.and.comments';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectDataSource() protected dataSource: DataSource,
    protected likesRepository: LikesRepository,
  ) {}

  async getPostById(
    id: string,
    // userId: string | null,
  ): Promise<PostsForResponse | null> {
    const post = await this.dataSource.query(
      `
        SELECT "id", "title", "shortDescription", "content", "blogId", "blogName", "createdAt", "isVisible"
        FROM public."Posts"
        WHERE "id" = $1 AND "isVisible" = true
      `,
      [id],
    );
    if (!post[0]) return null;

    // const likesCount = await this.likesRepository.likesCount(id);
    // const dislikeCount = await this.likesRepository.dislikeCount(id);
    // const myStatus = await this.likesRepository.getMyStatus(id, userId);
    // const newestLikes = await this.likesRepository.getNewestLikes(id);
    const likesCount = 0;
    const dislikeCount = 0;
    const myStatus = 'None';
    const newestLikes = [];
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
    // userId: string | null,
  ): Promise<PostsPaginationResponse> {
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'createdAt';
    const sortDirection: 'asc' | 'desc' = query.sortDirection || 'desc';

    const items = await this.dataSource.query(
      `
        SELECT "id", "title", "shortDescription", "content", "blogId", "blogName", "createdAt", "isVisible"
        FROM public."Posts"
        WHERE "isVisible" = true
        ORDER BY "${sortBy}" ${sortDirection}
        OFFSET $1 LIMIT $2
      `,
      [(pageNumber - 1) * pageSize, pageSize],
    );

    const itemsWithLikes = items.map((i) => plugForCreatingPosts(i));

    // const itemsWithLikes = await Promise.all(
    //   items.map(async (i) => {
    //     const likesCount = await this.likesRepository.likesCount(i.id);
    //     const dislikeCount = await this.likesRepository.dislikeCount(i.id);
    //     const myStatus = await this.likesRepository.getMyStatus(i.id, userId);
    //     const newestLikes = await this.likesRepository.getNewestLikes(i.id);
    //     const mappedForResponse: PostsForResponse = await mapPostWithLikes(
    //       i,
    //       likesCount,
    //       dislikeCount,
    //       myStatus,
    //       newestLikes,
    //     );
    //     return mappedForResponse;
    //   }),
    // );

    const totalCount = await this.dataSource.query(
      `
      SELECT count(*)
      FROM public."Posts"
      WHERE "isVisible" = true
      `,
    );

    return {
      pagesCount: Math.ceil(+totalCount[0].count / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: +totalCount[0].count,
      items: itemsWithLikes,
    };
  }

  async getPostsForBlog(
    blogId: string,
    query: PaginationDto,
    // userId: string | null,
  ): Promise<PostsPaginationResponse> {
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'createdAt';
    const sortDirection: 'asc' | 'desc' = query.sortDirection || 'desc';

    const items = await this.dataSource.query(
      `
        SELECT "id", "title", "shortDescription", "content", "blogId", "blogName", "createdAt", "isVisible"
        FROM public."Posts"
        WHERE "blogId" = $1 AND "isVisible" = true
        ORDER BY "${sortBy}" ${sortDirection}
        OFFSET $2 LIMIT $3
      `,
      [blogId, (pageNumber - 1) * pageSize, pageSize],
    );

    const itemsWithLikes = items.map((i) => plugForCreatingPosts(i));

    // const itemsWithLikes = await Promise.all(
    //   items.map(async (i) => {
    //     const likesCount = await this.likesRepository.likesCount(i.id);
    //     const dislikeCount = await this.likesRepository.dislikeCount(i.id);
    //     const myStatus = await this.likesRepository.getMyStatus(i.id, userId);
    //     const newestLikes = await this.likesRepository.getNewestLikes(i.id);
    //     const mappedForResponse: PostsForResponse = await mapPostWithLikes(
    //       i,
    //       likesCount,
    //       dislikeCount,
    //       myStatus,
    //       newestLikes,
    //     );
    //     return mappedForResponse;
    //   }),
    // );

    const totalCount = await this.dataSource.query(
      `
      SELECT count(*)
      FROM public."Posts"
      WHERE "blogId" = $1 AND "isVisible" = true
      `,
      [blogId],
    );

    return {
      pagesCount: Math.ceil(+totalCount[0].count / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: +totalCount[0].count,
      items: itemsWithLikes,
    };
  }
}
