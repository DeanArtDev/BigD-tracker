import { Module } from '@nestjs/common';
import { TasksInfrastructureModule } from '@/modules/tasks/infrastructure/tasks-infrastructure.module';
import { CreateTaskCommand, CreateTaskUseCase, CreateThingHandler } from './use-cases';

const commands = [CreateTaskCommand];
const handlers = [CreateThingHandler];
const useCases = [CreateTaskUseCase];

@Module({
  imports: [TasksInfrastructureModule],
  providers: [...commands, ...handlers, ...useCases],
})
export class TasksApplicationModule {}
