import { RegisterSage } from '@/modules/auth/application';
import {
  ACCOUNT_SERVICE_RMQ_KEY,
  AccountLogin,
  AccountLogout,
  AccountRefresh,
} from '@big-d/api-contracts';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IpAddress } from '@shared/decorators/ip.decorator';
import { UserAgent } from '@shared/decorators/user-agent.decorator';
import { CookieService, RefreshToken } from '@shared/services/cookies';
import { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { ACCESS_TOKEN_KEY } from './constants';
import { Public, TokenPayload } from './decorators';
import { AccessTokenPayload } from './dto/access-token.dto';
import { LoginRequest, LoginResponse } from './dto/login.dto';
import { LogoutResponse } from './dto/logout.dto';
import { RefreshResponse } from './dto/refresh.dto';
import { RegisterRequest, RegisterResponse } from './dto/register.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@ApiTags('Account')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(ACCOUNT_SERVICE_RMQ_KEY) private readonly accountClient: ClientProxy,
    private readonly cookieService: CookieService,
    private readonly registerSage: RegisterSage,
  ) {}

  @Post('register')
  @Public()
  @ApiOperation({
    summary: 'Регистрация пользователя',
    description:
      'Возвращает access-token в теле и устанавливает refresh-token в cookie (HttpOnly) strict',
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
    const { accessToken, refreshToken } = await this.registerSage.execute({
      login: data.login,
      password: data.password,
      userAgent,
      ip,
    });

    this.cookieService.setRefreshToken(res, refreshToken);
    return { data: { token: accessToken } };
  }

  @Post('refresh')
  @Public()
  @ApiOperation({
    summary: 'Обновление токена пользователя',
    description: 'Возвращает access-token в теле и устанавливает refresh-token в cookie (HttpOnly)',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Токен успешно продлен',
    type: RefreshResponse,
  })
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @UseGuards(RefreshTokenGuard)
  async refresh(
    @Res({ passthrough: true }) res: Response,
    @IpAddress() ip: string,
    @UserAgent() userAgent: string,
    @RefreshToken() refreshToken: string,
  ) {
    try {
      const { data } = await firstValueFrom(
        this.accountClient.send<AccountRefresh.Response, AccountRefresh.Request>(
          AccountRefresh.pattern,
          { data: { ip, userAgent, refreshToken } },
        ),
      );
      this.cookieService.setRefreshToken(res, data.refreshToken);
      return { data: { token: data.accessToken } };
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
    status: HttpStatus.NO_CONTENT,
    description: 'Выход совершен успешно',
    type: LogoutResponse,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  async logout(
    @Res({ passthrough: true }) res: Response,
    @TokenPayload() { uid }: AccessTokenPayload,
    @UserAgent() userAgent: string,
  ): Promise<LogoutResponse> {
    this.cookieService.setRefreshToken(res, undefined);

    const { data } = await firstValueFrom(
      this.accountClient.send<AccountLogout.Response, AccountLogout.Request>(
        AccountLogout.pattern,
        { data: { userAgent, userId: uid } },
      ),
    );

    return { data: Boolean(data.stats) };
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
    const {
      data: { refreshToken, accessToken },
    } = await firstValueFrom(
      this.accountClient.send<AccountLogin.Response, AccountLogin.Request>(AccountLogin.pattern, {
        data: { ip, userAgent, login: data.login, password: data.password },
      }),
    );

    this.cookieService.setRefreshToken(res, refreshToken);
    return { data: { token: accessToken } };
  }
}
