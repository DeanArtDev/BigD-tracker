import { GOALS_REPOSITORY, GoalsRepository } from '@/modules/goals/application';
import { GoalCreatedEvent, GoalEntity } from '@/modules/goals/domain';
import { Name } from '@big-d/api-utils';
import { Inject, InternalServerErrorException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateGoalCommand } from './create-goal.command';

@CommandHandler(CreateGoalCommand)
export class CreateGoalHandler implements ICommandHandler<CreateGoalCommand> {
  constructor(
    @Inject(GOALS_REPOSITORY) private readonly goalsRepo: GoalsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ input }: CreateGoalCommand): Promise<{ id: number }> {
    const { name, description, userId } = input;

    const draftGoal = GoalEntity.create({
      name: Name.create(name),
      description,
      userId,
    });

    const goal = await this.goalsRepo.create(draftGoal);
    if (goal == null) {
      throw new InternalServerErrorException('Error occurred while creating goal');
    }

    this.eventBus.publish(new GoalCreatedEvent(goal.id));

    return { id: goal.id };
  }
}
