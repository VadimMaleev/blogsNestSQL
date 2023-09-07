import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument } from './blogs.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogCreateInputModelType } from '../../types/input.models';
import { CreateBlogDto } from '../../types/dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async createBlog(newBlog: CreateBlogDto) {
    await this.dataSource.query(
      `
        INSERT INTO public."Blogs"(
        "id", "name", "description", "websiteUrl", "createdAt", "isMembership", "isBanned", "banDate")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
    `,
      [
        newBlog.id,
        newBlog.name,
        newBlog.description,
        newBlog.websiteUrl,
        newBlog.createdAt,
        newBlog.isMembership,
        // newBlog.userId,
        // newBlog.login,
        newBlog.isBanned,
        null,
      ],
    );
  }

  async deleteBlog(id: string): Promise<boolean> {
    await this.dataSource.query(
      `
        DELETE FROM public."Blogs"
        WHERE "id" = $1
        `,
      [id],
    );
    return true;
  }

  async updateBlog(
    id: string,
    inputModel: BlogCreateInputModelType,
  ): Promise<boolean> {
    await this.dataSource.query(
      `
        UPDATE public."Blogs"
        SET  "name" = $1, 
             "description" = $2,
             "websiteUrl" = $3
        WHERE "id" = $4
        `,
      [inputModel.name, inputModel.description, inputModel.websiteUrl, id],
    );
    return true;
  }

  async bindBlogToUser(userId, login, blogId) {
    await this.dataSource.query(
      `
        UPDATE public."Blogs"
        SET  "userId" = $1, 
             "login" = $2
        WHERE "id" = $3
        `,
      [userId, login, blogId],
    );
    return true;
  }

  async updateBanStatus(
    banStatus: boolean,
    banDate: Date | null,
    blogId: string,
  ) {
    await this.dataSource.query(
      `
        UPDATE public."Blogs"
        SET  "isBanned" = $1, 
             "banDate" = $2
        WHERE "id" = $3
        `,
      [banStatus, banDate, blogId],
    );
    return true;
  }

  async getBlogById(id: string) {
    const blog = await this.dataSource.query(
      `
        SELECT "id", "name", "description", "websiteUrl", "createdAt", "isMembership", "isBanned", "banDate"
        FROM public."Blogs"
        WHERE "id" = $1
      `,
      [id],
    );
    return blog[0];
  }
}
