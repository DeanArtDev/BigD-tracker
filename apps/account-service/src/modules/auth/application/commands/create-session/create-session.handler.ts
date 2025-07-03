import { ACCOUNT_APP_ENV } from '@/infrastructure/configs';
import { AUTH_REPOSITORY, AuthRepository } from '@/modules/auth/application';
import { SessionEntity } from '@/modules/auth/domain';
import { GetUserHandler, GetUserQuery } from '@/modules/users/application';
import { ReturnHandlerType } from '@big-d/api-utils';
import { Inject, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { CreateSessionCommand } from './create-session.command';

@CommandHandler(CreateSessionCommand)
export class CreateSessionHandler implements ICommandHandler<CreateSessionCommand> {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepository,
    private readonly queryBus: QueryBus,
    private readonly config: ConfigService<ACCOUNT_APP_ENV>,
  ) {}

  async execute(input: CreateSessionCommand): Promise<void> {
    const user = await this.queryBus.execute<
      GetUserQuery,
      ReturnHandlerType<typeof GetUserHandler>
    >(new GetUserQuery({ id: input.userId }));
    if (user == null) {
      throw new NotFoundException(`There is no user: ${input.userId}`);
    }

    const expirationDate = new Date(
      Date.now() + this.config.get<number>('SESSION_REFRESH_TIME', 0),
    );
    const draftSession = SessionEntity.create({
      uuid: randomUUID(),
      ip: input.ip,
      userId: input.userId,
      userAgent: input.userAgent,
    }).setExpirationDate(expirationDate);

    const session = await this.authRepository.create(draftSession);
    if (session == null) {
      const { ip, userId, userAgent } = input;
      throw new InternalServerErrorException(
        { ip, userId, userAgent },
        { cause: 'Failed to create session' },
      );
    }
  }
}
