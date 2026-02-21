import { ACCOUNT_RMQ_SERVICE, AppRmqClient } from '@/infrastructure/rmq-clients';
import { RegisterSage } from '@/modules/auth/application';
import { ValidateReferralTokenQuery } from '@/modules/auth/dto/referral-token-validation.dto';
import { ReferralTokenRes } from '@/modules/auth/dto/referral-token.dto';
import {
  AccountLogin,
  AccountLogout,
  AccountReferralToken,
  AccountRefresh,
} from '@big-d/api-contracts';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Query,
  Req,
  Res,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IpAddress } from '@shared/decorators/ip.decorator';
import { UserAgent } from '@shared/decorators/user-agent.decorator';
import { ValidateRpcResponse } from '@shared/rpc-response-validation';
import { CookieService, RefreshToken } from '@shared/services/cookies';
import { Request, Response } from 'express';
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
    @Inject(ACCOUNT_RMQ_SERVICE) private readonly accountClient: AppRmqClient,
    private readonly cookieService: CookieService,
    private readonly registerSage: RegisterSage,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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
    const { accessToken, refreshToken, maxAge } = await this.registerSage.execute({
      login: data.login,
      password: data.password,
      userAgent,
      ip,
    });

    this.cookieService.setRefreshToken(res, { token: refreshToken, maxAge });
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
  @ValidateRpcResponse(RefreshResponse)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @IpAddress() ip: string,
    @UserAgent() userAgent: string,
    @RefreshToken() refreshToken: string,
  ) {
    try {
      const { data } = await this.accountClient.send<
        AccountRefresh.Response,
        AccountRefresh.Request
      >(AccountRefresh.pattern, { data: { ip, userAgent, refreshToken } });
      this.cookieService.setRefreshToken(res, { token: data.refreshToken, maxAge: data.maxAge });
      return { data: { token: data.accessToken } };
    } catch (e) {
      this.cookieService.setRefreshToken(res, { token: undefined });
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
  @ValidateRpcResponse(LogoutResponse)
  async logout(
    @Res({ passthrough: true }) res: Response,
    @TokenPayload() { uid }: AccessTokenPayload,
    @UserAgent() userAgent: string,
  ): Promise<LogoutResponse> {
    this.cookieService.setRefreshToken(res, { token: undefined });

    const { data } = await this.accountClient.send<AccountLogout.Response, AccountLogout.Request>(
      AccountLogout.pattern,
      { data: { userAgent, userId: uid } },
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
  @ValidateRpcResponse(LoginResponse)
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() { data }: LoginRequest,
    @IpAddress() ip: string,
    @UserAgent() userAgent: string,
  ): Promise<LoginResponse> {
    const {
      data: { refreshToken, accessToken, maxAge },
    } = await this.accountClient.send<AccountLogin.Response, AccountLogin.Request>(
      AccountLogin.pattern,
      {
        data: { ip, userAgent, login: data.login, password: data.password },
      },
    );

    this.cookieService.setRefreshToken(res, { token: refreshToken, maxAge });
    return { data: { token: accessToken } };
  }

  @Post('/referral-token')
  @ApiOperation({
    summary: 'Генерация реферального токена',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: ReferralTokenRes,
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @ValidateRpcResponse(ReferralTokenRes)
  async generateReferralToken(
    @TokenPayload() token: AccessTokenPayload,
  ): Promise<ReferralTokenRes> {
    const { data } = await this.accountClient.send<
      AccountReferralToken.Response,
      AccountReferralToken.Request
    >(AccountReferralToken.pattern, {
      data: token,
    });

    return { data: { token: data.referralToken } };
  }

  @Get('/referral-token/validate')
  @ApiOperation({
    summary: 'Валидация реферального токена',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ReferralTokenRes,
  })
  @Public()
  async validateReferralToken(@Query() { token }: ValidateReferralTokenQuery): Promise<void> {
    try {
      await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('AUTH_SECRET_KEY'),
      });
    } catch {
      throw new UnprocessableEntityException({ message: 'Токен просрочен или не валидный' });
    }

    return undefined;
  }
}
