import { GoalServiceClientModule } from '@/infrastructure/rmq-clients';
import { Module } from '@nestjs/common';
import { PlannerPreflightResolver } from './graphql/planner-preflight.resolver';

@Module({
  providers: [PlannerPreflightResolver],
  imports: [GoalServiceClientModule],
})
export class PlannerModule {}
