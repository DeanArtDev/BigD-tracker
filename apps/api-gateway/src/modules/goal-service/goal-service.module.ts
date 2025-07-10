import { Module } from '@nestjs/common';
import { GoalsController } from './application/goals.controller';
import { GroupsController } from './application/groups.controller';
import { ThingsController } from './application/things.controller';

@Module({
  controllers: [GoalsController, GroupsController, ThingsController],
})
export class GoalServiceModule {}
