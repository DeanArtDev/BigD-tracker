import { GroupWithTasksView } from '@/modules/tasks/application/dto';
import { GetDetailedGroupsQuery, GetUserGroupsQuery } from '@/modules/tasks/application/queries';
import {
  CreateGroupCommand,
  DeleteGroupCommand,
  ReplaceGroupCommand,
} from '@/modules/tasks/application/use-cases';
import { GroupViewRmqMapper } from './mappers/group-view.rmq.mapper';
import {
  GoalCreateGroup,
  GoalDeleteGroup,
  GoalGetDetailedGroups,
  GoalGetUserGroups,
  GoalReplaceGroup,
} from '@big-d/api-contracts';
import { Controller, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RequestContextPayloadGuard } from '@shared/request-context';

@Controller()
@UseGuards(RequestContextPayloadGuard)
export class GroupsRmqController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @MessagePattern(GoalGetUserGroups.pattern)
  async getUserGroups(
    @Payload() { data: payload }: GoalGetUserGroups.Request,
  ): Promise<GoalGetUserGroups.Response> {
    const groups = await this.queryBus.execute<GetUserGroupsQuery, GroupWithTasksView[]>(
      new GetUserGroupsQuery({ userId: payload.userId }),
    );

    return {
      data: groups.map(GroupViewRmqMapper.fromViewToDtoWithTasks),
    };
  }

  @MessagePattern(GoalCreateGroup.pattern)
  async createGroup(
    @Payload() { data: payload }: GoalCreateGroup.Request,
  ): Promise<GoalCreateGroup.Response> {
    return {
      data: await this.commandBus.execute(
        new CreateGroupCommand({
          userId: payload.userId,
          name: payload.name,
          description: payload.description,
        }),
      ),
    };
  }

  @MessagePattern(GoalReplaceGroup.pattern)
  async replaceGroup(
    @Payload() { data: payload }: GoalReplaceGroup.Request,
  ): Promise<GoalReplaceGroup.Response> {
    const groupWithTasks = await this.commandBus.execute(
      new ReplaceGroupCommand({
        id: payload.id,
        userId: payload.userId,
        name: payload.name,
        description: payload.description,
        tasks: payload.tasks,
      }),
    );

    return {
      data: groupWithTasks.toJSON(),
    };
  }

  @MessagePattern(GoalGetDetailedGroups.pattern)
  async getDetailedGroup(
    @Payload() { data: payload }: GoalGetDetailedGroups.Request,
  ): Promise<GoalGetDetailedGroups.Response> {
    const groupWithTasks = await this.queryBus.execute(
      new GetDetailedGroupsQuery({
        userId: payload.userId,
        groupId: payload.groupId,
      }),
    );

    return {
      data: groupWithTasks.toJSON(),
    };
  }

  @MessagePattern(GoalDeleteGroup.pattern)
  async deleteGroup(
    @Payload() { data: payload }: GoalDeleteGroup.Request,
  ): Promise<GoalDeleteGroup.Response> {
    return await this.commandBus.execute(
      new DeleteGroupCommand({ groupId: payload.groupId, userId: payload.userId }),
    );
  }
}
