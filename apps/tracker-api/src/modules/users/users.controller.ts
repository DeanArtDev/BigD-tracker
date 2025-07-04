import { ACCESS_TOKEN_KEY } from '@/modules/auth';
import { Public, TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { UsersService } from '@/modules/users/users.service';
import { ACCOUNT_SERVICE_RMQ_KEY, AccountGetMe } from '@big-d/api-contracts';
import { Controller, Get, HttpStatus, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { User } from './users.entity';

@ApiTags('Account')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,

    @Inject(ACCOUNT_SERVICE_RMQ_KEY) private readonly accountClient: ClientProxy,
  ) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Тестовый публичный метод, на проде закроется',
  })
  async getUsers(): Promise<{ data: User[] }> {
    const data = await this.usersService.getAll();
    return { data };
  }

  @Get('me')
  @ApiBearerAuth(ACCESS_TOKEN_KEY)
  @ApiOperation({
    summary: 'Получение общих данных о вошедшем в систему пользователе',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: AccountGetMe.Response,
  })
  async me(@TokenPayload() { uid }: AccessTokenPayload): Promise<AccountGetMe.Response> {
    return await firstValueFrom(
      this.accountClient.send<AccountGetMe.Response, AccountGetMe.Request>(AccountGetMe.pattern, {
        data: { id: uid },
      }),
    );
  }
}
