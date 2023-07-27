import { UsersQueryDto } from '../../types/dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users.schema';
import { Model } from 'mongoose';
import { UsersForResponse, UsersPaginationResponse } from '../../types/types';
import { Injectable } from '@nestjs/common';
import { mapUsersForResponse } from '../../helpers/map.users.for.response';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}
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
    const user = await this.dataSource.query(
      `
    SELECT "id", "login", "email", "passwordHash", "createdAt", "confirmationCode", "codeExpirationDate", "isConfirmed", "isBanned", "banDate", "banReason"
    FROM public."Users"
    WHERE "email" = $1
    `,
      [email],
    );
    return user[0];
  }

  async findUserByLogin(login: string) {
    const user = await this.dataSource.query(
      `
    SELECT "id", "login", "email", "passwordHash", "createdAt", "confirmationCode", "codeExpirationDate", "isConfirmed", "isBanned", "banDate", "banReason"
    FROM public."Users"
    WHERE "login" = $1
    `,
      [login],
    );
    return user[0];
  }

  async findUserByCode(code: string) {
    const user = await this.dataSource.query(
      `
    SELECT "id", "login", "email", "passwordHash", "createdAt", "confirmationCode", "codeExpirationDate", "isConfirmed", "isBanned", "banDate", "banReason"
    FROM public."Users"
    WHERE "confirmationCode" = $1
    `,
      [code],
    );
    return user[0];
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
