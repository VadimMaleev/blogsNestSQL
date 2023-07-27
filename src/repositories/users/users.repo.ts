import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './users.schema';
import { CreateUserDto } from '../../types/dto';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async createUser(newUser: CreateUserDto) {
    await this.dataSource.query(
      `
        INSERT INTO public."Users"(
        "id", "login", "email", "passwordHash", "createdAt", "confirmationCode", "codeExpirationDate", "isConfirmed", "isBanned", "banDate", "banReason")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`,
      [
        newUser.id,
        newUser.login,
        newUser.email,
        newUser.passwordHash,
        newUser.createdAt,
        newUser.confirmationCode,
        newUser.codeExpirationDate,
        newUser.isConfirmed,
        newUser.isBanned,
        newUser.banDate,
        newUser.banReason,
      ],
    );
  }

  async deleteUser(id: string): Promise<boolean> {
    const userInstance = await this.userModel.findOne({ id: id });
    if (!userInstance) return false;
    await userInstance.deleteOne();
    return true;
  }

  async updateConfirmation(id: string) {
    await this.dataSource.query(
      `
        UPDATE public."Users"
        SET  "isConfirmed" = true
        WHERE "id" = $1
        `,
      [id],
    );
    return true;
  }

  async updateConfirmCode(
    userId: string,
    confirmCode: string,
    expirationDate: Date,
  ) {
    await this.dataSource.query(
      `
        UPDATE public."Users"
        SET  "confirmationCode" = $1, 
             "codeExpirationDate" = $2
        WHERE "id" = $3
        `,
      [confirmCode, expirationDate, userId],
    );
    return true;
  }

  async updatePassword(
    newPasswordHash: string,
    userId: string,
  ): Promise<boolean> {
    await this.dataSource.query(
      `
        UPDATE public."Users"
        SET  "passwordHash" = $1, 
        WHERE "id" = $2
        `,
      [newPasswordHash, userId],
    );
    return true;
  }

  async updateBanStatus(
    user: UserDocument,
    banStatus: boolean,
    banReason: string | null,
    banDate: Date | null,
  ) {
    user.isBanned = banStatus;
    user.banDate = banDate;
    user.banReason = banReason;

    await user.save();
    return true;
  }

  async findUserById(id: string) {
    const user = await this.dataSource.query(
      `
    SELECT "id", "login", "email", "passwordHash", "createdAt", "confirmationCode", "codeExpirationDate", "isConfirmed", "isBanned", "banDate", "banReason"
    FROM public."Users"
    WHERE "id" = $1
    `,
      [id],
    );
    return user[0];
  }
}
