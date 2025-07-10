import { ACCESS_TOKEN_KEY } from '@/modules/auth';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { MeRes } from '@/modules/users/me.dto';
import { ACCOUNT_SERVICE_RMQ_KEY, AccountGetMe } from '@big-d/api-contracts';
import { ValidateRpcResponse } from '@big-d/api-utils';
import { Controller, Get, HttpStatus, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';

/* TODO:
     При удалении юзера не забыть удалить IN BOX
  */
@ApiTags('Account')
@Controller('users')
export class UsersController {
  constructor(@Inject(ACCOUNT_SERVICE_RMQ_KEY) private readonly accountClient: ClientProxy) {}

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
  async me(@TokenPayload() { uid }: AccessTokenPayload): Promise<AccountGetMe.Response> {
    return await firstValueFrom(
      this.accountClient.send<AccountGetMe.Response, AccountGetMe.Request>(AccountGetMe.pattern, {
        data: { id: uid },
      }),
    );
  }
}
