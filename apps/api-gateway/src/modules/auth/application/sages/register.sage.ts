import { AppRmqClient, AUTH_RMQ_SERVICE, GOAL_RMQ_SERVICE } from '@/infrastructure/rmq-clients';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { AccountDeleteUser, AccountLogout, AuthRegister, GoalCreateInboxGroup, RpcStatus } from '@big-d/api-contracts';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RegisterSage {
  constructor(
    @Inject(AUTH_RMQ_SERVICE) private readonly authClient: AppRmqClient,
    @Inject(GOAL_RMQ_SERVICE) private readonly goalClient: AppRmqClient,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: {
    login: string;
    password: string;
    ip?: string;
    userAgent?: string;
  }): Promise<{ accessToken: string; refreshToken: string; maxAge: number }> {
    const { ip, userAgent, login, password } = input;

    const response = await this.authClient.send<AuthRegister.Response, AuthRegister.Request>(AuthRegister.pattern, {
      data: { ip, userAgent, login, password },
    });

    const { uid } = this.jwtService.decode<AccessTokenPayload>(response.data.accessToken);

    try {
      await this.goalClient.send<GoalCreateInboxGroup.Response, GoalCreateInboxGroup.Request>(
        GoalCreateInboxGroup.pattern,
        { data: { userId: uid } },
      );
    } catch (error) {
      await this.#compensation({ userId: uid, userAgent });
      throw error;
    }

    return response.data;
  }

  async #compensation(input: { userId: number; userAgent?: string }) {
    const { userId, userAgent } = input;
    const { data } = await this.authClient.send<AccountLogout.Response, AccountLogout.Request>(AccountLogout.pattern, {
      data: { userAgent, userId },
    });

    if (data.stats === RpcStatus.FAILED) {
      // логнуть для чистки в будущем
    }

    await this.authClient.send<AccountDeleteUser.Response, AccountDeleteUser.Request>(AccountDeleteUser.pattern, {
      data: { id: userId },
    });
  }
}
