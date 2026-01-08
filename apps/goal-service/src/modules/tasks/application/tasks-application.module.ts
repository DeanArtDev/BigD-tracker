import { GetGroupUserInboxHandler, GetInboxByUserIdQuery } from './queries';
import {
  GroupCheckerService,
  GroupsService,
  TaskCheckerService,
  TaskService,
} from '@/modules/tasks/application/services';
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
  UpdateInboxTaskCommand,
  UpdateInboxTaskHandler,
  UpdateInboxTaskUseCase,
  ReplaceTaskCommand,
  ReplaceTaskHandler,
  ReplaceTaskUseCase,
} from './use-cases';

const queries = [GetInboxByUserIdQuery];
const commands = [
  CreateTaskCommand,
  CreateTaskInInboxCommand,
  CreateInboxGroupCommand,
  UpdateInboxTaskCommand,
  ReplaceTaskCommand,
];
const handlers = [
  CreateTaskHandler,
  CreateTaskInInboxHandler,
  CreateInboxGroupHandler,
  GetGroupUserInboxHandler,
  UpdateInboxTaskHandler,
  ReplaceTaskHandler,
];
const useCases = [
  CreateTaskUseCase,
  CreateTaskInInboxUseCase,
  CreateInboxGroupUseCase,
  UpdateInboxTaskUseCase,
  ReplaceTaskUseCase,
];

@Module({
  imports: [TasksInfrastructureModule],
  providers: [
    TaskService,
    GroupsService,
    TaskCheckerService,
    GroupCheckerService,
    ...commands,
    ...queries,
    ...handlers,
    ...useCases,
  ],
})
export class TasksApplicationModule {}
