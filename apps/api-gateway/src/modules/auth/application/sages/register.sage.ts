import { GoalServiceClientProxy } from '@/infrastructure/rmq-clients';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import {
  ACCOUNT_SERVICE_RMQ_KEY,
  AccountDeleteUser,
  AccountLogout,
  AccountRegister,
  GoalCreateInboxGroup,
  RpcStatus,
} from '@big-d/api-contracts';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RegisterSage {
  constructor(
    @Inject(ACCOUNT_SERVICE_RMQ_KEY) private readonly accountClient: ClientProxy,
    private readonly goalClient: GoalServiceClientProxy,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: {
    login: string;
    password: string;
    ip?: string;
    userAgent?: string;
  }): Promise<{ accessToken: string; refreshToken: string; maxAge: number }> {
    const { ip, userAgent, login, password } = input;

    const response = await firstValueFrom(
      this.accountClient.send<AccountRegister.Response, AccountRegister.Request>(
        AccountRegister.pattern,
        { data: { ip, userAgent, login, password } },
      ),
    );

    const { uid } = this.jwtService.decode<AccessTokenPayload>(response.data.accessToken);

    try {
      await firstValueFrom(
        this.goalClient.send<GoalCreateInboxGroup.Response, GoalCreateInboxGroup.Request>(
          GoalCreateInboxGroup.pattern,
          { data: { userId: uid } },
        ),
      );
    } catch (error) {
      await this.#compensation({ userId: uid, userAgent });
      throw error;
    }

    return response.data;
  }

  async #compensation(input: { userId: number; userAgent?: string }) {
    const { userId, userAgent } = input;
    const { data } = await firstValueFrom(
      this.accountClient.send<AccountLogout.Response, AccountLogout.Request>(
        AccountLogout.pattern,
        { data: { userAgent, userId } },
      ),
    );

    if (data.stats === RpcStatus.FAILED) {
      // логнуть для чистки в будущем
    }

    await firstValueFrom(
      this.accountClient.send<AccountDeleteUser.Response, AccountDeleteUser.Request>(
        AccountDeleteUser.pattern,
        { data: { id: userId } },
      ),
    );
  }
}
