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
import { BlogDocument } from '../../../repositories/blogs/blogs.schema';
import { CommentsQueryRepository } from '../../../repositories/comments/comments.query.repo';

@Controller('blogger/blogs')
export class BloggersBlogsController {
  constructor(
    protected blogsService: BlogsService,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsService: PostsService,
    protected commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Post()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  async createBlog(
    @Body() blogInputModel: BlogCreateInputModelType,
    @Request() req,
  ) {
    return this.blogsService.createBlog(
      blogInputModel,
      req.user.id,
      req.user.login,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getBlogsForUser(@Query() query: BlogsQueryDto, @Request() req) {
    return this.blogsQueryRepository.getBlogsForUser(query, req.user.id);
  }

  @Put(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async updateBlog(
    @Param('id') id: string,
    @Body() inputModel: BlogCreateInputModelType,
    @Request() req,
  ) {
    const isUpdated = await this.blogsService.updateBlog(
      id,
      inputModel,
      req.user.id,
    );
    if (!isUpdated) throw new NotFoundException('Blog not found');
    return isUpdated;
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async deleteBlog(@Param('id') id: string, @Request() req) {
    const isDeleted = await this.blogsService.deleteBlog(id, req.user.id);
    if (!isDeleted) throw new NotFoundException('Blog not found');
    return isDeleted;
  }

  @Post(':id/posts')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  async createPostForBlog(
    @Param('id') id: string,
    @Body() postInputModel: PostCreateFromBlogInputModelType,
    @Request() req,
  ) {
    const blog: BlogDocument = await this.blogsQueryRepository.getOneBlogById(
      id,
    );
    if (!blog) throw new NotFoundException('Blog not found');
    if (blog.userId !== req.user.id)
      throw new HttpException('Not your own', 403);
    return this.postsService.createPostForBlog(
      postInputModel,
      blog,
      req.user.id,
    );
  }

  @Put(':blogId/posts/:postId')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async updatePost(
    @Param() params: UriParamsForBloggersApi,
    @Body() postInputModel: PostCreateFromBlogInputModelType,
    @Request() req,
  ) {
    const isUpdated = await this.postsService.updatePost(
      params.postId,
      postInputModel,
      params.blogId,
      req.user.id,
    );
    if (!isUpdated) throw new NotFoundException('Post not found');
    return isUpdated;
  }

  @Delete(':blogId/posts/:postId')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async deletePost(@Param() params: UriParamsForBloggersApi, @Request() req) {
    const isDeleted = await this.postsService.deletePost(params, req.user.id);
    if (!isDeleted) throw new NotFoundException('Post not found');
    return isDeleted;
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
