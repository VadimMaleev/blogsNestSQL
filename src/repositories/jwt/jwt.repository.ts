import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtBlackList, JwtDocument } from './jwt.schema';
import { Model } from 'mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class JwtRepository {
  constructor(
    @InjectModel(JwtBlackList.name) private tokensModel: Model<JwtDocument>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async expireRefreshToken(refreshToken: string) {
    await this.dataSource.query(
      `
        INSERT INTO public."Tokens"(
        "refreshToken")
        VALUES ($1);
      `,
      [refreshToken],
    );
  }
  async findAllExpiredTokens(token: string) {
    return this.tokensModel.findOne({ refreshToken: token });
  }
}
