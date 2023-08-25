import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JWTService } from '../repositories/jwt/jwt.service';
import { UsersRepository } from '../repositories/users/users.repo';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    protected usersRepository: UsersRepository,
    protected jwtService: JWTService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    if (!req.headers.authorization) throw new UnauthorizedException();

    const token = req.headers.authorization.split(' ')[1];
    const userId = await this.jwtService.extractUserIdFromToken(token);
    if (!userId) throw new UnauthorizedException();

    const user = await this.usersRepository.findUserById(userId);
    if (!user) throw new UnauthorizedException();
    req.user = user;
    return true;
  }
}
