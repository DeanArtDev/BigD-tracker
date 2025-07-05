import {
  CreateSessionCommand,
  CreateSessionHandler,
  GetSessionHandler,
  GetSessionQuery,
} from '@/modules/auth/application';
import {
  CreateUserCommand,
  CreateUserHandler,
  DeleteUserCommand,
  DeleteUserHandler,
} from '@/modules/users/application';
import { ReturnHandlerType } from '@big-d/api-utils';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

interface RegisterUseCaseInput {
  readonly email: string;
  readonly password: string;
  readonly ip?: string;
  readonly userAgent?: string;
}

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(
    input: RegisterUseCaseInput,
  ): Promise<{ sessionToken: string; accessToken: string }> {
    const { userId } = await this.commandBus.execute<
      CreateUserCommand,
      ReturnType<InstanceType<typeof CreateUserHandler>['execute']>
    >(new CreateUserCommand(input.email, input.password));

    await this.#withUserCompensation(userId, () =>
      this.commandBus.execute<CreateSessionCommand, ReturnHandlerType<typeof CreateSessionHandler>>(
        new CreateSessionCommand(userId, input.ip, input.userAgent),
      ),
    );

    const session = await this.queryBus.execute<
      GetSessionQuery,
      ReturnHandlerType<typeof GetSessionHandler>
    >(new GetSessionQuery({ userId, userAgent: input.userAgent }));
    if (session == null) {
      throw new InternalServerErrorException(`Failed to create session for user: ${userId}`);
    }

    const accessToken = await this.jwtService.signAsync({
      uid: userId,
      sid: session.uuid,
    });

    return { sessionToken: session.token, accessToken };
  }

  async #withUserCompensation(userId: number, cb: () => Promise<unknown>) {
    try {
      await cb();
    } catch (error) {
      await this.commandBus.execute<
        DeleteUserCommand,
        ReturnType<InstanceType<typeof DeleteUserHandler>['execute']>
      >(new DeleteUserCommand(userId));
      throw error;
    }
  }
}
