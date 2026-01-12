import { RequestContextService } from '@/modules/tasks/infrastructure/observability';
import { GroupsRpcController } from './rpc/groups.rpc.controller';
import { Module } from '@nestjs/common';
import { GroupsInboxRpcController } from './rpc/groups-inbox.rpc.controller';
import { TasksInboxRpcController } from './rpc/tasks-inbox.rpc.controller';
import { TasksRpcController } from './rpc/tasks.rpc.controller';

@Module({
  controllers: [
    TasksRpcController,
    TasksInboxRpcController,
    GroupsInboxRpcController,
    GroupsRpcController,
  ],
  providers: [RequestContextService],
})
export class TasksPresentationModule {}
