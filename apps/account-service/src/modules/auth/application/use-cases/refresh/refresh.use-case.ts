import {
  DeleteSessionCommand,
  DeleteSessionHandler,
  GetSessionHandler,
  GetSessionQuery,
} from '@/modules/auth/application';
import { ReturnHandlerType } from '@big-d/api-utils';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

interface RefreshUseCaseInput {
  readonly sessionToken: string;
  readonly ip?: string;
  readonly userAgent?: string;
}

@Injectable()
export class RefreshUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(
    input: RefreshUseCaseInput,
  ): Promise<{ sessionToken: string; accessToken: string }> {
    const session = await this.queryBus.execute<
      GetSessionQuery,
      ReturnHandlerType<typeof GetSessionHandler>
    >(new GetSessionQuery({ token: input.sessionToken }));

    if (session == null) {
      throw new UnauthorizedException('Session expired or not existed');
    }

    if (session.isExpired) {
      await this.commandBus.execute<
        DeleteSessionCommand,
        ReturnType<InstanceType<typeof DeleteSessionHandler>['execute']>
      >(new DeleteSessionCommand(session.userId, session?.userAgent));
    }

    const accessToken = await this.jwtService.signAsync({ uid: session.userId, sid: session.uuid });

    return {
      accessToken,
      sessionToken: session.token,
    };
  }
}
