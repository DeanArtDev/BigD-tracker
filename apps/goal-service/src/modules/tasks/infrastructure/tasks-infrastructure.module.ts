import { GroupsToken, TasksToken } from '@/modules/tasks/tokens';
import { Module } from '@nestjs/common';
import {
  GroupInboxReadRepositoryKysely,
  GroupsReadRepositoryKysely,
  TasksReadRepositoryKysely,
} from './persistence/kysely/repositories/read';
import {
  GroupInboxWriteRepositoryKysely,
  GroupWriteRepositoryKysely,
  TasksWriteRepositoryKysely,
} from './persistence/kysely/repositories/write';

@Module({
  exports: [
    TasksToken.WRITE_REPOSITORY,
    TasksToken.READ_REPOSITORY,

    GroupsToken.READ_REPOSITORY,
    GroupsToken.WRITE_REPOSITORY,

    GroupsToken.INBOX_WRITE_REPOSITORY,
    GroupsToken.INBOX_READ_REPOSITORY,
  ],
  providers: [
    { provide: GroupsToken.INBOX_READ_REPOSITORY, useClass: GroupInboxReadRepositoryKysely },
    { provide: GroupsToken.INBOX_WRITE_REPOSITORY, useClass: GroupInboxWriteRepositoryKysely },

    { provide: GroupsToken.WRITE_REPOSITORY, useClass: GroupWriteRepositoryKysely },
    { provide: GroupsToken.READ_REPOSITORY, useClass: GroupsReadRepositoryKysely },

    { provide: TasksToken.WRITE_REPOSITORY, useClass: TasksWriteRepositoryKysely },
    { provide: TasksToken.READ_REPOSITORY, useClass: TasksReadRepositoryKysely },
  ],
})
export class TasksInfrastructureModule {}
