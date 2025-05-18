import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterRequest, RegisterResponse } from './dto/register.dto';
import { Request, Response } from 'express';
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
  ) {}
  /* TODO:
   *   [] кроном удаляем каждый день просроченые
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
