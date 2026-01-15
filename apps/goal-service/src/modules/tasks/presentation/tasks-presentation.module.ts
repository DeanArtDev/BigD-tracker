import { RequestContextService } from '@/modules/tasks/infrastructure/observability';
import { Module } from '@nestjs/common';
import { GroupsInboxRmqController } from './rmq/groups-inbox.rmq.controller';
import { GroupsRmqController } from './rmq/groups.rmq.controller';
import { TasksInboxRmqController } from './rmq/tasks-inbox.rmq.controller';
import { TasksRmqController } from './rmq/tasks.rmq.controller';

@Module({
  controllers: [
    TasksRmqController,
    TasksInboxRmqController,
    GroupsInboxRmqController,
    GroupsRmqController,
  ],
  providers: [RequestContextService],
})
export class TasksPresentationModule {}
