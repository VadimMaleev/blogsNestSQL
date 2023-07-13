import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { CreateDeviceDto } from '../../types/dto';
import { UserDocument } from '../../repositories/users/users.schema';
import { JWTService } from '../../repositories/jwt/jwt.service';
import { randomUUID } from 'crypto';
import { DevicesRepository } from '../../repositories/devices/devices.repository';
import { DevicesQueryRepository } from '../../repositories/devices/devices.query.repository';
import { JwtRepository } from '../../repositories/jwt/jwt.repository';

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

  async createToken(user: UserDocument) {
    return this.jwtService.createJWT(user);
  }

  async createRefreshToken(user: UserDocument, ip: string, deviceName: string) {
    const deviceId = randomUUID();
    const refreshToken = await this.jwtService.createRefreshJWT(user, deviceId);
    const lastActiveDate =
      this.jwtService.getLastActiveDateFromRefreshToken(refreshToken);

    const device = new CreateDeviceDto(
      ip,
      deviceName,
      lastActiveDate,
      deviceId,
      user.id,
    );
    await this.devicesRepository.createDevice(device);
    return refreshToken;
  }

  async refreshToken(user: UserDocument, oldRefreshToken: string) {
    const jwtPayload = await this.jwtService.extractPayloadFromToken(
      oldRefreshToken,
    );
    const userId = user.id;
    const deviceId = jwtPayload.deviceId;
    const lastActiveDate = new Date(jwtPayload.iat * 1000).toISOString();
    const device =
      await this.devicesQueryRepository.findDeviceByDeviceAndUserIdAndDate(
        deviceId,
        userId,
        lastActiveDate,
      );
    if (!device) return null;
    const refreshToken = await this.jwtService.createRefreshJWT(user, deviceId);
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
