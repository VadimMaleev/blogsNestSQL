import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  CommentCreateInputModel,
  LikeStatusInputModel,
} from '../../../types/input.models';
import { PostsService } from '../../../application/services/posts.service';
import { PostsQueryRepository } from '../../../repositories/posts/posts.query.repo';
import { PaginationDto } from '../../../types/dto';
import { CommentsQueryRepository } from '../../../repositories/comments/comments.query.repo';
import { JwtAuthGuard } from '../../../guards/jwt.auth.guard';
import { CommentsService } from '../../../application/services/comments.service';
import { ExtractUserIdFromHeadersUseCase } from '../../../helpers/extract.userId.from.headers';

@Controller('posts')
export class PublicPostsController {
  constructor(
    protected postsService: PostsService,
    protected postsQueryRepository: PostsQueryRepository,
    protected commentsQueryRepository: CommentsQueryRepository,
    protected commentsService: CommentsService,
    protected extractUserIdFromHeadersUseCase: ExtractUserIdFromHeadersUseCase,
  ) {}

  @Get(':id')
  async getPostById(
    @Param('id')
    id: string,
    @Request() req,
  ) {
    let userId: string | null = null;
    if (req.headers.authorization) {
      userId = await this.extractUserIdFromHeadersUseCase.execute(req);
    }
    const post = await this.postsQueryRepository.getPostById(id, userId);
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  @Get()
  async getPosts(@Query() query: PaginationDto, @Request() req) {
    let userId: string | null = null;
    if (req.headers.authorization) {
      userId = await this.extractUserIdFromHeadersUseCase.execute(req);
    }
    return this.postsQueryRepository.getPosts(query, userId);
  }

  @Get(':id/comments')
  async getCommentsForPost(
    @Param('id') id: string,
    @Query() query: PaginationDto,
    @Request() req,
  ) {
    let userId: string | null = null;
    if (req.headers.authorization) {
      userId = await this.extractUserIdFromHeadersUseCase.execute(req);
    }
    const post = await this.postsQueryRepository.findPostById(id);
    if (!post) throw new NotFoundException('Post not found');
    return this.commentsQueryRepository.getCommentsForPost(id, query, userId);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Body() inputModel: CommentCreateInputModel,
    @Param('id') id: string,
    @Request() req,
  ) {
    const post = await this.postsQueryRepository.findPostById(id);
    if (!post) throw new NotFoundException();

    return await this.commentsService.createComment(
      id,
      inputModel.content,
      req.user.id,
      req.user.login,
      post.blogId,
    );
  }

  @Put(':id/like-status')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async addLikeStatusForPost(
    @Body() inputModel: LikeStatusInputModel,
    @Param('id') id: string,
    @Request() req,
  ) {
    const post = await this.postsQueryRepository.findPostById(id);
    if (!post) throw new NotFoundException();
    const userId: string | null =
      await this.extractUserIdFromHeadersUseCase.execute(req);
    await this.postsService.makeLikeOrUnlike(id, userId, inputModel.likeStatus);
  }
}
