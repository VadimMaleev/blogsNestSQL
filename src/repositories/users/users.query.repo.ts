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

    const createFilterForGetUsers = (
      login: string,
      email: string,
      banStatus: string,
    ) => {
      let filter = '';
      let isBanned = 'isBanned = true OR isBanned = false';

      if (banStatus === 'banned') isBanned = 'isBanned = true';
      if (banStatus === 'notBanned') isBanned = 'isBanned = false';
      const loginTerm = login ? ` AND login like %${login}%` : '';
      const emailTerm = email ? ` AND email like %${email}%` : '';

      filter = isBanned + loginTerm + emailTerm;
      return filter;
    };

    const filter: string = createFilterForGetUsers(login, email, banStatus);

    const items = await this.dataSource.query(
      `
    SELECT "id", "login", "email", "createdAt", "isBanned", "banDate", "banReason"
    FROM public."Users"
    WHERE ${filter}
    ORDER BY $1 ${sortDirection}
    OFFSET  $2 LIMIT $3
    `,
      [sortBy, (pageNumber - 1) * pageSize, pageSize],
    );

    const itemsForResponse: UsersForResponse[] = items.map((i) =>
      mapUsersForResponse(i),
    );

    const totalCount = await this.dataSource.query(
      `
      SELECT count(*)
      FROM public."Users"
      WHERE ${filter}
      `,
    );
    return {
      pagesCount: Math.ceil(+totalCount[0].count / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: +totalCount[0].count,
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
    const user = await this.dataSource.query(
      `
    SELECT "id", "login", "email", "passwordHash", "createdAt", "confirmationCode", "codeExpirationDate", "isConfirmed", "isBanned", "banDate", "banReason"
    FROM public."Users"
    WHERE "login" = $1 OR "email" = $1
    `,
      [loginOrEmail],
    );
    return user[0];
  }

  async findUserById(id: string): Promise<UserDocument> {
    return this.userModel.findOne({ id: id });
  }
}
