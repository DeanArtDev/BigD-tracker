import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import {
  ACCOUNT_SERVICE_RMQ_KEY,
  AccountDeleteUser,
  AccountLogout,
  AccountRegister,
  GOAL_SERVICE_RMQ_KEY,
  GoalCreateInBoxGroup,
  RpcStatus,
} from '@big-d/api-contracts';
import { BadGatewayException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RegisterSage {
  constructor(
    @Inject(ACCOUNT_SERVICE_RMQ_KEY) private readonly accountClient: ClientProxy,
    @Inject(GOAL_SERVICE_RMQ_KEY) private readonly goalClient: ClientProxy,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: {
    login: string;
    password: string;
    ip?: string;
    userAgent?: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
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
        this.goalClient.send<GoalCreateInBoxGroup.Response, GoalCreateInBoxGroup.Request>(
          GoalCreateInBoxGroup.pattern,
          { data: { userId: uid } },
        ),
      );
    } catch (error) {
      await this.#compensation({ userId: uid, userAgent });
      throw new BadGatewayException('Failed to register', { description: error?.message });
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
