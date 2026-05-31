import { GoalServiceClientModule } from '@/infrastructure/rmq-clients/clients';
import { Module } from '@nestjs/common';
import { GroupsController } from './groups';
import { GroupsResolver } from './groups/presentation/graphql';
import { TasksController, TasksInboxController } from './tasks';

@Module({
  providers: [GroupsResolver],
  imports: [GoalServiceClientModule],
  controllers: [GroupsController, TasksController, TasksInboxController],
})
export class GoalServiceModule {}
