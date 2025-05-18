import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterRequest, RegisterResponse } from './dto/register.dto';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { APP_ENV } from '@shared/configs';
import { Public } from './decorators';
import { IpAddress } from '@shared/decorators/ip.decorator';
import { UserAgent } from '@shared/decorators/user-agent.decorator';
import { CookieService, REFRESH_TOKEN_FIELD } from '@shared/services/cookies.service';
import { RefreshResponse } from '@/auth/dto/refresh.dto';

@ApiTags('Auth.')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly cookieService: CookieService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService<APP_ENV>,
  ) {}
  /* TODO:
   *   [x] короткий токен отдаем на клиент в ответе
   *   [x] соль пока хранится в переменной окружения
   *   [] рефреш отдаем в cookie
   *   [] рефреш токен храним в базе
   *   [] на каждую регистрацию создаем новую пару токенов
   *   [] кроном удаляем каждый день просроченые
   *   [] гвард на приватные роуты (проверка по access-token) клиент сам осуществляет рефреш
   * */
  @Post('register')
  @Public()
  @ApiOperation({
    summary: 'Регистрация пользователя',
    description:
      'Возвращает access-token в теле и устанавливает refresh-token в cookie (HttpOnly)',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Пользователь успешно зарегистрирован',
    type: RegisterResponse,
  })
  async register(
    @Body() body: RegisterRequest,
    @Res({ passthrough: true }) res: Response,
    @IpAddress() ip: string,
    @UserAgent() userAgent: string,
  ): Promise<RegisterResponse> {
    const { accessToken, sessionToken } = await this.authService.register({
      ...body,
      ip,
      userAgent,
    });

    this.cookieService.setRefreshToken(res, sessionToken);
    return { data: { token: accessToken } };
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Обновление токена пользователя',
    description:
      'Возвращает access-token в теле и устанавливает refresh-token в cookie (HttpOnly)',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Токен успешно продлен',
    type: RefreshResponse,
  })
  @Public()
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @IpAddress() ip: string,
    @UserAgent() userAgent: string,
  ) {
    const refreshToken = req.cookies[REFRESH_TOKEN_FIELD];

    const { accessToken, sessionToken } = await this.authService.refreshToken({
      ip,
      userAgent,
      sessionToken: refreshToken,
    });

    this.cookieService.setRefreshToken(res, sessionToken);
    return { data: { token: accessToken } };
  }
}
