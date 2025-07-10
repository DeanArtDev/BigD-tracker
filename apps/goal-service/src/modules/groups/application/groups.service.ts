import {
  CreateGroupWithThingsCommand,
  CreateGroupWithThingsHandler,
  CreateInBoxGroupCommand,
  CreateInBoxGroupHandler,
  IN_BOX_NAME,
  UpdateGroupWithThingsCommand,
  UpdateGroupWithThingsHandler,
} from '@/modules/groups/application/commands';
import {
  GetGroupByIdHandler,
  GetGroupByIdQuery,
  GetGroupUserInboxHandler,
  GetGroupUserInboxQuery,
} from '@/modules/groups/application/queries';
import { GroupDto, GroupInBoxDto } from '@big-d/api-contracts';
import { ReturnHandlerType } from '@big-d/api-utils';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GroupsMapper, InBoxGroupMapper } from './groups.mapper';

@Injectable()
export class GroupsService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly mapper: GroupsMapper,
  ) {}

  async createGroupWithThings(
    input: InstanceType<typeof CreateGroupWithThingsCommand>['input'],
  ): Promise<GroupDto> {
    const { id } = await this.commandBus.execute<
      CreateGroupWithThingsCommand,
      ReturnHandlerType<typeof CreateGroupWithThingsHandler>
    >(new CreateGroupWithThingsCommand(input));

    const group = await this.queryBus.execute<
      GetGroupByIdQuery,
      ReturnHandlerType<typeof GetGroupByIdHandler>
    >(new GetGroupByIdQuery({ id, userId: input.userId }));
    if (group == null) {
      throw new InternalServerErrorException(`Failed to create group`);
    }

    return this.mapper.fromEntityToDTO(group);
  }

  async createInBoxGroup(
    input: InstanceType<typeof CreateInBoxGroupCommand>['input'],
  ): Promise<GroupInBoxDto> {
    await this.commandBus.execute<
      CreateInBoxGroupCommand,
      ReturnHandlerType<typeof CreateInBoxGroupHandler>
    >(new CreateInBoxGroupCommand(input));

    const group = await this.queryBus.execute<
      GetGroupUserInboxQuery,
      ReturnHandlerType<typeof GetGroupUserInboxHandler>
    >(new GetGroupUserInboxQuery({ userId: input.userId }));
    if (group == null) {
      throw new InternalServerErrorException(`Failed to create ${IN_BOX_NAME} group`);
    }

    return new InBoxGroupMapper().fromEntityToDTO(group);
  }

  async updateGroupWithThings(
    input: InstanceType<typeof UpdateGroupWithThingsCommand>['input'],
  ): Promise<GroupDto> {
    const { id } = await this.commandBus.execute<
      UpdateGroupWithThingsCommand,
      ReturnHandlerType<typeof UpdateGroupWithThingsHandler>
    >(new UpdateGroupWithThingsCommand(input));

    const group = await this.queryBus.execute<
      GetGroupByIdQuery,
      ReturnHandlerType<typeof GetGroupByIdHandler>
    >(new GetGroupByIdQuery({ id, userId: input.userId }));
    if (group == null) {
      throw new InternalServerErrorException(`Failed to update group`);
    }

    return this.mapper.fromEntityToDTO(group);
  }
}
