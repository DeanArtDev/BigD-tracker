import { GetGroupUserInboxHandler, GetInboxByUserIdQuery } from './queries';
import {
  GroupCheckerService,
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
  SoftDeleteTaskCommand,
  SoftDeleteTaskHandler,
  SoftDeleteTaskUseCase,
  CloneTaskCommand,
  CloneTaskHandler,
  CloneTaskUseCase,
} from './use-cases';

const queries = [GetInboxByUserIdQuery];
const commands = [
  CreateTaskCommand,
  CreateTaskInInboxCommand,
  CreateInboxGroupCommand,
  UpdateInboxTaskCommand,
  ReplaceTaskCommand,
  SoftDeleteTaskCommand,
  CloneTaskCommand,
];
const handlers = [
  CreateTaskHandler,
  CreateTaskInInboxHandler,
  CreateInboxGroupHandler,
  GetGroupUserInboxHandler,
  UpdateInboxTaskHandler,
  ReplaceTaskHandler,
  SoftDeleteTaskHandler,
  CloneTaskHandler,
];
const useCases = [
  CreateTaskUseCase,
  CreateTaskInInboxUseCase,
  CreateInboxGroupUseCase,
  UpdateInboxTaskUseCase,
  ReplaceTaskUseCase,
  SoftDeleteTaskUseCase,
  CloneTaskUseCase,
];

@Module({
  imports: [TasksInfrastructureModule],
  providers: [
    TaskService,
    TaskCheckerService,
    GroupCheckerService,
    ...commands,
    ...queries,
    ...handlers,
    ...useCases,
  ],
})
export class TasksApplicationModule {}
