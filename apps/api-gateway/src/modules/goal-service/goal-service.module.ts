import { GoalServiceClientModule } from '@/infrastructure/rmq-clients/clients';
import { Module } from '@nestjs/common';
import { GroupsController } from './groups';
import { TasksController, TasksInboxController } from './tasks';

@Module({
  imports: [GoalServiceClientModule],
  controllers: [GroupsController, TasksController, TasksInboxController],
})
export class GoalServiceModule {}
