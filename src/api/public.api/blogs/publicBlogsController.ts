import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BlogsQueryRepository } from '../../../repositories/blogs/blogs.query.repo';
import { BlogsQueryDto, PaginationDto } from '../../../types/dto';
import { PostsQueryRepository } from '../../../repositories/posts/posts.query.repo';
import { ExtractUserIdFromHeadersUseCase } from '../../../helpers/extract.userId.from.headers';
import { BlogsRepository } from '../../../repositories/blogs/blogs.repo';
import { BasicAuthGuard } from '../../../guards/basic.auth.guard';

@Controller('blogs')
export class PublicBlogsController {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsQueryRepository: PostsQueryRepository,
    protected extractUserIdFromHeadersUseCase: ExtractUserIdFromHeadersUseCase,
  ) {}

  @Get()
  async getBlogs(@Query() query: BlogsQueryDto) {
    return this.blogsQueryRepository.getBlogs(query);
  }

  @Get(':id')
  async getPublicBlogById(@Param('id') id: string) {
    const blog = await this.blogsQueryRepository.getPublicBlogById(id);
    if (!blog) throw new NotFoundException('Blog not found');
    return blog;
  }

  @Get(':id/posts')
  async getPostsForBlog(
    @Param('id') id: string,
    @Query() query: PaginationDto,
    @Request() req,
  ) {
    // let userId: string | null = null;
    // if (req.headers.authorization) {
    //   userId = await this.extractUserIdFromHeadersUseCase.execute(req);
    // }
    const blog = await this.blogsRepository.getBlogById(id);
    if (!blog) throw new NotFoundException('Blog not found');
    return this.postsQueryRepository.getPostsForBlog(blog.id, query /*userId*/);
  }
}
