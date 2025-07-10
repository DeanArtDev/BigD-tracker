import { GroupEntity } from '@/modules/groups/domain';
import {
  GetThingsByGroupIdHandler,
  GetThingsByGroupIdQuery,
} from '@/modules/things/application/queries';
import { ReturnHandlerType } from '@big-d/api-utils';
import { Inject, InternalServerErrorException } from '@nestjs/common';
import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { GROUPS_REPOSITORY, GroupsRepository } from '../groups.repository';
import { GetGroupByGoalIdQuery, GetGroupByIdQuery, GetGroupUserInboxQuery } from './groups.query';

@QueryHandler(GetGroupByIdQuery)
export class GetGroupByIdHandler implements IQueryHandler<GetGroupByIdQuery> {
  constructor(
    @Inject(GROUPS_REPOSITORY) private readonly groupsRepo: GroupsRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute({ input }: GetGroupByIdQuery): Promise<GroupEntity | null> {
    const group = await this.groupsRepo.findById(input);
    if (group == null) return null;
    const things = await this.queryBus.execute<
      GetThingsByGroupIdQuery,
      ReturnHandlerType<typeof GetThingsByGroupIdHandler>
    >(new GetThingsByGroupIdQuery({ groupId: input.id, userId: input.userId }));
    return group.setThings(things);
  }
}

@QueryHandler(GetGroupUserInboxQuery)
export class GetGroupUserInboxHandler implements IQueryHandler<GetGroupUserInboxQuery> {
  constructor(
    @Inject(GROUPS_REPOSITORY) private readonly groupsRepo: GroupsRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute({ input }: GetGroupUserInboxQuery): Promise<GroupEntity> {
    const inBox = await this.groupsRepo.findUserInbox(input);
    if (inBox == null) {
      throw new InternalServerErrorException(`IN BOX for user: ${input.userId} not found`);
    }

    const things = await this.queryBus.execute<
      GetThingsByGroupIdQuery,
      ReturnHandlerType<typeof GetThingsByGroupIdHandler>
    >(new GetThingsByGroupIdQuery({ groupId: inBox.id, userId: input.userId }));
    return inBox.setThings(things);
  }
}

@QueryHandler(GetGroupByGoalIdQuery)
export class GetGroupByGoalIdHandler implements IQueryHandler<GetGroupByGoalIdQuery> {
  constructor(
    @Inject(GROUPS_REPOSITORY) private readonly groupsRepo: GroupsRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute({ input }: GetGroupByGoalIdQuery): Promise<GroupEntity[]> {
    const groups = await this.groupsRepo.findByGoalId(input);

    for (const group of groups) {
      const things = await this.queryBus.execute<
        GetThingsByGroupIdQuery,
        ReturnHandlerType<typeof GetThingsByGroupIdHandler>
      >(new GetThingsByGroupIdQuery({ groupId: group.id, userId: input.userId }));
      group.setThings(things);
    }

    return groups;
  }
}
