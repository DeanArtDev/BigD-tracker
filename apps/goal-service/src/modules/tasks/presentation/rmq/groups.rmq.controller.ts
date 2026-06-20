import { GroupWithTasksView } from '@/modules/tasks/application/dto';
import { GetAssignableGroupsQuery, GetGroupQuery, GetUserGroupsQuery } from '@/modules/tasks/application/queries';
import { CreateGroupCommand, DeleteGroupCommand, ReplaceGroupCommand } from '@/modules/tasks/application/use-cases';
import { CursorPaginationService } from '@shared/cursor-pagination';
import { GroupViewRmqMapper } from './mappers/group-view.rmq.mapper';
import {
  GoalCreateGroup,
  GoalDeleteGroup,
  GoalGetAssignableGroups,
  GoalGetGroup,
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
    private readonly cursorPaginationService: CursorPaginationService,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @MessagePattern(GoalGetUserGroups.pattern)
  async getUserGroups(@Payload() { data: payload }: GoalGetUserGroups.Request): Promise<GoalGetUserGroups.Response> {
    const { userId, cursor, sort, search, limit } = payload;
    const requestCursorPayload = this.cursorPaginationService.decodeCursorString(cursor);

    const lastId = !Number.isNaN(parseInt(requestCursorPayload?.lastId?.toString() ?? '', 16))
      ? Number(requestCursorPayload?.lastId)
      : undefined;
    const groups = await this.queryBus.execute<GetUserGroupsQuery, GroupWithTasksView[]>(
      new GetUserGroupsQuery({ userId }, { sort, search, limit, lastId }),
    );

    const { nextCursor, hasNext } = this.cursorPaginationService.getNextCursor({
      sort,
      search,
      limit,
      lastId: groups.at(-1)?.id,
      currentPartLength: groups.length,
    });

    return {
      data: {
        items: groups.map(GroupViewRmqMapper.fromViewToDtoWithTasks),
        meta: { endCursor: nextCursor, hasNextPage: hasNext },
      },
    };
  }

  @MessagePattern(GoalCreateGroup.pattern)
  async createGroup(@Payload() { data: payload }: GoalCreateGroup.Request): Promise<GoalCreateGroup.Response> {
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
  async replaceGroup(@Payload() { data: payload }: GoalReplaceGroup.Request): Promise<GoalReplaceGroup.Response> {
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

  @MessagePattern(GoalGetGroup.pattern)
  async getGroup(@Payload() { data: payload }: GoalGetGroup.Request): Promise<GoalGetGroup.Response> {
    const group = await this.queryBus.execute(
      new GetGroupQuery({
        userId: payload.userId,
        groupId: payload.groupId,
      }),
    );

    return {
      data: {
        id: group.id,
        name: group.name,
        description: group.description,
        userId: group.userId,
        progress: group.progress,
        status: group.status,
      },
    };
  }

  @MessagePattern(GoalGetAssignableGroups.pattern)
  async getAssignableGroups(
    @Payload() { data: payload }: GoalGetAssignableGroups.Request,
  ): Promise<GoalGetAssignableGroups.Response> {
    return {
      data: await this.queryBus.execute(
        new GetAssignableGroupsQuery({
          userId: payload.userId,
        }),
      ),
    };
  }

  @MessagePattern(GoalDeleteGroup.pattern)
  async deleteGroup(@Payload() { data: payload }: GoalDeleteGroup.Request): Promise<GoalDeleteGroup.Response> {
    return await this.commandBus.execute(new DeleteGroupCommand({ groupId: payload.groupId, userId: payload.userId }));
  }
}
