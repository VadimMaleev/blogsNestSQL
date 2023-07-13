import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtBlackList, JwtDocument } from './jwt.schema';
import { Model } from 'mongoose';

@Injectable()
export class JwtRepository {
  constructor(
    @InjectModel(JwtBlackList.name) private tokensModel: Model<JwtDocument>,
  ) {}

  async expireRefreshToken(refreshToken: string) {
    const tokenInstance = new this.tokensModel();
    tokenInstance.refreshToken = refreshToken;
    await tokenInstance.save();

    return tokenInstance;
  }
  async findAllExpiredTokens(token: string) {
    return this.tokensModel.findOne({ refreshToken: token });
  }
}
