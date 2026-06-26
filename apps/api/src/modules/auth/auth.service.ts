import { randomUUID } from 'node:crypto';

import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { prisma } from '@swift/db';
import type { RegisterDto, LoginDto } from '@swift/types';
import * as argon2 from 'argon2';

import { RedisService } from '../../redis/redis.service';

interface JwtPayload {
  sub: string;
  email: string;
  jti: string;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async register(dto: RegisterDto): Promise<{ tokens: Tokens; user: { id: string; email: string; name: string } }> {
    const existing = await prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      tokens,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }

  async login(dto: LoginDto): Promise<{ tokens: Tokens; user: { id: string; email: string; name: string } }> {
    const user = await prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const passwordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      tokens,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }

  // Профиль текущего пользователя. Читаем свежие данные из БД по id из токена,
  // выбираем только безопасные поля (passwordHash НЕ выбираем).
  async getMe(
    userId: string,
  ): Promise<{ id: string; email: string; name: string; avatarUrl: string | null }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, avatarUrl: true },
    });
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    return user;
  }

  async refresh(userId: string, jti: string, email: string): Promise<Tokens> {
    const exists = await this.redisService.refreshTokenExists(userId, jti);
    if (!exists) {
      await this.redisService.deleteAllUserTokens(userId);
      throw new UnauthorizedException('Refresh-токен недействителен');
    }

    await this.redisService.deleteRefreshToken(userId, jti);

    return this.generateTokens(userId, email);
  }

  async logout(userId: string, jti: string): Promise<void> {
    await this.redisService.deleteRefreshToken(userId, jti);
  }

  private async generateTokens(userId: string, email: string): Promise<Tokens> {
    const jti = randomUUID();

    const payload: JwtPayload = { sub: userId, email, jti };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env['JWT_ACCESS_SECRET'],
      expiresIn: 15 * 60,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env['JWT_REFRESH_SECRET'],
      expiresIn: 30 * 24 * 60 * 60,
    });

    const ttlSeconds = 30 * 24 * 60 * 60;
    await this.redisService.saveRefreshToken(userId, jti, ttlSeconds);

    return { accessToken, refreshToken };
  }
}
