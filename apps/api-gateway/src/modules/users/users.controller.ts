import { AppRmqClient, AUTH_RMQ_SERVICE } from '@/infrastructure/rmq-clients';
import { ACCESS_TOKEN_KEY } from '@/modules/auth';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { MeRes } from '@/modules/users/me.dto';
import { AuthGetMe } from '@big-d/api-contracts';
import { Controller, Get, HttpStatus, Inject } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ValidateRpcResponse } from '@shared/rpc-response-validation';

@ApiTags('Authorization')
@Controller('users')
export class UsersController {
  constructor(@Inject(AUTH_RMQ_SERVICE) private readonly authClient: AppRmqClient) {}

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
    return await this.authClient.send<AuthGetMe.Response, AuthGetMe.Request>(AuthGetMe.pattern, {
      data: { id: uid },
    });
  }
}
