import { DeleteUserCommand, DeleteUserHandler } from '@/modules/users/application/commands';
import { AccountDeleteUser, AccountGetMe } from '@big-d/api-contracts';
import { ReturnHandlerType } from '@big-d/api-utils';
import { Controller, NotFoundException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GetUserHandler, GetUserQuery } from './queries';
import { UserMapper } from './users.mapper';

@Controller()
export class UsersController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly userMapper: UserMapper,
  ) {}

  @MessagePattern(AccountGetMe.pattern)
  async me(@Payload() { data }: AccountGetMe.Request): Promise<AccountGetMe.Response> {
    const user = await this.queryBus.execute<
      GetUserQuery,
      ReturnHandlerType<typeof GetUserHandler>
    >(new GetUserQuery({ id: data.id }));

    if (user == null) {
      throw new NotFoundException(`User: ${data.id} not found`);
    }

    return {
      data: this.userMapper.fromEntityToDTO(user),
    };
  }

  @MessagePattern(AccountDeleteUser.pattern)
  async deleteUser(
    @Payload() { data }: AccountDeleteUser.Request,
  ): Promise<AccountDeleteUser.Response> {
    const { id } = await this.commandBus.execute<
      DeleteUserCommand,
      ReturnHandlerType<typeof DeleteUserHandler>
    >(new DeleteUserCommand(data.id));

    return {
      data: { id },
    };
  }
}
