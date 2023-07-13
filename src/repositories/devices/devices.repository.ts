import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceDocument } from './devices.schema';
import { Model } from 'mongoose';
import { CreateDeviceDto } from '../../types/dto';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectModel(Device.name) private devicesModel: Model<DeviceDocument>,
  ) {}

  async createDevice(device: CreateDeviceDto) {
    await new this.devicesModel(device).save();
  }

  async updateLastActiveDateByDeviceAndUserId(
    deviceId: string,
    userId: string,
    newLastActiveDate: string,
  ): Promise<boolean> {
    try {
      await this.devicesModel.findOneAndUpdate(
        { deviceId: deviceId, userId },
        { $set: { lastActiveDate: newLastActiveDate } },
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  async findAndDeleteDeviceByDeviceAndUserIdAndDate(
    userId: string,
    deviceId: string,
    lastActiveDate: string,
  ): Promise<boolean> {
    const deviceInstance = this.devicesModel.findOne({
      userId,
      deviceId,
      lastActiveDate,
    });
    if (!deviceInstance) return false;
    await deviceInstance.deleteOne();
    return true;
  }

  async deleteAllDevicesExceptCurrent(
    userId: string,
    deviceId: string,
  ): Promise<boolean> {
    try {
      await this.devicesModel.deleteMany({
        userId,
        deviceId: { $ne: deviceId },
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  async deleteDevice(device: Device): Promise<boolean> {
    try {
      await this.devicesModel.deleteOne(device);
      return true;
    } catch (e) {
      return false;
    }
  }

  async deleteDevicesForBannedUser(userId: string) {
    await this.devicesModel.deleteMany({ userId: userId });
    return true;
  }
}
