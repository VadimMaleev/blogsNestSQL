import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersQueryRepository } from '../repositories/users/users.query.repo';
import { JWTService } from '../repositories/jwt/jwt.service';
import { Request } from 'express';
import { JwtRepository } from '../repositories/jwt/jwt.repository';

@Injectable()
export class JwtRefreshAuthGuard implements CanActivate {
  constructor(
    protected usersQueryRepository: UsersQueryRepository,
    protected jwtService: JWTService,
    protected jwtRepository: JwtRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    const refreshTokenFromCookie = req.cookies.refreshToken;
    if (!refreshTokenFromCookie) throw new UnauthorizedException();

    const payload = await this.jwtService.extractPayloadFromToken(
      refreshTokenFromCookie,
    );
    if (!payload) throw new UnauthorizedException();
    const refreshTokenIsBlack = await this.jwtRepository.findAllExpiredTokens(
      refreshTokenFromCookie,
    );
    if (refreshTokenIsBlack) throw new UnauthorizedException();
    const user = await this.usersQueryRepository.findUserById(payload.userId);
    if (!user) throw new UnauthorizedException();
    req.user = user;
    return true;
  }
}
