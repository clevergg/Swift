import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  RegisterSchema,
  LoginSchema,
  type RegisterDto,
  type LoginDto,
  type AuthResponse,
} from '@swift/types';
import type { Response } from 'express';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshJwtGuard } from './guards/refresh-jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

const REFRESH_COOKIE = 'refresh_token';
const SESSION_FLAG_COOKIE = 'has_session';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  async register(
    @Body(new ZodValidationPipe(RegisterSchema)) dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const { tokens, user } = await this.authService.register(dto);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken, user };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход по email и паролю' })
  async login(
    @Body(new ZodValidationPipe(LoginSchema)) dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const { tokens, user } = await this.authService.login(dto);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken, user };
  }
  // Текущий пользователь по access-токену. Защищён JwtAuthGuard:
  // токен в заголовке Authorization: Bearer <access>. Используется фронтом
  // для восстановления сессии (узнать, кто залогинен).
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Текущий авторизованный пользователь' })
  async me(
    @CurrentUser() user: { id: string },
  ): Promise<{ id: string; email: string; name: string; avatarUrl: string | null }> {
    return this.authService.getMe(user.id);
  }

  @Post('refresh')
  @UseGuards(RefreshJwtGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Обновить access-токен по refresh' })
  async refresh(
    @CurrentUser() user: { id: string; email: string; jti: string },
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const tokens = await this.authService.refresh(user.id, user.jti, user.email);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  @UseGuards(RefreshJwtGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Выход (отзыв refresh-токена)' })
  async logout(
    @CurrentUser() user: { id: string; email: string; jti: string },
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: boolean }> {
    await this.authService.logout(user.id, user.jti);
    res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
    res.clearCookie(SESSION_FLAG_COOKIE, { path: '/' });
    return { success: true };
  }

  private setRefreshCookie(res: Response, refreshToken: string): void {
    const maxAge = 30 * 24 * 60 * 60 * 1000;
    const isProd = process.env['NODE_ENV'] === 'production';
 
    res.cookie(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge,
      path: '/api/auth',
    });
 
    res.cookie(SESSION_FLAG_COOKIE, '1', {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge,
      path: '/',
    });
  }
}
