import { InjectModel } from '@nestjs/mongoose';
import { Like, LikeDocument } from './likes.schema';
import { Model } from 'mongoose';
import { NewestLikes } from '../../types/types';
import { v4 as uuidv4 } from 'uuid';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class LikesRepository {
  constructor(
    @InjectModel(Like.name) private likesModel: Model<LikeDocument>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async makeLikeOrUnlike(
    id: string,
    userId: string,
    login: string,
    likeStatus: string,
  ) {
    const like = await this.dataSource.query(
      `
        SELECT "id", "idOfEntity", "userId", "login", "addedAt", "status", "isVisible"
        FROM public."Likes"
        WHERE "idOfEntity" = $1 AND "userId" = $2
      `,
      [id, userId],
    );

    if (!like[0]) {
      await this.dataSource.query(
        `
        INSERT INTO public."Likes"(
        "id", "idOfEntity", "userId", "login", "addedAt", "status", "isVisible")
        VALUES ($1, $2, $3, $4, $5, $6, $7);
        `,
        [uuidv4(), id, userId, login, new Date(), likeStatus, true],
      );
    }

    if (like[0] && like[0].status !== likeStatus) {
      await this.dataSource.query(
        `
        UPDATE public."Likes"
        SET  "status" = $1, 
             "addedAt" = $2
        WHERE "idOfEntity" = $3 AND "userId" = $4
        `,
        [likeStatus, new Date(), id, userId],
      );
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
