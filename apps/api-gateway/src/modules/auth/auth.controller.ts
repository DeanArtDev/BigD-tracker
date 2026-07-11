import { AppRmqClient, AUTH_RMQ_SERVICE } from '@/infrastructure/rmq-clients';
import { AccountReferralToken, AuthDeleteUser, AuthLogout } from '@big-d/api-contracts';
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
import { Public, REFRESH_TOKEN_KEY, TokenPayload } from './decorators';
import { AccessTokenPayload } from './dto/access-token.dto';
import { LogoutResponse } from './dto/logout.dto';
import { ValidateReferralTokenQuery } from './dto/referral-token-validation.dto';
import { ReferralTokenRes } from './dto/referral-token.dto';
import { RegisterRequest } from './dto/register.dto';

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
