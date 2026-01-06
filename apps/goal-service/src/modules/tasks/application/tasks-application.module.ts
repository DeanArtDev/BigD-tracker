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
} from './use-cases';

const commands = [CreateTaskCommand, CreateTaskInInboxCommand, CreateInboxGroupCommand];
const handlers = [CreateTaskHandler, CreateTaskInInboxHandler, CreateInboxGroupHandler];
const useCases = [CreateTaskUseCase, CreateTaskInInboxUseCase, CreateInboxGroupUseCase];

@Module({
  imports: [TasksInfrastructureModule],
  providers: [TaskServices, GroupsService, ...commands, ...handlers, ...useCases],
})
export class TasksApplicationModule {}
