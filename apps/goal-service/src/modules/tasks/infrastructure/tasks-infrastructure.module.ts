import { GroupsToken, TasksToken } from '@/modules/tasks/tokens';
import { Module } from '@nestjs/common';
import {
  GroupsReadRepositoryKysely,
  TasksReadRepositoryKysely,
} from './persistence/kysely/repositories/read';
import { TasksWriteRepositoryKysely } from './persistence/kysely/repositories/write';

@Module({
  exports: [TasksToken.WRITE_REPOSITORY, TasksToken.READ_REPOSITORY, GroupsToken.READ_REPOSITORY],
  providers: [
    { provide: GroupsToken.READ_REPOSITORY, useClass: GroupsReadRepositoryKysely },
    { provide: TasksToken.WRITE_REPOSITORY, useClass: TasksWriteRepositoryKysely },
    {
      provide: TasksToken.READ_REPOSITORY,
      useClass: TasksReadRepositoryKysely,
    },
  ],
})
export class TasksInfrastructureModule {}
