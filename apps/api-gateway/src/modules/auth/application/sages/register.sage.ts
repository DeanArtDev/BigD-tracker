import { AppRmqClient, AUTH_RMQ_SERVICE, GOAL_RMQ_SERVICE } from '@/infrastructure/rmq-clients';
import { AuthDeleteUser, AuthRegister, GoalCreateInboxGroup } from '@big-d/api-contracts';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenPayload } from '../../dto/access-token.dto';

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

  async #compensation(input: { userId: number; userAgent?: string; ip?: string }) {
    const { userId, userAgent, ip } = input;

    await this.authClient.send<AuthDeleteUser.Response, AuthDeleteUser.Request>(AuthDeleteUser.pattern, {
      data: { id: userId, userAgent, ip },
    });
  }
}
