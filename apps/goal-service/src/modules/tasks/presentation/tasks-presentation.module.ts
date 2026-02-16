import { Module } from '@nestjs/common';
import { CursorPaginationService } from '@shared/cursor-pagination';
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
  providers: [CursorPaginationService],
})
export class TasksPresentationModule {}
