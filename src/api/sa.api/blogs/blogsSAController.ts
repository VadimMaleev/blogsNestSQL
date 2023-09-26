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
import { BlogsService } from '../../../application/services/blogs.service';
import {
  BindBlogToUserParams,
  BlogsQueryDto,
  PaginationDto,
  UriParamsForBloggersApi,
} from '../../../types/dto';
import { BasicAuthGuard } from '../../../guards/basic.auth.guard';
import {
  BanBlogInputModel,
  BlogCreateInputModelType,
  PostCreateFromBlogInputModelType,
} from '../../../types/input.models';
import { JwtAuthGuard } from '../../../guards/jwt.auth.guard';
import { BlogDocument } from '../../../repositories/blogs/blogs.schema';
import { BlogsRepository } from '../../../repositories/blogs/blogs.repo';
import { PostsService } from '../../../application/services/posts.service';
import { PostsQueryRepository } from '../../../repositories/posts/posts.query.repo';
import { ExtractUserIdFromHeadersUseCase } from '../../../helpers/extract.userId.from.headers';

@Controller('sa/blogs')
export class BlogsSAController {
  constructor(
    protected blogsService: BlogsService,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected blogsRepository: BlogsRepository,
    protected postsService: PostsService,
    protected postsQueryRepository: PostsQueryRepository,
    protected extractUserIdFromHeadersUseCase: ExtractUserIdFromHeadersUseCase,
  ) {}

  // @Get()
  // @UseGuards(BasicAuthGuard)
  // async getBlogsForAdmin(@Query() query: BlogsQueryDto) {
  //   return this.blogsQueryRepository.getBlogsForAdmin(query);
  // }

  @Get()
  @UseGuards(BasicAuthGuard)
  async getBlogs(@Query() query: BlogsQueryDto) {
    return this.blogsQueryRepository.getBlogs(query);
  }

  @Post()
  @HttpCode(201)
  @UseGuards(BasicAuthGuard)
  async createBlog(
    @Body() blogInputModel: BlogCreateInputModelType,
    @Request() req,
  ) {
    return this.blogsService.createBlog(
      blogInputModel,
      // req.user.id,
      // req.user.login,
    );
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(BasicAuthGuard)
  async deleteBlog(@Param('id') id: string, @Request() req) {
    const isDeleted = await this.blogsService.deleteBlog(id /*req.user.id*/);
    if (!isDeleted) throw new NotFoundException('Blog not found');
    return isDeleted;
  }

  @Put(':id')
  @HttpCode(204)
  @UseGuards(BasicAuthGuard)
  async updateBlog(
    @Param('id') id: string,
    @Body() inputModel: BlogCreateInputModelType,
    @Request() req,
  ) {
    const isUpdated = await this.blogsService.updateBlog(
      id,
      inputModel,
      // req.user.id,
    );
    if (!isUpdated) throw new NotFoundException('Blog not found');
    return isUpdated;
  }

  @Post(':id/posts')
  @HttpCode(201)
  @UseGuards(BasicAuthGuard)
  async createPostForBlog(
    @Param('id') id: string,
    @Body() postInputModel: PostCreateFromBlogInputModelType,
    @Request() req,
  ) {
    const blog: BlogDocument = await this.blogsRepository.getBlogById(id);
    if (!blog) throw new NotFoundException('Blog not found');
    // if (blog.userId !== req.user.id)
    //   throw new HttpException('Not your own', 403);
    return this.postsService.createPostForBlog(
      postInputModel,
      blog,
      // req.user.id,
    );
  }

  @Get(':id/posts')
  @UseGuards(BasicAuthGuard)
  async getPostsForBlog(
    @Param('id') id: string,
    @Query() query: PaginationDto,
    @Request() req,
  ) {
    let userId: string | null = null;
    if (req.headers.authorization) {
      userId = await this.extractUserIdFromHeadersUseCase.execute(req);
    }
    const blog = await this.blogsRepository.getBlogById(id);
    if (!blog) throw new NotFoundException('Blog not found');
    return this.postsQueryRepository.getPostsForBlog(blog.id, query, userId);
  }

  @Put(':blogId/posts/:postId')
  @HttpCode(204)
  @UseGuards(BasicAuthGuard)
  async updatePost(
    @Param() params: UriParamsForBloggersApi,
    @Body() postInputModel: PostCreateFromBlogInputModelType,
    @Request() req,
  ) {
    const isUpdated = await this.postsService.updatePost(
      params.postId,
      postInputModel,
      params.blogId,
      // req.user.id,
    );
    if (!isUpdated) throw new NotFoundException('Post not found');
    return isUpdated;
  }

  @Delete(':blogId/posts/:postId')
  @HttpCode(204)
  @UseGuards(BasicAuthGuard)
  async deletePost(@Param() params: UriParamsForBloggersApi, @Request() req) {
    const isDeleted = await this.postsService.deletePost(
      params /*req.user.id*/,
    );
    if (!isDeleted) throw new NotFoundException('Post not found');
    return isDeleted;
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
