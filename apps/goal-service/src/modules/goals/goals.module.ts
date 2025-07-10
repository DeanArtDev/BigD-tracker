import {
  GOALS_REPOSITORY,
  GoalsCommandController,
  GoalsMapper,
  GoalsQueryController,
} from '@/modules/goals/application';
import {
  DeleteGoalCommand,
  CreateGoalCommand,
  UpdateGoalCommand,
  CreateGoalHandler,
  DeleteGoalHandler,
  UpdateGoalHandler,
} from '@/modules/goals/application/commands';
import {
  GetAllGoalsByUserIdHandler,
  GetAllGoalsByUserIdQuery,
  GetGoalByIdHandler,
  GetGoalByIdQuery,
} from '@/modules/goals/application/queries';
import { StartGoalUseCase, FinishGoalUseCase } from '@/modules/goals/application/use-cases';
import { GoalCreatedEvent, GoalDeletedEvent, GoalUpdatedEvent } from '@/modules/goals/domain';
import { SyncCollectionRepository } from '@big-d/api-utils';
import { Module } from '@nestjs/common';
import { KyselyGoalsRepository } from './infra/kysely-goals.repository';

const useCases = [StartGoalUseCase, FinishGoalUseCase];
const commands = [DeleteGoalCommand, CreateGoalCommand, UpdateGoalCommand];
const handlers = [
  GetGoalByIdHandler,
  GetAllGoalsByUserIdHandler,
  CreateGoalHandler,
  DeleteGoalHandler,
  UpdateGoalHandler,
];
const queries = [GetAllGoalsByUserIdQuery, GetGoalByIdQuery];
const events = [GoalCreatedEvent, GoalUpdatedEvent, GoalDeletedEvent];

@Module({
  controllers: [GoalsQueryController, GoalsCommandController],
  providers: [
    GoalsMapper,
    SyncCollectionRepository,
    { provide: GOALS_REPOSITORY, useClass: KyselyGoalsRepository },
    ...commands,
    ...handlers,
    ...queries,
    ...events,
    ...useCases,
  ],
})
export class GoalsModule {}
