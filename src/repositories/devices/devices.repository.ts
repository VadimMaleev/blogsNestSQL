import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceDocument } from './devices.schema';
import { Model } from 'mongoose';
import { CreateDeviceDto } from '../../types/dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectModel(Device.name) private devicesModel: Model<DeviceDocument>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async createDevice(device: CreateDeviceDto) {
    await this.dataSource.query(
      `
        INSERT INTO public."Devices"(
        "deviceId", "ip", "title", "lastActiveDate", "userId")
        VALUES ($1, $2, $3, $4, $5)
      `,
      [
        device.deviceId,
        device.ip,
        device.title,
        device.lastActiveDate,
        device.userId,
      ],
    );
  }

  async updateLastActiveDateByDeviceAndUserId(
    deviceId: string,
    userId: string,
    newLastActiveDate: string,
  ): Promise<boolean> {
    await this.dataSource.query(
      `
        UPDATE public."Devices"
        SET "lastActiveDate"= $1
        WHERE "deviceId" = $2 AND "userId" = $3
      `,
      [newLastActiveDate, deviceId, userId],
    );
    return true;
  }

  async findAndDeleteDeviceByDeviceIdAndUserIdAndDate(
    userId: string,
    deviceId: string,
    lastActiveDate: string,
  ): Promise<boolean> {
    await this.dataSource.query(
      `
        DELETE FROM public."Devices"
        WHERE "deviceId" = $1 AND "userId" = $2 AND "lastActiveDate" = $3
    `,
      [deviceId, userId, lastActiveDate],
    );
    return true;
  }

  async deleteAllDevicesExceptCurrent(
    userId: string,
    deviceId: string,
  ): Promise<boolean> {
    await this.dataSource.query(
      `
        DELETE FROM public."Devices"
        WHERE "userId" = $1 AND "deviceId" != $2
      `,
      [userId, deviceId],
    );
    return true;
  }

  async deleteDevice(deviceId: string): Promise<boolean> {
    await this.dataSource.query(
      `
        DELETE FROM public."Devices"
        WHERE "deviceId" = $1
      `,
      [deviceId],
    );
    return true;
  }

  async deleteDevicesForBannedUser(userId: string) {
    await this.dataSource.query(
      `
        DELETE FROM public."Devices"
        WHERE "userId" = $1
      `,
      [userId],
    );
    return true;
  }
}
