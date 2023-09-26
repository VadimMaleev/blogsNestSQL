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
    userId: string | null,
  ): Promise<PostsForResponse | null> {
    const post = await this.dataSource.query(
      `
        SELECT "id", "title", "shortDescription", "content", "blogId", "blogName", "createdAt", "isVisible",
        (
        SELECT count (*)
        FROM public."Likes" 
        WHERE "idOfEntity" = $1 AND "status" = 'Like'
        ) as "likesCount",
        (
        SELECT count (*)
        FROM public."Likes"
        WHERE "idOfEntity" = $1 AND "status" = 'Dislike'
        ) as "dislikesCount",
        (
        SELECT "status"
        FROM public."Likes"
        WHERE "idOfEntity" = $1 AND "userId" = $2
        ) as "myStatus",
        ARRAY (SELECT row_to_json(row) FROM (SELECT "addedAt", "userId", "login" FROM public."Likes" WHERE "idOfEntity" = $1 AND "status" = 'Like' ORDER BY "addedAt" DESC LIMIT 3) row) as "newestLikes"
        FROM public."Posts"
        WHERE "id" = $1 AND "isVisible" = true
      `,
      [id, userId],
    );
    if (!post[0]) return null;

    return mapPostWithLikes(post[0]);
  }

  async getPosts(
    query: PaginationDto,
    userId: string | null,
  ): Promise<PostsPaginationResponse> {
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'createdAt';
    const sortDirection: 'asc' | 'desc' = query.sortDirection || 'desc';

    const items = await this.dataSource.query(
      `
        SELECT p."id", p."title", p."shortDescription", p."content", p."blogId", p."blogName", p."createdAt", p."isVisible",
        (
        SELECT count (*)
        FROM public."Likes" l
        WHERE p."id" = l."idOfEntity" AND l."status" = 'Like'
        ) as "likesCount",
        (
        SELECT count (*)
        FROM public."Likes" l
        WHERE p."id" = l."idOfEntity" AND l."status" = 'Dislike'
        ) as "dislikesCount",
        (
        SELECT "status"
        FROM public."Likes" l
        WHERE p."id" = l."idOfEntity" AND l."userId" = $3
        ) as "myStatus",
        ARRAY (SELECT row_to_json(row) FROM (SELECT "addedAt", "userId", "login" FROM public."Likes" WHERE "idOfEntity" = p.id AND "status" = 'Like' ORDER BY "addedAt" DESC LIMIT 3) row) as "newestLikes"
        FROM public."Posts" p
        WHERE "isVisible" = true
        ORDER BY "${sortBy}" ${sortDirection}
        OFFSET $1 LIMIT $2
      `,
      [(pageNumber - 1) * pageSize, pageSize, userId],
    );

    const itemsWithLikes = items.map((i) => mapPostWithLikes(i));

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
    userId: string | null,
  ): Promise<PostsPaginationResponse> {
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'createdAt';
    const sortDirection: 'asc' | 'desc' = query.sortDirection || 'desc';

    const items = await this.dataSource.query(
      `
        SELECT p."id", p."title", p."shortDescription", p."content", p."blogId", p."blogName", p."createdAt", p."isVisible",
        (
        SELECT count (*)
        FROM public."Likes" l
        WHERE p."id" = l."idOfEntity" AND l."status" = 'Like'
        ) as "likesCount",
        (
        SELECT count (*)
        FROM public."Likes" l
        WHERE p."id" = l."idOfEntity" AND l."status" = 'Dislike'
        ) as "dislikesCount",
        (
        SELECT "status"
        FROM public."Likes" l
        WHERE p."id" = l."idOfEntity" AND l."userId" = $4
        ) as "myStatus",
        ARRAY (SELECT row_to_json(row) FROM (SELECT "addedAt", "userId", "login" FROM public."Likes" WHERE "idOfEntity" = p.id AND "status" = 'Like' ORDER BY "addedAt" DESC LIMIT 3) row) as "newestLikes"
        FROM public."Posts" p 
        WHERE "blogId" = $1 AND "isVisible" = true
        ORDER BY "${sortBy}" ${sortDirection}
        OFFSET $2 LIMIT $3
      `,
      [blogId, (pageNumber - 1) * pageSize, pageSize, userId],
    );

    const itemsWithLikes = items.map((i) => mapPostWithLikes(i));

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
