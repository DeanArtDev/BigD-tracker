import { RequestContextService } from './services/request-context.service';
import { Module } from '@nestjs/common';
import { TasksRpcController } from './rpc/tasks.rpc.controller';

@Module({
  controllers: [TasksRpcController],
  providers: [RequestContextService],
})
export class TasksPresentationModule {}
