import { GroupsMapper, GroupsController, GroupsService } from '@/modules/groups/application';
import {
  CreateInBoxGroupCommand,
  CreateInBoxGroupHandler,
  CreateGroupWithThingsCommand,
  DeleteGroupCommand,
  DeleteGroupHandler,
  UpdateGroupCommand,
  UpdateGroupHandler,
  CreateGroupWithThingsHandler,
  UpdateGroupWithThingsCommand,
  UpdateGroupWithThingsHandler,
  CreateGroupHandler,
  CreateGroupCommand,
} from '@/modules/groups/application/commands';
import {
  GetGroupByGoalIdHandler,
  GetGroupByGoalIdQuery,
  GetGroupByIdHandler,
  GetGroupByIdQuery,
  GetGroupUserInboxHandler,
  GetGroupUserInboxQuery,
} from '@/modules/groups/application/queries';
import { GroupCreatedEvent, GroupDeletedEvent, GroupUpdatedEvent } from '@/modules/groups/domain';
import { SyncCollectionRepository } from '@big-d/api-utils';
import { Module } from '@nestjs/common';
import { GROUPS_REPOSITORY } from './application';
import { KyselyGroupsRepository } from './infra/kysely-groups.repository';

const commands = [
  DeleteGroupCommand,
  UpdateGroupCommand,
  CreateInBoxGroupCommand,
  CreateGroupWithThingsCommand,
  UpdateGroupWithThingsCommand,
  CreateInBoxGroupCommand,
  CreateGroupCommand,
];
const handlers = [
  UpdateGroupHandler,
  CreateInBoxGroupHandler,
  DeleteGroupHandler,
  GetGroupByIdHandler,
  GetGroupByGoalIdHandler,
  GetGroupUserInboxHandler,
  CreateGroupWithThingsHandler,
  UpdateGroupWithThingsHandler,
  CreateInBoxGroupHandler,
  CreateGroupHandler,
];
const queries = [GetGroupByIdQuery, GetGroupByGoalIdQuery, GetGroupUserInboxQuery];
const events = [GroupUpdatedEvent, GroupCreatedEvent, GroupDeletedEvent];

@Module({
  controllers: [GroupsController],
  providers: [
    GroupsService,
    GroupsMapper,
    SyncCollectionRepository,
    { provide: GROUPS_REPOSITORY, useClass: KyselyGroupsRepository },
    ...commands,
    ...handlers,
    ...queries,
    ...events,
  ],
})
export class GroupsModule {}
