import { DeleteSessionCommand, DeleteSessionHandler } from '@/modules/auth/application';
import { GetUserHandler, GetUserQuery } from '@/modules/users/application';
import { ReturnHandlerType } from '@big-d/api-utils';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

interface RefreshUseCaseInput {
  readonly userId: number;
  readonly userAgent?: string;
}

@Injectable()
export class LogoutUseCase {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(input: RefreshUseCaseInput): Promise<void> {
    const user = await this.queryBus.execute<
      GetUserQuery,
      ReturnHandlerType<typeof GetUserHandler>
    >(new GetUserQuery({ id: input.userId }));
    if (user == null) {
      throw new UnauthorizedException('Session owner is not existed');
    }

    await this.commandBus.execute<
      DeleteSessionCommand,
      ReturnHandlerType<typeof DeleteSessionHandler>
    >(new DeleteSessionCommand(input.userId, input.userAgent));
  }
}
