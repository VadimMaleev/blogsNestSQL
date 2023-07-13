import { Injectable } from '@nestjs/common';
import { UserDocument } from '../users/users.schema';
import jwt from 'jsonwebtoken';
import { settings } from '../../settings/settings';

@Injectable()
export class JWTService {
  async createJWT(user: UserDocument) {
    return jwt.sign({ userId: user.id }, settings.JWT_SECRET, {
      expiresIn: '10m',
    });
  }

  async createRefreshJWT(user: UserDocument, deviceId: string) {
    return jwt.sign(
      { userId: user.id, deviceId: deviceId },
      settings.JWT_SECRET,
      { expiresIn: '20m' },
    );
  }

  async extractUserIdFromToken(token: string): Promise<string | null> {
    try {
      const result: any = jwt.verify(token, settings.JWT_SECRET);
      return result.userId;
    } catch (error) {
      return null;
    }
  }

  getLastActiveDateFromRefreshToken(refreshToken: string): string {
    const payload: any = jwt.decode(refreshToken);
    return new Date(payload.iat * 1000).toISOString();
  }

  async extractPayloadFromToken(token: string) {
    try {
      return jwt.verify(token, settings.JWT_SECRET);
    } catch (error) {
      return null;
    }
  }
}
