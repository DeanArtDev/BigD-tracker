import { GROUPS_REPOSITORY, GroupsRepository } from '@/modules/groups/application';
import { GroupDeletedEvent } from '@/modules/groups/domain';
import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DeleteGroupCommand } from './delete-group.command';

@CommandHandler(DeleteGroupCommand)
export class DeleteGroupHandler implements ICommandHandler<DeleteGroupCommand> {
  constructor(
    @Inject(GROUPS_REPOSITORY) private readonly groupsRepo: GroupsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ input }: DeleteGroupCommand): Promise<boolean> {
    const existed = await this.groupsRepo.findById(input);
    if (existed == null) {
      throw new NotFoundException(`Group: ${input.id} is not existed`);
    }

    const isDeleted = await this.groupsRepo.delete({ id: input.id, userId: input.userId });
    if (isDeleted) {
      this.eventBus.publish(new GroupDeletedEvent(input.id));
    }

    return isDeleted;
  }
}
