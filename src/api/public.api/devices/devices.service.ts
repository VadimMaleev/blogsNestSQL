import { JWTService } from '../../../repositories/jwt/jwt.service';
import { DevicesRepository } from '../../../repositories/devices/devices.repository';
import { DevicesQueryRepository } from '../../../repositories/devices/devices.query.repository';
import { HttpException, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class DevicesService {
  constructor(
    protected jwtService: JWTService,
    protected devicesRepository: DevicesRepository,
    protected devicesQueryRepository: DevicesQueryRepository,
  ) {}

  async deleteAllDevicesExceptCurrent(userId: string, oldRefreshToken: string) {
    const jwtPayload = await this.jwtService.extractPayloadFromToken(
      oldRefreshToken,
    );
    const deviceId = jwtPayload.deviceId;
    const lastActiveDate = new Date(jwtPayload.iat * 1000).toISOString();
    const device =
      await this.devicesQueryRepository.findDeviceByDeviceAndUserIdAndDate(
        deviceId,
        userId,
        lastActiveDate,
      );
    if (!device) return false;
    return this.devicesRepository.deleteAllDevicesExceptCurrent(
      userId,
      deviceId,
    );
  }

  async deleteDeviceById(userId: string, deviceId: string): Promise<boolean> {
    const device = await this.devicesQueryRepository.findDeviceByDeviceId(
      deviceId,
    );
    if (!device) throw new NotFoundException();
    if (device.userId !== userId) throw new HttpException('Not your own', 403);
    const isDeleted = await this.devicesRepository.deleteDevice(device);
    if (!isDeleted) throw new NotFoundException();
    return true;
  }
}
