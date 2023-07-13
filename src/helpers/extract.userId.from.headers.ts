import { JWTService } from '../repositories/jwt/jwt.service';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ExtractUserIdFromHeadersUseCase {
  constructor(protected jwtService: JWTService) {}
  async execute(req: Request) {
    const splited = req.headers.authorization?.split(' ');
    if (req.headers.authorization && splited?.length === 2) {
      return await this.jwtService.extractUserIdFromToken(splited[1]);
    }
    return null;
  }
}
