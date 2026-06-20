import { GoalServiceClientModule } from '@/infrastructure/rmq-clients/clients';
import { Module } from '@nestjs/common';
import { GroupsController } from './groups';
import { GroupInboxResolver, GroupsResolver } from './groups/presentation/graphql';
import { TasksController, TasksInboxController } from './tasks';
import { TasksMutationsResolver, TasksQueriesResolver } from './tasks/presentation/graphql';

@Module({
  providers: [GroupInboxResolver, TasksMutationsResolver, TasksQueriesResolver, GroupsResolver],
  imports: [GoalServiceClientModule],
  controllers: [GroupsController, TasksController, TasksInboxController],
})
export class GoalServiceModule {}
