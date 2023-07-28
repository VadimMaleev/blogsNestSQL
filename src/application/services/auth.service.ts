import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { CreateDeviceDto } from '../../types/dto';
import { JWTService } from '../../repositories/jwt/jwt.service';
import { DevicesRepository } from '../../repositories/devices/devices.repository';
import { DevicesQueryRepository } from '../../repositories/devices/devices.query.repository';
import { JwtRepository } from '../../repositories/jwt/jwt.repository';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    protected jwtService: JWTService,
    protected devicesRepository: DevicesRepository,
    protected devicesQueryRepository: DevicesQueryRepository,
    protected jwtRepository: JwtRepository,
  ) {}

  async generateHash(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async createToken(userId: string) {
    return this.jwtService.createJWT(userId);
  }

  async createRefreshToken(userId: string, ip: string, deviceName: string) {
    const deviceId = uuidv4();
    const refreshToken = await this.jwtService.createRefreshJWT(
      userId,
      deviceId,
    );
    const lastActiveDate =
      this.jwtService.getLastActiveDateFromRefreshToken(refreshToken);

    const device = new CreateDeviceDto(
      ip,
      deviceName,
      lastActiveDate,
      deviceId,
      userId,
    );
    await this.devicesRepository.createDevice(device);
    return refreshToken;
  }

  async refreshToken(userId: string, oldRefreshToken: string) {
    const jwtPayload = await this.jwtService.extractPayloadFromToken(
      oldRefreshToken,
    );
    const deviceId = jwtPayload.deviceId;
    const lastActiveDate = new Date(jwtPayload.iat * 1000).toISOString();
    const device =
      await this.devicesQueryRepository.findDeviceByDeviceIdAndUserIdAndDate(
        deviceId,
        userId,
        lastActiveDate,
      );
    if (!device) return null;
    const refreshToken = await this.jwtService.createRefreshJWT(
      userId,
      deviceId,
    );
    const newLastActiveDate =
      this.jwtService.getLastActiveDateFromRefreshToken(refreshToken);
    const isDateUpdated =
      await this.devicesRepository.updateLastActiveDateByDeviceAndUserId(
        deviceId,
        userId,
        newLastActiveDate,
      );
    if (!isDateUpdated) return null;
    await this.jwtRepository.expireRefreshToken(oldRefreshToken);
    return refreshToken;
  }
}
