import { RequestContextService } from '@/modules/tasks/infrastructure/observability';
import { Module } from '@nestjs/common';
import { GroupsInboxRpcController } from './rpc/groups-inbox.rpc.controller';
import { TasksInboxRpcController } from './rpc/tasks-inbox.rpc.controller';
import { TasksRpcController } from './rpc/tasks.rpc.controller';

@Module({
  controllers: [TasksRpcController, TasksInboxRpcController, GroupsInboxRpcController],
  providers: [RequestContextService],
})
export class TasksPresentationModule {}
