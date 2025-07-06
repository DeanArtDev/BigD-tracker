import { THING_REPOSITORY, ThingsRepository } from '@/modules/things/application';
import { Priority, ThingRepeatableUpdatedEvent, WeekDays } from '@/modules/things/domain';
import { Name } from '@big-d/api-utils';
import { Inject, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UpdateRepeatableThingCommand } from './update-repeatable-thing.command';

@CommandHandler(UpdateRepeatableThingCommand)
export class UpdateRepeatableThingHandler implements ICommandHandler<UpdateRepeatableThingCommand> {
  constructor(
    @Inject(THING_REPOSITORY) private readonly thingsRepo: ThingsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ input }: UpdateRepeatableThingCommand): Promise<void> {
    const { id, name, description, userId, priority, weekDays } = input;

    const existed = await this.thingsRepo.findById({ id, userId });
    if (existed == null) {
      throw new NotFoundException(`Repeatable thing ${input.id} is not found`);
    }

    if (!existed.isRepeatable) {
      throw new InternalServerErrorException('This command update repeatable thing');
    }

    existed.changeName(Name.create(name));
    priority != null && existed.changePriority(Priority.create(priority));
    description != null && existed.changeDescription(description);
    weekDays != null && existed.changeWeekDays(WeekDays.create(weekDays));
    existed.validate();

    const thing = await this.thingsRepo.update(existed, { replace: true });
    if (thing == null) {
      throw new InternalServerErrorException('Error occurred while updating repeatable thing');
    }

    this.eventBus.publish(new ThingRepeatableUpdatedEvent(thing.id));
  }
}
