import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './blogs.schema';
import { Model } from 'mongoose';
import { BlogsForResponse, BlogsPaginationResponse } from '../../types/types';
import { BlogsQueryDto } from '../../types/dto';
import { Injectable } from '@nestjs/common';
import { mapBlogsForAdmin } from '../../helpers/map.blogs.for.admin';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async getBlogs(query: BlogsQueryDto): Promise<BlogsPaginationResponse> {
    const searchNameTerm: string = query.searchNameTerm || '';
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'createdAt';
    const sortDirection: 'asc' | 'desc' = query.sortDirection || 'desc';

    let filter = '"isBanned" = false';
    if (searchNameTerm) {
      filter += ` AND (LOWER("name") like LOWER('%${searchNameTerm}%'))`;
    }

    const itemsForResponse = await this.dataSource.query(
      `
        SELECT "id", "name", "description", "websiteUrl", "createdAt", "isMembership"
        FROM public."Blogs"
        WHERE ${filter}
        ORDER BY "${sortBy}" ${sortDirection}
        OFFSET $1 LIMIT $2
      `,
      [(pageNumber - 1) * pageSize, pageSize],
    );

    const totalCount = await this.dataSource.query(
      `
      SELECT count(*)
      FROM public."Blogs"
      WHERE ${filter}
      `,
    );

    return {
      pagesCount: Math.ceil(+totalCount[0].count / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: +totalCount[0].count,
      items: itemsForResponse,
    };
  }

  async getBlogsForUser(query: BlogsQueryDto, userId: string) {
    const searchNameTerm: string = query.searchNameTerm || '';
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'createdAt';
    const sortDirection: 'asc' | 'desc' = query.sortDirection || 'desc';

    let filter = `"userId" = '${userId}'`;
    if (searchNameTerm) {
      filter += ` AND (LOWER("name") like LOWER('%${searchNameTerm}%'))`;
    }

    const itemsForResponse = await this.dataSource.query(
      `
        SELECT "id", "name", "description", "websiteUrl", "createdAt", "isMembership"
        FROM public."Blogs"
        WHERE ${filter}
        ORDER BY "${sortBy}" ${sortDirection}
        OFFSET $1 LIMIT $2
      `,
      [(pageNumber - 1) * pageSize, pageSize],
    );

    const totalCount = await this.dataSource.query(
      `
      SELECT count(*)
      FROM public."Blogs"
      WHERE ${filter}
      `,
    );

    return {
      pagesCount: Math.ceil(+totalCount[0].count / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: +totalCount[0].count,
      items: itemsForResponse,
    };
  }

  async getPublicBlogById(id: string): Promise<BlogsForResponse | null> {
    const blog = await this.dataSource.query(
      `
        SELECT "id", "name", "description", "websiteUrl", "createdAt", "isMembership"
        FROM public."Blogs"
        WHERE "id" = $1 AND "isBanned" = false 
      `,
      [id],
    );
    return blog[0];
  }

  async getBlogsForAdmin(query: BlogsQueryDto) {
    const searchNameTerm: string = query.searchNameTerm || '';
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'createdAt';
    const sortDirection: 'asc' | 'desc' = query.sortDirection || 'desc';

    let nameFilter = `"name" like '%%'`;
    if (searchNameTerm) {
      nameFilter = `LOWER("name") like LOWER('%${searchNameTerm}%')`;
    }

    const items = await this.dataSource.query(
      `
        SELECT "id", "name", "description", "websiteUrl", "createdAt", "isMembership", "isBanned", "banDate"
        FROM public."Blogs"
        WHERE ${nameFilter}
        ORDER BY "${sortBy}" ${sortDirection}
        OFFSET $1 LIMIT $2
      `,
      [(pageNumber - 1) * pageSize, pageSize],
    );

    const itemsForResponse = items.map((i) => mapBlogsForAdmin(i));

    const totalCount = await this.dataSource.query(
      `
      SELECT count(*)
      FROM public."Blogs"
      WHERE ${nameFilter}
      `,
    );

    return {
      pagesCount: Math.ceil(+totalCount[0].count / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: +totalCount[0].count,
      items: itemsForResponse,
    };
  }
}
