import { HttpException, Injectable } from '@nestjs/common';
import { Blog, BlogDocument } from './blogs.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogCreateInputModelType } from '../../types/input.models';
import { CreateBlogDto } from '../../types/dto';
import { UserDocument } from '../users/users.schema';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async createBlog(newBlog: CreateBlogDto) {
    await new this.blogModel(newBlog).save();
  }

  async deleteBlog(id: string, userId: string): Promise<boolean> {
    const blogInstance = await this.blogModel.findOne({ id: id });
    if (!blogInstance) return false;
    if (userId !== blogInstance.userId)
      throw new HttpException('Not your own', 403);

    await blogInstance.deleteOne();
    return true;
  }

  async updateBlog(
    id: string,
    inputModel: BlogCreateInputModelType,
    userId: string,
  ): Promise<boolean> {
    const blogInstance: BlogDocument = await this.blogModel.findOne({ id: id });
    if (!blogInstance) return false;
    if (userId !== blogInstance.userId)
      throw new HttpException('Not your own', 403);
    blogInstance.updateBlog(inputModel);

    await blogInstance.save();
    return true;
  }

  async bindBlogToUser(blog: BlogDocument, user: UserDocument) {
    blog.userId = user.id;
    blog.login = user.login;
    await blog.save();
    return true;
  }

  async updateBanStatus(
    blog: BlogDocument,
    banStatus: boolean,
    banDate: Date | null,
  ) {
    blog.isBanned = banStatus;
    blog.banDate = banDate;

    await blog.save();
    return true;
  }
}
