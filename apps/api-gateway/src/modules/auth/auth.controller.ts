import { AppRmqClient, AUTH_RMQ_SERVICE } from '@/infrastructure/rmq-clients';
import { AccountReferralToken, AuthRefresh, AuthLogin, AuthLogout, AuthDeleteUser } from '@big-d/api-contracts';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Query,
  Res,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IpAddress } from '@shared/decorators/ip.decorator';
import { UserAgent } from '@shared/decorators/user-agent.decorator';
import { ValidateRpcResponse } from '@shared/rpc-response-validation';
import { CookieService } from '@shared/services/cookies';
import { Response } from 'express';
import { RegisterSage } from './application';
import { ACCESS_TOKEN_KEY } from './constants';
import { AuthErrorSkip, Public, REFRESH_TOKEN_KEY, RefreshToken, TokenPayload } from './decorators';
import { AccessTokenPayload } from './dto/access-token.dto';
import { LoginRequest } from './dto/login.dto';
import { LogoutResponse } from './dto/logout.dto';
import { ValidateReferralTokenQuery } from './dto/referral-token-validation.dto';
import { ReferralTokenRes } from './dto/referral-token.dto';
import { RefreshResponse } from './dto/refresh.dto';
import { RegisterRequest } from './dto/register.dto';
import { ExceptionUnauthorized } from './exceptions';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@ApiTags('Authorization')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_RMQ_SERVICE) private readonly authClient: AppRmqClient,
    private readonly cookieService: CookieService,
    private readonly registerSage: RegisterSage,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  @Public()
  @ApiOperation({
    summary: 'Регистрация пользователя',
    description: 'Устанавливает access-token и refresh-token в cookie (HttpOnly) strict',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Пользователь успешно зарегистрирован',
  })
  async register(
    @Body() { data }: RegisterRequest,
    @Res({ passthrough: true }) res: Response,
    @IpAddress() ip: string,
    @UserAgent() userAgent: string,
  ): Promise<void> {
    const { accessToken, refreshToken, maxAge } = await this.registerSage.execute({
      login: data.login,
      password: data.password,
      userAgent,
      ip,
    });

    this.cookieService.setRefreshTokenByKey(ACCESS_TOKEN_KEY, { token: accessToken, maxAge }, res);
    this.cookieService.setRefreshTokenByKey(REFRESH_TOKEN_KEY, { token: refreshToken, maxAge }, res);
  }

  @Post('refresh')
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
  @AuthErrorSkip()
  @UseGuards(RefreshTokenGuard)
  async refresh(
    @Res({ passthrough: true }) res: Response,
    @IpAddress() ip: string,
    @UserAgent() userAgent: string,
    @TokenPayload() accessTokenPayload?: AccessTokenPayload,
    @RefreshToken() refreshToken?: string,
  ): Promise<void> {
    if (accessTokenPayload == null) {
      throw new ExceptionUnauthorized({ message: 'Токен доступа отсутствует' });
    }

    if (refreshToken == null) {
      this.cookieService.dropTokens(res);
      throw new ExceptionUnauthorized({ message: 'Рефреш токен просрочен или не валидный' });
    }

    try {
      const { data } = await this.authClient.send<AuthRefresh.Response, AuthRefresh.Request>(AuthRefresh.pattern, {
        data: { ip, userAgent, refreshToken, sessionId: accessTokenPayload.sid, userId: accessTokenPayload.uid },
      });
      const { accessToken, maxAge } = data;
      this.cookieService.setRefreshTokenByKey(ACCESS_TOKEN_KEY, { token: accessToken, maxAge }, res);
    } catch {
      this.cookieService.dropTokens(res);
      throw new ExceptionUnauthorized({ message: 'Рефреш токен просрочен или не валидный' });
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
    @IpAddress() ip: string,
  ): Promise<LogoutResponse> {
    const { data } = await this.authClient.send<AuthLogout.Response, AuthLogout.Request>(AuthLogout.pattern, {
      data: { userAgent, userId: uid, ip },
    });

    this.cookieService.dropTokens(res);
    return { data: Boolean(data.status) };
  }

  @Post('login')
  @Public()
  @ApiOperation({
    summary: 'Вход пользователя в систему',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Вход совершен успешно',
  })
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() { data }: LoginRequest,
    @IpAddress() ip: string,
    @UserAgent() userAgent: string,
  ): Promise<void> {
    const {
      data: { refreshToken, accessToken, maxAge },
    } = await this.authClient.send<AuthLogin.Response, AuthLogin.Request>(AuthLogin.pattern, {
      data: { ip, userAgent, login: data.login, password: data.password },
    });

    this.cookieService.setRefreshTokenByKey(ACCESS_TOKEN_KEY, { token: accessToken, maxAge }, res);
    this.cookieService.setRefreshTokenByKey(REFRESH_TOKEN_KEY, { token: refreshToken, maxAge }, res);
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
  async generateReferralToken(@TokenPayload() token: AccessTokenPayload): Promise<ReferralTokenRes> {
    const { data } = await this.authClient.send<AccountReferralToken.Response, AccountReferralToken.Request>(
      AccountReferralToken.pattern,
      {
        data: token,
      },
    );

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
      await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnprocessableEntityException({ message: 'Токен просрочен или не валидный' });
    }

    return undefined;
  }

  @Delete('users')
  @ApiOperation({
    summary: 'Вход пользователя в систему',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Вход совершен успешно',
  })
  async delete(
    @IpAddress() ip: string,
    @UserAgent() userAgent: string,
    @TokenPayload() token: AccessTokenPayload,
  ): Promise<{ id: number }> {
    const data = await this.authClient.send<AuthDeleteUser.Response, AuthDeleteUser.Request>(AuthDeleteUser.pattern, {
      data: { ip, userAgent, id: token.uid },
    });

    return data.data;
  }
}
