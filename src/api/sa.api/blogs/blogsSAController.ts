import {
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
import { BanBlogInputModel } from '../../../types/input.models';

@Controller('sa/blogs')
export class BlogsSAController {
  constructor(
    protected blogsService: BlogsService,
    protected blogsQueryRepository: BlogsQueryRepository,
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
    return await this.blogsService.bindBlogToUser(params.blogId, params.userId);
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
