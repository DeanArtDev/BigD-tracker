import { GROUPS_REPOSITORY, GroupsRepository } from '@/modules/groups/application';
import { GroupUpdatedEvent } from '@/modules/groups/domain';
import { Name } from '@big-d/api-utils';
import { Inject, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UpdateGroupCommand } from './update-group.command';

@CommandHandler(UpdateGroupCommand)
export class UpdateGroupHandler implements ICommandHandler<UpdateGroupCommand> {
  constructor(
    @Inject(GROUPS_REPOSITORY) private readonly groupsRepo: GroupsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ input }: UpdateGroupCommand): Promise<void> {
    const { id, name, description, userId, position } = input;

    const existed = await this.groupsRepo.findById({ id, userId });
    if (existed == null) {
      throw new NotFoundException(`Group ${input.id} is not found`);
    }

    if (existed.isPredefined) {
      throw new InternalServerErrorException('Predefined group can not be updated');
    }

    existed.setName(Name.create(name));
    existed.setPosition(position);
    existed.setDescription(description);
    existed.validate();

    const group = await this.groupsRepo.update(existed, { replace: true });
    if (group == null) {
      throw new InternalServerErrorException('Error occurred while updating group');
    }

    this.eventBus.publish(new GroupUpdatedEvent(group.id));
  }
}
