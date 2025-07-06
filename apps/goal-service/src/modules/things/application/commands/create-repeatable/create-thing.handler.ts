import { THING_REPOSITORY, ThingsRepository } from '@/modules/things/application';
import { Priority, ThingCreatedEntity, ThingEntity } from '@/modules/things/domain';
import { AppDate, Name } from '@big-d/api-utils';
import { Inject, InternalServerErrorException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateThingCommand } from './create-thing.command';

@CommandHandler(CreateThingCommand)
export class CreateThingHandler implements ICommandHandler<CreateThingCommand> {
  constructor(
    @Inject(THING_REPOSITORY) private readonly thingsRepo: ThingsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ input }: CreateThingCommand): Promise<void> {
    const { name, description, userId, deadline, startDate, groupId, priority } = input;

    const draftThing = ThingEntity.create({
      name: Name.create(name),
      groupId,
      userId,
      description: description,
      deadline: deadline != null ? AppDate.create(deadline) : undefined,
      startDate: startDate != null ? AppDate.create(startDate) : undefined,
      priority: priority != null ? Priority.create(priority) : undefined,
    });

    const thing = await this.thingsRepo.create(draftThing);
    if (thing == null) {
      throw new InternalServerErrorException('Error occurred while creating thing');
    }

    this.eventBus.publish(new ThingCreatedEntity(thing.id));
  }
}
