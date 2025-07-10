import { DeleteGroupCommand, DeleteGroupHandler } from '@/modules/groups/application/commands';
import { InBoxGroupMapper } from '@/modules/groups/application/groups.mapper';
import {
  GetGroupUserInboxHandler,
  GetGroupUserInboxQuery,
} from '@/modules/groups/application/queries';
import {
  GoalCreateGroup,
  GoalCreateInBoxGroup,
  GoalDeleteGroup,
  GoalGetGroupInBox,
  GoalUpdateGroup,
} from '@big-d/api-contracts';
import { ReturnHandlerType } from '@big-d/api-utils';
import { Controller, NotFoundException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GroupsService } from './groups.service';

@Controller()
export class GroupsController {
  constructor(
    private readonly groupsService: GroupsService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern(GoalGetGroupInBox.pattern)
  async getInBox(
    @Payload() { data }: GoalGetGroupInBox.Request,
  ): Promise<GoalGetGroupInBox.Response> {
    const inBox = await this.queryBus.execute<
      GetGroupUserInboxQuery,
      ReturnHandlerType<typeof GetGroupUserInboxHandler>
    >(
      new GetGroupUserInboxQuery({
        userId: data.userId,
      }),
    );
    if (inBox == null) {
      throw new NotFoundException(`IN BOX for user: ${data.userId} is not found`);
    }

    return {
      data: new InBoxGroupMapper().fromEntityToDTO(inBox),
    };
  }

  @MessagePattern(GoalCreateInBoxGroup.pattern)
  async create(
    @Payload() { data }: GoalCreateInBoxGroup.Request,
  ): Promise<GoalCreateInBoxGroup.Response> {
    return {
      data: await this.groupsService.createInBoxGroup({
        userId: data.userId,
      }),
    };
  }

  @MessagePattern(GoalCreateGroup.pattern)
  async createInBox(
    @Payload() { data }: GoalCreateGroup.Request,
  ): Promise<GoalCreateGroup.Response> {
    return {
      data: await this.groupsService.createGroupWithThings(data),
    };
  }

  @MessagePattern(GoalUpdateGroup.pattern)
  async update(@Payload() { data }: GoalUpdateGroup.Request): Promise<GoalUpdateGroup.Response> {
    return {
      data: await this.groupsService.updateGroupWithThings(data),
    };
  }

  @MessagePattern(GoalDeleteGroup.pattern)
  async delete(@Payload() { data }: GoalDeleteGroup.Request): Promise<GoalDeleteGroup.Response> {
    await this.commandBus.execute<DeleteGroupCommand, ReturnHandlerType<typeof DeleteGroupHandler>>(
      new DeleteGroupCommand({
        id: data.id,
        userId: data.userId,
      }),
    );
    return { data: { id: data.id } };
  }
}
