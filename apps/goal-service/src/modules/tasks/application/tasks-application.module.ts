import { GetGroupUserInboxHandler, GetInboxByUserIdQuery } from './queries';
import {
  GroupCheckerService,
  TaskCheckerService,
  TaskQueryService,
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
  AssignTaskToGroupCommand,
  AssignTaskToGroupHandler,
  AssignTaskToGroupUseCase,
  AssignTaskToInboxCommand,
  AssignTaskToInboxHandler,
  AssignTaskToInboxUseCase,
  UnassignTaskFromGroupCommand,
  UnassignTaskFromGroupHandler,
  UnassignTaskFromGroupUseCase,
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
  AssignTaskToGroupCommand,
  AssignTaskToInboxCommand,
  UnassignTaskFromGroupCommand,
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
  AssignTaskToGroupHandler,
  AssignTaskToInboxHandler,
  UnassignTaskFromGroupHandler,
];
const useCases = [
  CreateTaskUseCase,
  CreateTaskInInboxUseCase,
  CreateInboxGroupUseCase,
  UpdateInboxTaskUseCase,
  ReplaceTaskUseCase,
  SoftDeleteTaskUseCase,
  CloneTaskUseCase,
  AssignTaskToGroupUseCase,
  AssignTaskToInboxUseCase,
  UnassignTaskFromGroupUseCase,
];

@Module({
  imports: [TasksInfrastructureModule],
  providers: [
    TaskService,
    TaskCheckerService,
    GroupCheckerService,
    TaskQueryService,
    ...commands,
    ...queries,
    ...handlers,
    ...useCases,
  ],
})
export class TasksApplicationModule {}
