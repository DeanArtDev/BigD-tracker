import { AUTH_RMQ_SERVICE, AppRmqClient } from '@/infrastructure/rmq-clients';
import { ACCESS_TOKEN_KEY } from '@/modules/auth';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { ExceptionUnauthorized } from '@/modules/auth/exceptions';
import { MeRes } from '@/modules/users/me.dto';
import { AuthGetMe } from '@big-d/api-contracts';
import { Controller, Get, HttpStatus, Inject } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ValidateRpcResponse } from '@shared/rpc-response-validation';

@ApiTags('Account')
@Controller('users')
export class UsersController {
  constructor(@Inject(AUTH_RMQ_SERVICE) private readonly accountClient: AppRmqClient) {}

  @Get('me')
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @ApiOperation({
    summary: 'Получение общих данных о вошедшем в систему пользователе',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: MeRes,
  })
  @ValidateRpcResponse(MeRes)
  async me(@TokenPayload() { uid }: AccessTokenPayload): Promise<AuthGetMe.Response> {
    try {
      return await this.accountClient.send<AuthGetMe.Response, AuthGetMe.Request>(AuthGetMe.pattern, {
        data: { id: uid },
      });
    } catch {
      throw new ExceptionUnauthorized({ message: 'Пользователь не авторизован' });
    }
  }
}
