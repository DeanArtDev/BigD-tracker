import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterRequest, RegisterResponse } from './dto/register.dto';
import { Request, Response } from 'express';
import { IpAddress } from '@shared/decorators/ip.decorator';
import { UserAgent } from '@shared/decorators/user-agent.decorator';
import { CookieService, REFRESH_TOKEN_FIELD } from '@shared/services/cookies.service';
import { Public, TokenPayload } from './decorators';
import { RefreshResponse } from './dto/refresh.dto';
import { LogoutResponse } from './dto/logout.dto';
import { LoginRequest, LoginResponse } from './dto/login.dto';
import { AccessTokenPayload } from './dto/access-token.dto';
import { ACCESS_TOKEN_KEY } from './lib';

@ApiTags('Auth.')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly cookieService: CookieService,
    private readonly authService: AuthService,
  ) {}
  /* TODO:
   *   [] кроном удаляем каждый день просроченные
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
    @Body() { data }: RegisterRequest,
    @Res({ passthrough: true }) res: Response,
    @IpAddress() ip: string,
    @UserAgent() userAgent: string,
  ): Promise<RegisterResponse> {
    const { accessToken, sessionToken } = await this.authService.register({
      ...data,
      ip,
      userAgent,
    });

    this.cookieService.setRefreshToken(res, sessionToken);
    return { data: { token: accessToken } };
  }

  @Post('refresh')
  @Public()
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
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @IpAddress() ip: string,
    @UserAgent() userAgent: string,
  ) {
    const refreshToken = req.cookies[REFRESH_TOKEN_FIELD];

    try {
      const { accessToken, sessionToken } = await this.authService.refreshToken({
        ip,
        userAgent,
        sessionToken: refreshToken,
      });
      this.cookieService.setRefreshToken(res, sessionToken);
      return { data: { token: accessToken } };
    } catch (e) {
      this.cookieService.setRefreshToken(res, undefined);
      throw e;
    }
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Выход пользователя из системы',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Выход совершен успешно',
    type: LogoutResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async logout(
    @Res({ passthrough: true }) res: Response,
    @TokenPayload() tokenPayload: AccessTokenPayload,
  ): Promise<LogoutResponse> {
    this.cookieService.setRefreshToken(res, undefined);

    const isLogout = await this.authService.logout({
      userId: tokenPayload.uid,
      sessionUuid: tokenPayload.sid,
    });

    if (!isLogout) {
      throw new InternalServerErrorException('Failed to logout, try again later');
    }

    return { data: true };
  }

  @Post('login')
  @Public()
  @ApiOperation({
    summary: 'Вход пользователя в систему',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Вход совершен успешно',
    type: LoginResponse,
  })
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() { data }: LoginRequest,
    @IpAddress() ip: string,
    @UserAgent() userAgent: string,
  ): Promise<LoginResponse> {
    const user = await this.authService.checkUserAuth({
      email: data.login,
      password: data.password,
    });

    const { accessToken, session } = await this.authService.createSession({
      userId: user.id,
      ip,
      userAgent,
    });

    this.cookieService.setRefreshToken(res, session.token);
    return { data: { token: accessToken } };
  }
}
