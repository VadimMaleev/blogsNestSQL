import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './blogs.schema';
import { Model } from 'mongoose';
import { BlogsForResponse, BlogsPaginationResponse } from '../../types/types';
import { BlogsQueryDto } from '../../types/dto';
import { Injectable } from '@nestjs/common';
import { mapBlogsForAdmin } from '../../helpers/map.blogs.for.admin';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async getBlogs(query: BlogsQueryDto): Promise<BlogsPaginationResponse> {
    const searchNameTerm: string = query.searchNameTerm || '';
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'createdAt';
    const sortDirection: 'asc' | 'desc' = query.sortDirection || 'desc';

    const items = await this.blogModel
      .find(
        { name: { $regex: searchNameTerm, $options: 'i' }, isBanned: false },
        { _id: 0, isBanned: 0, userId: 0, login: 0 },
      )
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection })
      .lean();

    return {
      pagesCount: Math.ceil(
        (await this.blogModel.count({
          name: { $regex: searchNameTerm, $options: 'i' },
        })) / pageSize,
      ),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: await this.blogModel.count({
        name: { $regex: searchNameTerm, $options: 'i' },
      }),
      items,
    };
  }

  async getOneBlogById(id: string): Promise<BlogDocument | null> {
    return this.blogModel.findOne({ id: id });
  }

  async getBlogsForUser(query: BlogsQueryDto, userId: string) {
    const searchNameTerm: string = query.searchNameTerm || '';
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'createdAt';
    const sortDirection: 'asc' | 'desc' = query.sortDirection || 'desc';

    const items = await this.blogModel

      .find(
        {
          userId: userId,
          name: { $regex: searchNameTerm, $options: 'i' },
          isBanned: false,
        },
        { _id: 0, userId: 0, login: 0, isBanned: 0 },
      )
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection })
      .lean();

    return {
      pagesCount: Math.ceil(
        (await this.blogModel.count({
          userId: userId,
          name: { $regex: searchNameTerm, $options: 'i' },
        })) / pageSize,
      ),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: await this.blogModel.count({
        userId: userId,
        name: { $regex: searchNameTerm, $options: 'i' },
      }),
      items,
    };
  }

  async getPublicBlogById(id: string): Promise<BlogsForResponse | null> {
    return this.blogModel.findOne(
      { id: id, isBanned: false },
      { _id: 0, userId: 0, login: 0, isBanned: 0 },
    );
  }

  async getBlogsForAdmin(query: BlogsQueryDto) {
    const searchNameTerm: string = query.searchNameTerm || '';
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'createdAt';
    const sortDirection: 'asc' | 'desc' = query.sortDirection || 'desc';

    const items = await this.blogModel
      .find({ name: { $regex: searchNameTerm, $options: 'i' } })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection });

    const itemsForResponse = items.map((i) => mapBlogsForAdmin(i));

    return {
      pagesCount: Math.ceil(
        (await this.blogModel.count({
          name: { $regex: searchNameTerm, $options: 'i' },
        })) / pageSize,
      ),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: await this.blogModel.count({
        name: { $regex: searchNameTerm, $options: 'i' },
      }),
      items: itemsForResponse,
    };
  }
}
