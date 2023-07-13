import { JWTService } from '../../repositories/jwt/jwt.service';
import { JwtRepository } from '../../repositories/jwt/jwt.repository';
import { DevicesRepository } from '../../repositories/devices/devices.repository';
import { CommandHandler } from '@nestjs/cqrs';

export class LogoutCommand {
  constructor(public userId: string, public oldRefreshToken: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase {
  constructor(
    protected jwtService: JWTService,
    protected devicesRepository: DevicesRepository,

    protected jwtRepository: JwtRepository,
  ) {}

  async execute(command: LogoutCommand) {
    const jwtPayload = await this.jwtService.extractPayloadFromToken(
      command.oldRefreshToken,
    );
    const deviceId = jwtPayload.deviceId;
    const lastActiveDate = new Date(jwtPayload.iat * 1000).toISOString();
    await this.jwtRepository.expireRefreshToken(command.oldRefreshToken);
    return this.devicesRepository.findAndDeleteDeviceByDeviceAndUserIdAndDate(
      command.userId,
      deviceId,
      lastActiveDate,
    );
  }
}
