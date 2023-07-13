import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogsQueryRepository } from '../../../repositories/blogs/blogs.query.repo';

import { BlogsService } from '../../../application/services/blogs.service';
import { BindBlogToUserParams, BlogsQueryDto } from '../../../types/dto';
import { BasicAuthGuard } from '../../../guards/basic.auth.guard';
import { UsersQueryRepository } from '../../../repositories/users/users.query.repo';
import { BanBlogInputModel } from '../../../types/input.models';

@Controller('sa/blogs')
export class BlogsSAController {
  constructor(
    protected blogsService: BlogsService,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  @UseGuards(BasicAuthGuard)
  async getBlogsForAdmin(@Query() query: BlogsQueryDto) {
    return this.blogsQueryRepository.getBlogsForAdmin(query);
  }

  @Put(':blogId/bind-with-user/:userId')
  @HttpCode(204)
  @UseGuards(BasicAuthGuard)
  async bindBlogToUser(@Param() params: BindBlogToUserParams) {
    const user = await this.usersQueryRepository.findUserById(params.userId);
    if (!user) throw new BadRequestException('userId invalid');

    const blog = await this.blogsQueryRepository.getOneBlogById(params.blogId);
    if (!blog || blog.userId) throw new BadRequestException('blogId invalid');

    return await this.blogsService.bindBlogToUser(blog, user);
  }

  @Put(':id/ban')
  @HttpCode(204)
  @UseGuards(BasicAuthGuard)
  async banOrUnbanBlog(
    @Param('id') id: string,
    @Body() inputModel: BanBlogInputModel,
  ) {
    return await this.blogsService.banOrUnbanBlog(id, inputModel.isBanned);
  }
}
