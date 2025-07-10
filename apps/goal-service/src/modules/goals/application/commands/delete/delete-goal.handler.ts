import { GOALS_REPOSITORY, GoalsRepository } from '@/modules/goals/application';
import { GoalDeletedEvent } from '@/modules/goals/domain';
import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DeleteGoalCommand } from './delete-goal.command';

@CommandHandler(DeleteGoalCommand)
export class DeleteGoalHandler implements ICommandHandler<DeleteGoalCommand> {
  constructor(
    @Inject(GOALS_REPOSITORY) private readonly goalsRepo: GoalsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ input }: DeleteGoalCommand): Promise<boolean> {
    const existed = await this.goalsRepo.findById(input);
    if (existed == null) {
      throw new NotFoundException(`Goal: ${input.id} is not existed`);
    }

    const isDeleted = await this.goalsRepo.delete({ id: input.id, userId: input.userId });
    if (isDeleted) {
      this.eventBus.publish(new GoalDeletedEvent(input.id));
    }

    return isDeleted;
  }
}
