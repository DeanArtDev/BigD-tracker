import { THINGS_REPOSITORY, ThingsRepository } from '@/modules/things/application';
import { ThingDeletedEntity } from '@/modules/things/domain';
import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DeleteThingByGroupIdCommand, DeleteThingCommand } from './delete-thing.command';

@CommandHandler(DeleteThingCommand)
export class DeleteThingHandler implements ICommandHandler<DeleteThingCommand> {
  constructor(
    @Inject(THINGS_REPOSITORY) private readonly thingsRepo: ThingsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ input }: DeleteThingCommand): Promise<boolean> {
    const existed = await this.thingsRepo.findById(input);
    if (existed == null) {
      throw new NotFoundException(`Thing: ${input.id} is not existed`);
    }

    const isDeleted = await this.thingsRepo.delete({ id: input.id, userId: input.userId });
    if (isDeleted) {
      this.eventBus.publish(new ThingDeletedEntity(input.id));
    }

    return isDeleted;
  }
}

@CommandHandler(DeleteThingByGroupIdCommand)
export class DeleteThingByGroupIdHandler implements ICommandHandler<DeleteThingByGroupIdCommand> {
  constructor(
    @Inject(THINGS_REPOSITORY) private readonly thingsRepo: ThingsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ input }: DeleteThingByGroupIdCommand): Promise<{ deletedRows: number }> {
    const existed = await this.thingsRepo.findByGroupId({
      groupId: input.groupId,
      userId: input.userId,
    });
    if (existed.length === 0) return { deletedRows: 0 };

    const deletedRows = await this.thingsRepo.deleteByGroupId({
      groupIds: [input.groupId],
      userId: input.userId,
    });

    for (const thingEntity of existed) {
      this.eventBus.publish(new ThingDeletedEntity(thingEntity.id));
    }

    return { deletedRows };
  }
}
