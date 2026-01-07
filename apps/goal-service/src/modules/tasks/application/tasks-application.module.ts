import { GetGroupUserInboxHandler, GetInboxByUserIdQuery } from './queries';
import { GroupsService, TaskServices } from '@/modules/tasks/application/services';
import { Module } from '@nestjs/common';
import { TasksInfrastructureModule } from '@/modules/tasks/infrastructure/tasks-infrastructure.module';
import {
  CreateTaskCommand,
  CreateTaskUseCase,
  CreateTaskHandler,
  CreateTaskInInboxUseCase,
  CreateTaskInInboxHandler,
  CreateTaskInInboxCommand,
  CreateInboxGroupCommand,
  CreateInboxGroupHandler,
  CreateInboxGroupUseCase,
  ReplaceTaskCommand,
  ReplaceTaskHandler,
  ReplaceTaskUseCase,
} from './use-cases';

const queries = [GetInboxByUserIdQuery];
const commands = [
  CreateTaskCommand,
  CreateTaskInInboxCommand,
  CreateInboxGroupCommand,
  ReplaceTaskCommand,
];
const handlers = [
  CreateTaskHandler,
  CreateTaskInInboxHandler,
  CreateInboxGroupHandler,
  GetGroupUserInboxHandler,
  ReplaceTaskHandler,
];
const useCases = [
  CreateTaskUseCase,
  CreateTaskInInboxUseCase,
  CreateInboxGroupUseCase,
  ReplaceTaskUseCase,
];

@Module({
  imports: [TasksInfrastructureModule],
  providers: [TaskServices, GroupsService, ...commands, ...queries, ...handlers, ...useCases],
})
export class TasksApplicationModule {}
