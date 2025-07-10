import { THINGS_REPOSITORY, ThingsRepository } from '@/modules/things/application';
import {
  Priority,
  ThingEntity,
  ThingRepeatableCreatedEvent,
  WeekDays,
} from '@/modules/things/domain';
import { Name } from '@big-d/api-utils';
import { Inject, InternalServerErrorException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateRepeatableThingCommand } from './create-repeatable-thing.command';

@CommandHandler(CreateRepeatableThingCommand)
export class CreateRepeatableThingHandler implements ICommandHandler<CreateRepeatableThingCommand> {
  constructor(
    @Inject(THINGS_REPOSITORY) private readonly thingsRepo: ThingsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ input }: CreateRepeatableThingCommand): Promise<void> {
    const { name, description, userId, weekDays, groupId, priority } = input;

    const draftThing = ThingEntity.createRepeatable({
      userId,
      name: Name.create(name),
      groupId: groupId,
      description: description,
      priority: priority != null ? Priority.create(priority) : undefined,
      weekDays: WeekDays.create(weekDays),
    });

    const thing = await this.thingsRepo.create(draftThing);
    if (thing == null) {
      throw new InternalServerErrorException('Error occurred while creating repeatable thing');
    }

    this.eventBus.publish(new ThingRepeatableCreatedEvent(thing.id));
  }
}
