import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { BlogsRepository } from '../../repositories/blogs/blogs.repo';
import { BlogCreateInputModelType } from '../../types/input.models';
import { BlogsForResponse } from '../../types/types';
import { CreateBlogDto } from '../../types/dto';
import { v4 as uuidv4 } from 'uuid';
import { PostsRepository } from '../../repositories/posts/posts.repo';
import { UsersRepository } from '../../repositories/users/users.repo';

@Injectable()
export class BlogsService {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected postsRepository: PostsRepository,
    protected usersRepository: UsersRepository,
  ) {}

  async createBlog(
    blog: BlogCreateInputModelType,
    // userId: string,
    // login: string,
  ): Promise<BlogsForResponse> {
    const newBlog = new CreateBlogDto(
      uuidv4(),
      blog.name,
      blog.description,
      blog.websiteUrl,
      new Date(),
      false,
      // userId,
      // login,
      false,
    );

    await this.blogsRepository.createBlog(newBlog);
    return {
      id: newBlog.id,
      name: newBlog.name,
      description: newBlog.description,
      websiteUrl: newBlog.websiteUrl,
      createdAt: newBlog.createdAt,
      isMembership: newBlog.isMembership,
    };
  }

  async updateBlog(
    id: string,
    inputModel: BlogCreateInputModelType,
    //userId: string,
  ): Promise<boolean> {
    const blog = await this.blogsRepository.getBlogById(id);
    if (!blog) return false;
    //if (blog.userId !== userId) throw new HttpException('Not your own', 403);
    return this.blogsRepository.updateBlog(id, inputModel);
  }

  async deleteBlog(id: string /*userId: string*/): Promise<boolean> {
    const blog = await this.blogsRepository.getBlogById(id);
    if (!blog) return false;
    //if (blog.userId !== userId) throw new HttpException('Not your own', 403);
    return this.blogsRepository.deleteBlog(id);
  }

  async bindBlogToUser(blogId: string, userId: string) {
    const user = await this.usersRepository.findUserById(userId);
    if (!user) throw new BadRequestException('userId invalid');

    const blog = await this.blogsRepository.getBlogById(blogId);
    if (!blog || blog.userId) throw new BadRequestException('blogId invalid');

    return await this.blogsRepository.bindBlogToUser(
      user.id,
      user.login,
      blog.id,
    );
  }

  async banOrUnbanBlog(id: string, banStatus: boolean) {
    const blog = await this.blogsRepository.getBlogById(id);
    if (!blog) throw new BadRequestException();

    let banDate = null;
    if (banStatus) banDate = new Date();

    await this.blogsRepository.updateBanStatus(banStatus, banDate, blog.id);
    await this.postsRepository.updateVisibleStatus(id, banStatus);
  }
}
