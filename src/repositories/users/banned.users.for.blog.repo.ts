import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  BannedUserForBlog,
  BannedUsersForBlogDocument,
} from './banned.users.for.blog.schema';
import { Model } from 'mongoose';
import { BannedUserForBlogDto, LoginQueryDto } from '../../types/dto';
import { mapBannedUsersForBlog } from '../../helpers/map.banned.users.for.blog';
import { BannedUsersForBlogResponse } from '../../types/types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BannedUsersForBlogRepository {
  constructor(
    @InjectModel(BannedUserForBlog.name)
    private bannedUserForBlogModel: Model<BannedUsersForBlogDocument>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async addBannedUser(bannedUser: BannedUserForBlogDto) {
    await this.dataSource.query(
      `
        INSERT INTO public."BannedUsersForBlogs"(
        "userId", "login", "isBanned", "banDate", "banReason", "blogId")
        VALUES ($1, $2, $3, $4, $5, $6)
    `,
      [
        bannedUser.userId,
        bannedUser.login,
        bannedUser.isBanned,
        bannedUser.banDate,
        bannedUser.banReason,
        bannedUser.blogId,
      ],
    );
  }

  async deleteBannedUser(userId: string) {
    await this.dataSource.query(
      `
        DELETE FROM public."BannedUsersForBlogs"
        WHERE "userId" = $1
        `,
      [userId],
    );
    return true;
  }

  async getBannedUsersForBlog(
    blogId: string,
    query: LoginQueryDto,
  ): Promise<BannedUsersForBlogResponse> {
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'banDate';
    const sortDirection: 'asc' | 'desc' = query.sortDirection || 'desc';
    const loginSearchTerm: string = query.searchLoginTerm || '';

    let filter = `"blogId" = '${blogId}'`;
    if (loginSearchTerm) {
      filter += ` AND LOWER("login") like LOWER('%${loginSearchTerm}%')`;
    }

    const items = await this.dataSource.query(
      `
      SELECT "userId", "login", "isBanned", "banDate", "banReason"
        FROM public."BannedUsersForBlogs"
        WHERE ${filter}
        ORDER BY "${sortBy}" ${sortDirection}
        OFFSET $1 LIMIT $2
      `,
      [(pageNumber - 1) * pageSize, pageSize],
    );
    const itemsForResponse = items.map(mapBannedUsersForBlog);

    const totalCount = await this.dataSource.query(
      `
      SELECT count(*)
      FROM public."BannedUsersForBlogs"
      WHERE ${filter}
      `,
      [blogId],
    );

    return {
      pagesCount: Math.ceil(+totalCount[0].count / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: +totalCount[0].count,
      items: itemsForResponse,
    };
  }

  async findBannedUserByUserIdAndBlogId(userId: string, blogId: string) {
    const user = await this.dataSource.query(
      `
        SELECT "userId", "login", "isBanned", "banDate", "banReason", "blogId"
        FROM public."BannedUsersForBlogs"
        WHERE "blogId" = $1 AND "userId" = $2
      `,
      [blogId, userId],
    );
    return user[0];
  }

  async getBannedUserById(userId: string) {
    const user = await this.dataSource.query(
      `
        SELECT "userId", "login", "isBanned", "banDate", "banReason", "blogId"
        FROM public."BannedUsersForBlogs"
        WHERE "userId" = $1
      `,
      [userId],
    );
    return user[0];
  }
}
