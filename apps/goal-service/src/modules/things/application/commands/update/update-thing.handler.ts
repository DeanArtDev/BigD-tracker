import { THING_REPOSITORY, ThingsRepository } from '@/modules/things/application';
import { Priority, ThingUpdatedEvent } from '@/modules/things/domain';
import { DateVo, Name } from '@big-d/api-utils';
import { Inject, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UpdateThingCommand } from './update-thing.command';

@CommandHandler(UpdateThingCommand)
export class UpdateThingHandler implements ICommandHandler<UpdateThingCommand> {
  constructor(
    @Inject(THING_REPOSITORY) private readonly thingsRepo: ThingsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ input }: UpdateThingCommand): Promise<void> {
    const { id, name, description, userId, groupId, priority, startDate, deadline } = input;

    const existed = await this.thingsRepo.findById({ id, userId });
    if (existed == null) {
      throw new NotFoundException(`Thing ${input.id} is not found`);
    }

    if (existed.isRepeatable) {
      throw new InternalServerErrorException('This command update non-repeatable thing');
    }

    existed.changeGroup(groupId);
    existed.changeName(Name.create(name));
    startDate != null && existed.changeStartDate(DateVo.create(startDate));
    deadline != null && existed.changeDeadline(DateVo.create(deadline));
    priority != null && existed.changePriority(Priority.create(priority));
    description != null && existed.changeDescription(description);
    existed.validate();

    const thing = await this.thingsRepo.update(existed, { replace: true });
    if (thing == null) {
      throw new InternalServerErrorException('Error occurred while updating thing');
    }

    this.eventBus.publish(new ThingUpdatedEvent(thing.id));
  }
}
