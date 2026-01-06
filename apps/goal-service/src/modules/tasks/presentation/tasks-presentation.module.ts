import { RequestContextService } from '@/modules/tasks/infrastructure/observability';
import { Module } from '@nestjs/common';
import { TasksRpcController } from './rpc/tasks.rpc.controller';

@Module({
  controllers: [TasksRpcController],
  providers: [RequestContextService],
})
export class TasksPresentationModule {}
