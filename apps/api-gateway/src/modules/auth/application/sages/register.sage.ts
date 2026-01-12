import { AccountServiceClientProxy, GoalServiceClientProxy } from '@/infrastructure/rmq-clients';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { RegisterRpcRes } from '@/modules/auth/dto/register.dto';
import {
  AccountDeleteUser,
  AccountLogout,
  AccountRegister,
  GoalCreateInboxGroup,
  RpcStatus,
} from '@big-d/api-contracts';
import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BaseHttpException, ExceptionWrongRpcResponse } from '@shared/exceptions';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class RegisterSage {
  constructor(
    private readonly accountClient: AccountServiceClientProxy,
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

    const response = await this.accountClient.send<
      AccountRegister.Response,
      AccountRegister.Request
    >(AccountRegister.pattern, { data: { ip, userAgent, login, password } });

    const instance = plainToInstance(RegisterRpcRes, response, {
      excludeExtraneousValues: true,
    });

    const issues = await validate(instance, {
      whitelist: true,
      forbidNonWhitelisted: false,
    });

    if (issues.length > 0) {
      throw BaseHttpException.createFromBase(
        new ExceptionWrongRpcResponse({ issues }),
        HttpStatus.BAD_GATEWAY,
      );
    }

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
    const { data } = await this.accountClient.send<AccountLogout.Response, AccountLogout.Request>(
      AccountLogout.pattern,
      { data: { userAgent, userId } },
    );

    if (data.stats === RpcStatus.FAILED) {
      // логнуть для чистки в будущем
    }

    await this.accountClient.send<AccountDeleteUser.Response, AccountDeleteUser.Request>(
      AccountDeleteUser.pattern,
      { data: { id: userId } },
    );
  }
}
