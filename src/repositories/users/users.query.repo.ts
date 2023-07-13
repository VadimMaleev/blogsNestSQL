import { UsersQueryDto } from '../../types/dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users.schema';
import { Model } from 'mongoose';
import { UsersForResponse, UsersPaginationResponse } from '../../types/types';
import { Injectable } from '@nestjs/common';
import { mapUsersForResponse } from '../../helpers/map.users.for.response';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async getUsers(query: UsersQueryDto): Promise<UsersPaginationResponse> {
    const pageNumber: number = Number(query.pageNumber) || 1;
    const pageSize: number = Number(query.pageSize) || 10;
    const sortBy: string = query.sortBy || 'createdAt';
    const sortDirection: 'asc' | 'desc' = query.sortDirection || 'desc';
    const login: string = query.searchLoginTerm || '';
    const email: string = query.searchEmailTerm || '';
    const banStatus: string = query.banStatus || 'all';

    const _query = [];
    if (login) {
      _query.push({ login: { $regex: `(?i)(${login})` } });
    }
    if (email) {
      _query.push({ email: { $regex: `(?i)(${email})` } });
    }

    if (banStatus === 'banned') {
      _query.push({ isBanned: true });
    }

    if (banStatus === 'notBanned') {
      _query.push({ isBanned: false });
    }

    const queryFetch = _query.length ? { $or: _query } : {};

    const items = await this.userModel
      .find(queryFetch)
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    const itemsForResponse: UsersForResponse[] = items.map((i) =>
      mapUsersForResponse(i),
    );

    return {
      pagesCount: Math.ceil(
        (await this.userModel.count(queryFetch)) / pageSize,
      ),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: await this.userModel.count(queryFetch),
      items: itemsForResponse,
    };
  }

  async findUserByEmail(email: string) {
    return this.userModel.findOne({ email: email });
  }

  async findUserByLogin(login: string) {
    return this.userModel.findOne({ login: login });
  }

  async findUserByCode(code: string) {
    return this.userModel.findOne({ confirmationCode: code });
  }

  async findUserByLoginOrEmail(loginOrEmail: string) {
    return this.userModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
  }

  async findUserById(id: string): Promise<UserDocument> {
    return this.userModel.findOne({ id: id });
  }
}
