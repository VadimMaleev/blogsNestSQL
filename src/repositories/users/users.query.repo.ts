import { UsersQueryDto } from '../../types/dto';
import { UsersForResponse, UsersPaginationResponse } from '../../types/types';
import { Injectable } from '@nestjs/common';
import { mapUsersForResponse } from '../../helpers/map.users.for.response';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

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
      let isBanned = '"isBanned" = true OR "isBanned" = false';

      if (banStatus === 'banned') isBanned = '"isBanned" = true';
      if (banStatus === 'notBanned') isBanned = '"isBanned" = false';
      if (login && email) {
        return (
          isBanned +
          ` AND (LOWER("login") like LOWER('%${login}%') OR "email" like '%${email}%')`
        );
      }
      const loginTerm = login
        ? ` AND LOWER("login") like LOWER('%${login}%')`
        : ''; //` AND "login" like '%%'`;
      const emailTerm = email ? ` AND "email" like '%${email}%'` : ''; //` AND "email" like '%%'`;

      filter = isBanned + loginTerm + emailTerm; // 'isBanned = false '' ''
      return filter;
    };

    const filter: string = createFilterForGetUsers(login, email, banStatus);

    const items = await this.dataSource.query(
      `
    SELECT "id", "login", "email", "createdAt", "isBanned", "banDate", "banReason"
    FROM public."Users"
    WHERE ${filter}
    ORDER BY "${sortBy}" ${sortDirection}
    OFFSET $1 LIMIT $2
    `,
      [(pageNumber - 1) * pageSize, pageSize],
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
}
