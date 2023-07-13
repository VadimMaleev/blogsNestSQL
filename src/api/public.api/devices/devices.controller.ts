import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { DevicesQueryRepository } from '../../../repositories/devices/devices.query.repository';
import { DevicesService } from './devices.service';
import { JwtRefreshAuthGuard } from '../../../guards/jwt.refresh.auth.guard';

@Controller('security')
export class DevicesController {
  constructor(
    protected devicesQueryRepository: DevicesQueryRepository,
    protected devicesService: DevicesService,
  ) {}

  @Get('devices')
  @UseGuards(JwtRefreshAuthGuard)
  async findDevicesForUser(@Request() req) {
    return await this.devicesQueryRepository.findDevicesForUser(req.user.id);
  }

  @Delete('devices')
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(204)
  async deleteAllDevices(@Request() req) {
    const refreshToken = req.cookies.refreshToken;
    const isDeleted = await this.devicesService.deleteAllDevicesExceptCurrent(
      req.user.id,
      refreshToken,
    );
    if (!isDeleted) throw new UnauthorizedException();
    return isDeleted;
  }

  @Delete('devices/:id')
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(204)
  async deleteDevice(@Request() req, @Param('id') id: string) {
    return await this.devicesService.deleteDeviceById(req.user.id, id);
  }
}
