import { THING_REPOSITORY, ThingsRepository } from '@/modules/things/application';
import { Result, ThingFinishedEvent } from '@/modules/things/domain';
import { DateVo } from '@big-d/api-utils';
import { Inject, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { FinishThingCommand } from './finish-thing.command';

@CommandHandler(FinishThingCommand)
export class FinishThingHandler implements ICommandHandler<FinishThingCommand> {
  constructor(
    @Inject(THING_REPOSITORY) private readonly thingsRepo: ThingsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ input }: FinishThingCommand): Promise<void> {
    const { userId, comment, endDate, result, id } = input;

    const existed = await this.thingsRepo.findById({ id, userId });
    if (existed == null) {
      throw new NotFoundException(`Thing: ${id} is not existed`);
    }

    existed
      .finish({
        comment,
        endDate: DateVo.create(endDate),
        result: Result.create(result),
      })
      .validate();

    const thing = await this.thingsRepo.update(existed);
    if (thing == null) {
      throw new InternalServerErrorException('Error occurred while finishing thing');
    }

    this.eventBus.publish(new ThingFinishedEvent(input.id));
  }
}
