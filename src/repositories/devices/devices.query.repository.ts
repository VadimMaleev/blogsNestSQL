import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceDocument } from './devices.schema';
import { Model } from 'mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DevicesQueryRepository {
  constructor(
    @InjectModel(Device.name) private devicesModel: Model<DeviceDocument>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async findDevicesForUser(userId: string) {
    return this.dataSource.query(
      `
        SELECT "ip", "title", "lastActiveDate", "deviceId"
        FROM public."Devices"
        WHERE "userId" = $1
      `,
      [userId],
    );
  }

  async findDeviceByDeviceIdAndUserIdAndDate(
    deviceId: string,
    userId: string,
    lastActiveDate: string,
  ) {
    const device = await this.dataSource.query(
      `
        SELECT "deviceId", "ip", "title", "lastActiveDate", "userId"
        FROM public."Devices"
        WHERE "deviceId" = $1 AND "userId" = $2 AND "lastActiveDate" = $3
      `,
      [deviceId, userId, lastActiveDate],
    );
    return device[0];
  }

  async findDeviceByDeviceId(deviceId: string) {
    const device = await this.dataSource.query(
      `
        SELECT "deviceId", "ip", "title", "lastActiveDate", "userId"
        FROM public."Devices"
        WHERE "deviceId" = $1
      `,
      [deviceId],
    );
    return device[0];
  }
}
