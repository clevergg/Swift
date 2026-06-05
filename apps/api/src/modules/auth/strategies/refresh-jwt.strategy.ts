import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface RefreshPayload {
  sub: string;
  email: string;
  jti: string;
}

const cookieExtractor = (req: Request): string | null => {
  const cookies = req.cookies as Record<string, string> | undefined;
  return cookies?.['refresh_token'] ?? null;
};

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: process.env['JWT_REFRESH_SECRET'] ?? '',
    });
  }

  async validate(payload: RefreshPayload): Promise<{ id: string; email: string; jti: string }> {
    if (!payload.jti) {
      throw new UnauthorizedException('Некорректный refresh-токен');
    }
    return { id: payload.sub, email: payload.email, jti: payload.jti };
  }
}
