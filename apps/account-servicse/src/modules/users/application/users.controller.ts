import { UserEntity } from '@/modules/users/domain';
import { GetUserByIdQuery } from './queries';
import { MeReq, MeRes } from '@big-d/api-contracts';
import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserMapper } from './users.mapper';

@Controller()
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly userMapper: UserMapper,
  ) {}

  @MessagePattern({ cmd: 'get-me' })
  async me(@Payload() { data }: MeReq): Promise<MeRes> {
    const user = await this.queryBus.execute<GetUserByIdQuery, UserEntity>(
      new GetUserByIdQuery(data.id),
    );

    return {
      data: this.userMapper.fromEntityToDTO(user),
    };
  }
}
