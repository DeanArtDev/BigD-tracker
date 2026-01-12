import { AccountServiceClientProxy } from '@/infrastructure/rmq-clients';
import { ACCESS_TOKEN_KEY } from '@/modules/auth';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { MeRes } from '@/modules/users/me.dto';
import { AccountGetMe } from '@big-d/api-contracts';
import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ValidateRpcResponse } from '@shared/rpc-response-validation';

/* TODO:
     При удалении юзера не забыть удалить IN BOX
  */
@ApiTags('Account')
@Controller('users')
export class UsersController {
  constructor(private readonly accountClient: AccountServiceClientProxy) {}

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
    return await this.accountClient.send<AccountGetMe.Response, AccountGetMe.Request>(
      AccountGetMe.pattern,
      {
        data: { id: uid },
      },
    );
  }
}
