import { GOALS_REPOSITORY, GoalsRepository } from '@/modules/goals/application';
import { GoalUpdatedEvent } from '@/modules/goals/domain';
import { Name } from '@big-d/api-utils';
import { Inject, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UpdateGoalCommand } from './update-goal.command';

@CommandHandler(UpdateGoalCommand)
export class UpdateGoalHandler implements ICommandHandler<UpdateGoalCommand> {
  constructor(
    @Inject(GOALS_REPOSITORY) private readonly goalsRepo: GoalsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ input }: UpdateGoalCommand): Promise<{ id: number }> {
    const { id, name, description, userId } = input;

    const existed = await this.goalsRepo.findById({ id, userId });
    if (existed == null) {
      throw new NotFoundException(`Goal: ${input.id} is not existed`);
    }

    existed.setName(Name.create(name));
    existed.setDescription(description).validate();

    const goal = await this.goalsRepo.update(existed);
    if (goal == null) {
      throw new InternalServerErrorException('Error occurred while creating goal');
    }

    this.eventBus.publish(new GoalUpdatedEvent(goal.id));

    return { id: goal.id };
  }
}
