import { InjectModel } from '@nestjs/mongoose';
import { Like, LikeDocument } from './likes.schema';
import { Model } from 'mongoose';
import { LikesStatusEnum, NewestLikes } from '../../types/types';
import { v4 as uuidv4 } from 'uuid';

export class LikesRepository {
  constructor(
    @InjectModel(Like.name) private likesModel: Model<LikeDocument>,
  ) {}

  async likesCount(id: string): Promise<number> {
    return this.likesModel.count({
      idOfEntity: id,
      status: 'Like',
      isVisible: true,
    });
  }

  async dislikeCount(id: string): Promise<number> {
    return this.likesModel.count({
      idOfEntity: id,
      status: 'Dislike',
      isVisible: true,
    });
  }

  async getMyStatus(id: string, userId?: string | null): Promise<string> {
    if (!userId) return LikesStatusEnum.None;
    const likeOrDislike = await this.likesModel.findOne({
      idOfEntity: id,
      userId: userId,
    });
    if (!likeOrDislike) return LikesStatusEnum.None;
    return likeOrDislike.status;
  }

  async makeLikeOrUnlike(
    id: string,
    userId: string,
    login: string,
    likeStatus: string,
  ) {
    const like: LikeDocument | undefined = await this.likesModel.findOne({
      idOfEntity: id,
      userId: userId,
    });
    if (!like) {
      const likeOrUnlike = new this.likesModel({
        id: uuidv4(),
        idOfEntity: id,
        userId: userId,
        login: login,
        addedAt: new Date(),
        status: likeStatus,
        isVisible: true,
      });
      await this.likesModel.insertMany(likeOrUnlike);
    }

    if (like && like.status !== likeStatus) {
      like.status = likeStatus;
      like.addedAt = new Date();
      await like.save();
    }
    return true;
  }

  async getNewestLikes(id: string): Promise<NewestLikes[]> {
    return this.likesModel
      .find({ idOfEntity: id, status: 'Like', isVisible: true })
      .sort({ addedAt: -1 })
      .select('-_id -id -idOfEntity -status')
      .limit(3);
  }

  async updateVisibleStatus(userId: string, banStatus: boolean) {
    await this.likesModel.updateMany(
      { userId: userId },
      { isVisible: !banStatus },
    );
  }
}
