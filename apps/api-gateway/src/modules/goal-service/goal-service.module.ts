import { GoalServiceClientProxy } from '@/infrastructure/rmq-clients';
import { CreateGroupSage } from '@/modules/goal-service/application/sages';
import { Module } from '@nestjs/common';
import { GoalsController } from './application/goals.controller';
import { GroupsController } from './application/groups.controller';
import { ThingsController } from './application/things.controller';

@Module({
  controllers: [GoalsController, GroupsController, ThingsController],
  providers: [CreateGroupSage, GoalServiceClientProxy],
})
export class GoalServiceModule {}
