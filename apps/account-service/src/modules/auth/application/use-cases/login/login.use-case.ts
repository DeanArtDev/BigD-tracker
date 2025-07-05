import {
  CreateSessionCommand,
  CreateSessionHandler,
  GetSessionHandler,
  GetSessionQuery,
} from '@/modules/auth/application';
import { GetUserHandler, GetUserQuery } from '@/modules/users/application';
import { ExceptionWrongLoginOrPassword } from '@big-d/api-exceptions';
import { Email, ReturnHandlerType } from '@big-d/api-utils';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

interface LoginUseCaseInput {
  readonly login: string;
  readonly password: string;
  readonly ip?: string;
  readonly userAgent?: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(input: LoginUseCaseInput): Promise<{ sessionToken: string; accessToken: string }> {
    const email = Email.create(input.login).value;
    const user = await this.queryBus.execute<
      GetUserQuery,
      ReturnHandlerType<typeof GetUserHandler>
    >(new GetUserQuery({ email }));
    if (user == null) {
      throw new NotFoundException('User not found!');
    }
    const isPasswordOk = user.validatePassword(input.password);
    if (!isPasswordOk) {
      throw new ExceptionWrongLoginOrPassword({ message: 'Invalid credentials' });
    }

    await this.commandBus.execute<
      CreateSessionCommand,
      ReturnHandlerType<typeof CreateSessionHandler>
    >(new CreateSessionCommand(user.id, input.ip, input.userAgent));

    const session = await this.queryBus.execute<
      GetSessionQuery,
      ReturnHandlerType<typeof GetSessionHandler>
    >(new GetSessionQuery({ userId: user.id, userAgent: input.userAgent }));
    if (session == null) {
      throw new InternalServerErrorException(`Failed to create session for user: ${user.id}`);
    }

    const accessToken = await this.jwtService.signAsync({
      uid: user.id,
      sid: session.uuid,
    });

    return { sessionToken: session.token, accessToken };
  }
}
