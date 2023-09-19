import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  NotFoundException,
  Param,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommentsQueryRepository } from '../../../repositories/comments/comments.query.repo';
import { JwtAuthGuard } from '../../../guards/jwt.auth.guard';
import { CommentsService } from '../../../application/services/comments.service';
import {
  CommentCreateInputModel,
  LikeStatusInputModel,
} from '../../../types/input.models';
import { ExtractUserIdFromHeadersUseCase } from '../../../helpers/extract.userId.from.headers';
import { CommentsRepository } from '../../../repositories/comments/comments.repo';

@Controller('comments')
export class PublicCommentsController {
  constructor(
    protected commentsQueryRepository: CommentsQueryRepository,
    protected commentsService: CommentsService,
    protected extractUserIdFromHeadersUseCase: ExtractUserIdFromHeadersUseCase,
    protected commentsRepository: CommentsRepository,
  ) {}

  @Get(':id')
  async getCommentById(@Param('id') id: string, @Request() req) {
    let userId: string | null = null;
    if (req.headers.authorization) {
      userId = await this.extractUserIdFromHeadersUseCase.execute(req);
    }
    const comment = await this.commentsRepository.findCommentById(id);
    if (!comment) throw new NotFoundException('Comment not found');
    return this.commentsQueryRepository.getCommentById(id, userId);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async deleteCommentById(@Param('id') id: string, @Request() req) {
    const comment = await this.commentsRepository.findCommentById(id);
    if (!comment) throw new NotFoundException();
    if (comment.userId !== req.user.id)
      throw new HttpException('Not your own', 403);

    const isDeleted = await this.commentsService.deleteCommentById(id);
    if (!isDeleted) throw new NotFoundException();
  }

  @Put(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Body() inputModel: CommentCreateInputModel,
    @Param('id') id: string,
    @Request() req,
  ) {
    const comment = await this.commentsRepository.findCommentById(id);
    if (!comment) throw new NotFoundException();
    if (comment.userId !== req.user.id)
      throw new HttpException('Not your own', 403);

    const isUpdated = await this.commentsService.updateComment(
      id,
      inputModel.content,
    );
    if (!isUpdated) throw new NotFoundException();
  }

  @Put(':id/like-status')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async addLikeStatusForComment(
    @Body() inputModel: LikeStatusInputModel,
    @Param('id') id: string,
    @Request() req,
  ) {
    const comment = await this.commentsRepository.findCommentById(id);
    if (!comment) throw new NotFoundException();
    const userId: string | null =
      await this.extractUserIdFromHeadersUseCase.execute(req);
    await this.commentsService.makeLikeOrUnlike(
      id,
      userId,
      inputModel.likeStatus,
    );
  }
}
