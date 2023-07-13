import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './users.schema';
import { CreateUserDto } from '../../types/dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(newUser: CreateUserDto) {
    await new this.userModel(newUser).save();
  }

  async deleteUser(id: string): Promise<boolean> {
    const userInstance = await this.userModel.findOne({ id: id });
    if (!userInstance) return false;
    await userInstance.deleteOne();
    return true;
  }

  async updateConfirmation(id: string) {
    const confirmationInstance: UserDocument = await this.userModel.findOne({
      id: id,
    });
    if (!confirmationInstance) return false;
    confirmationInstance.isConfirmed = true;

    await confirmationInstance.save();
    return true;
  }

  async updateConfirmCode(
    userId: string,
    confirmCode: string,
    expirationDate: Date,
  ) {
    const confirmationInstance: UserDocument = await this.userModel.findOne({
      id: userId,
    });
    if (!confirmationInstance) return null;

    confirmationInstance.updateConfirmationCode(confirmCode, expirationDate);
    await confirmationInstance.save();
    return true;
  }

  async updatePassword(
    newPasswordHash: string,
    userId: string,
  ): Promise<boolean> {
    const userInstance: UserDocument = await this.userModel.findOne({
      id: userId,
    });
    if (!userInstance) return false;

    userInstance.updatePasswordHash(newPasswordHash);
    await userInstance.save();
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
}
