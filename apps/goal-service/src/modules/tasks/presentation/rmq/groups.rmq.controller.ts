import {
  GetAssignableGroupsQuery,
  GetGroupHandler,
  GetGroupInfoHandler,
  GetGroupInfoQuery,
  GetGroupListHandler,
  GetGroupListQuery,
  GetGroupQuery,
} from '@/modules/tasks/application/queries';
import {
  CreateGroupCommand,
  CreateGroupHandler,
  DeleteGroupCommand,
  ReplaceGroupCommand,
  ReplaceGroupHandler,
} from '@/modules/tasks/application/use-cases';
import {
  GoalCreateGroup,
  GoalDeleteGroup,
  GoalGetAssignableGroups,
  GoalGetGroup,
  GoalGetGroupInfo,
  GoalGetGroupList,
  GoalReplaceGroup,
} from '@big-d/api-contracts';
import { ReturnHandlerType } from '@big-d/api-utils';
import { Controller, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CursorPaginationService } from '@shared/cursor-pagination';
import { RequestContextPayloadGuard } from '@shared/request-context';
import { isFloat } from 'validator';

@Controller()
@UseGuards(RequestContextPayloadGuard)
export class GroupsRmqController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly cursorPaginationService: CursorPaginationService,
  ) {}

  @MessagePattern(GoalCreateGroup.pattern)
  async createGroup(@Payload() { data: payload }: GoalCreateGroup.Request): Promise<GoalCreateGroup.Response> {
    const group = await this.commandBus.execute<CreateGroupCommand, ReturnHandlerType<typeof CreateGroupHandler>>(
      new CreateGroupCommand({
        userId: payload.userId,
        name: payload.name,
        description: payload.description,
      }),
    );

    return {
      data: group.toJSON(),
    };
  }

  @MessagePattern(GoalReplaceGroup.pattern)
  async replaceGroup(@Payload() { data: payload }: GoalReplaceGroup.Request): Promise<GoalReplaceGroup.Response> {
    const group = await this.commandBus.execute<ReplaceGroupCommand, ReturnHandlerType<typeof ReplaceGroupHandler>>(
      new ReplaceGroupCommand({
        id: payload.id,
        userId: payload.userId,
        name: payload.name,
        description: payload.description,
        tasks: payload.tasks,
      }),
    );

    return {
      data: group.toJSON(),
    };
  }

  @MessagePattern(GoalGetGroup.pattern)
  async getGroup(@Payload() { data: payload }: GoalGetGroup.Request): Promise<GoalGetGroup.Response> {
    const group = await this.queryBus.execute<GetGroupQuery, ReturnHandlerType<typeof GetGroupHandler>>(
      new GetGroupQuery({
        userId: payload.userId,
        groupId: payload.groupId,
      }),
    );

    return {
      data: group.toJSON(),
    };
  }

  @MessagePattern(GoalGetGroupInfo.pattern)
  async getGroupInfo(@Payload() { data: payload }: GoalGetGroupInfo.Request): Promise<GoalGetGroupInfo.Response> {
    return {
      data: await this.queryBus.execute<GetGroupInfoQuery, ReturnHandlerType<typeof GetGroupInfoHandler>>(
        new GetGroupInfoQuery({ userId: payload.userId, groupId: payload.groupId }),
      ),
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

  @MessagePattern(GoalGetGroupList.pattern)
  async getGroupList(@Payload() { data: payload }: GoalGetGroupList.Request): Promise<GoalGetGroupList.Response> {
    const { userId, limit, cursor, search } = payload;
    const requestCursorPayload = this.cursorPaginationService.decodeCursorString(cursor);

    const lid = requestCursorPayload?.lastId?.toString() ?? '';
    const positiveNumberString = isFloat(lid, { gt: 0 });

    const groups = await this.queryBus.execute<GetGroupListQuery, ReturnHandlerType<typeof GetGroupListHandler>>(
      new GetGroupListQuery({ userId, limit, search, lastId: positiveNumberString ? Number(lid) : undefined }),
    );

    const { nextCursor, hasNext } = this.cursorPaginationService.getNextCursor({
      search,
      filter: { search },
      limit,
      lastId: groups.at(-1)?.id,
      currentPartLength: groups.length,
    });

    return {
      data: {
        items: groups,
        meta: { endCursor: nextCursor, hasNextPage: hasNext },
      },
    };
  }

  @MessagePattern(GoalDeleteGroup.pattern)
  async deleteGroup(@Payload() { data: payload }: GoalDeleteGroup.Request): Promise<GoalDeleteGroup.Response> {
    return await this.commandBus.execute(new DeleteGroupCommand({ groupId: payload.groupId, userId: payload.userId }));
  }
}
