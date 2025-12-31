import { TasksRepositoryKysely } from './persistence/kysely/repositories/tasks.repository.kysely';
import { TasksToken } from '@/modules/tasks/tasks.tokens';
import { Module } from '@nestjs/common';

@Module({
  exports: [TasksToken.REPOSITORY],
  providers: [{ provide: TasksToken.REPOSITORY, useClass: TasksRepositoryKysely }],
})
export class TasksInfrastructureModule {}
