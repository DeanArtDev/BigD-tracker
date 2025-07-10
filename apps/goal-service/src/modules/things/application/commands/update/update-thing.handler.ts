import { THINGS_REPOSITORY, ThingsRepository } from '@/modules/things/application';
import { Priority, ThingUpdatedEvent } from '@/modules/things/domain';
import { DateVo, Name } from '@big-d/api-utils';
import { Inject, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UpdateThingCommand } from './update-thing.command';

@CommandHandler(UpdateThingCommand)
export class UpdateThingHandler implements ICommandHandler<UpdateThingCommand> {
  constructor(
    @Inject(THINGS_REPOSITORY) private readonly thingsRepo: ThingsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ input }: UpdateThingCommand): Promise<void> {
    const { id, name, description, userId, priority, position, startDate, deadline } = input;

    const existed = await this.thingsRepo.findById({ id, userId });
    if (existed == null) {
      throw new NotFoundException(`Thing ${input.id} is not found`);
    }

    if (existed.isRepeatable) {
      throw new InternalServerErrorException('This command update non-repeatable thing');
    }

    existed.changeName(Name.create(name));
    existed.changePosition(position);
    existed.changeDescription(description);
    existed.changeStartDate(startDate != null ? DateVo.create(startDate) : undefined);
    existed.changeDeadline(deadline != null ? DateVo.create(deadline) : undefined);
    existed.changePriority(priority != null ? Priority.create(priority) : undefined);
    existed.validate();

    const thing = await this.thingsRepo.update(existed, { replace: true });
    if (thing == null) {
      throw new InternalServerErrorException('Error occurred while updating thing');
    }

    this.eventBus.publish(new ThingUpdatedEvent(thing.id));
  }
}
