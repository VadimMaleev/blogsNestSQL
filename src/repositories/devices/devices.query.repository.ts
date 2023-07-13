import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceDocument } from './devices.schema';
import { Model } from 'mongoose';

@Injectable()
export class DevicesQueryRepository {
  constructor(
    @InjectModel(Device.name) private devicesModel: Model<DeviceDocument>,
  ) {}

  async findDevicesForUser(userId: string) {
    return this.devicesModel
      .find({ userId: userId }, { _id: 0, userId: 0 })
      .lean();
  }

  async findDeviceByDeviceAndUserIdAndDate(
    deviceId: string,
    userId: string,
    lastActiveDate: string,
  ) {
    return this.devicesModel.findOne({ userId, deviceId, lastActiveDate });
  }

  async findDeviceByDeviceId(deviceId: string) {
    return this.devicesModel.findOne({ deviceId });
  }
}
