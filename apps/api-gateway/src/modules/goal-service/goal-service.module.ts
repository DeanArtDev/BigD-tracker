import { GoalServiceClientModule } from '@/infrastructure/rmq-clients/clients';
import { Module } from '@nestjs/common';
import { GroupsController } from './groups';
import { GroupInboxResolver, GroupsResolver } from './groups/presentation/graphql';
import { TasksController, TasksInboxController } from './tasks';
import { TasksResolver } from './tasks/presentation/graphql';

@Module({
  providers: [GroupInboxResolver, TasksResolver, GroupsResolver],
  imports: [GoalServiceClientModule],
  controllers: [GroupsController, TasksController, TasksInboxController],
})
export class GoalServiceModule {}
