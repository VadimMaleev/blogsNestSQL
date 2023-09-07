import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BlogsQueryRepository } from '../../../repositories/blogs/blogs.query.repo';
import { PostsService } from '../../../application/services/posts.service';
import {
  BlogCreateInputModelType,
  PostCreateFromBlogInputModelType,
} from '../../../types/input.models';
import { JwtAuthGuard } from '../../../guards/jwt.auth.guard';
import { BlogsService } from '../../../application/services/blogs.service';
import {
  BlogsQueryDto,
  PaginationDto,
  UriParamsForBloggersApi,
} from '../../../types/dto';
import { CommentsQueryRepository } from '../../../repositories/comments/comments.query.repo';
import { BlogsRepository } from '../../../repositories/blogs/blogs.repo';

@Controller('blogger/blogs')
export class BloggersBlogsController {
  constructor(
    protected blogsService: BlogsService,
    protected blogsRepository: BlogsRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsService: PostsService,
    protected commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getBlogsForUser(@Query() query: BlogsQueryDto, @Request() req) {
    return this.blogsQueryRepository.getBlogsForUser(query, req.user.id);
  }

  @Get('comments')
  @UseGuards(JwtAuthGuard)
  async getAllCommentsForBlogOwner(
    @Query() query: PaginationDto,
    @Request() req,
  ) {
    return this.commentsQueryRepository.findAllCommentsForBlogOwner(
      req.user.id,
      query,
    );
  }
}
