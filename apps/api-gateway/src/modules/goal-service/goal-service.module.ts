import { GoalServiceClientModule } from '@/infrastructure/rmq-clients/clients';
import { Module } from '@nestjs/common';
import { GroupsController } from './groups';
import { GroupInboxResolver, GroupsMutationsResolver, GroupsQueriesResolver } from './groups/presentation/graphql';
import { TasksController, TasksInboxController } from './tasks';
import { TasksMutationsResolver, TasksQueriesResolver } from './tasks/presentation/graphql';

@Module({
  providers: [
    GroupInboxResolver,
    GroupsMutationsResolver,
    TasksMutationsResolver,
    TasksQueriesResolver,
    GroupsQueriesResolver,
  ],
  imports: [GoalServiceClientModule],
  controllers: [GroupsController, TasksController, TasksInboxController],
})
export class GoalServiceModule {}
