import { GROUPS_REPOSITORY, GroupsRepository } from '@/modules/groups/application';
import { GroupCreatedEvent, GroupEntity } from '@/modules/groups/domain';
import { Name } from '@big-d/api-utils';
import { Inject, InternalServerErrorException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateGroupCommand } from './create-group.command';

@CommandHandler(CreateGroupCommand)
export class CreateGroupHandler implements ICommandHandler<CreateGroupCommand> {
  constructor(
    @Inject(GROUPS_REPOSITORY) private readonly groupsRepo: GroupsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ input }: CreateGroupCommand): Promise<{ id: number }> {
    const { name, description, userId, position, goalId } = input;

    const draftGroup = GroupEntity.create({
      name: Name.create(name),
      goalId,
      userId,
      description,
      position,
    });

    const group = await this.groupsRepo.create(draftGroup);
    if (group == null) {
      throw new InternalServerErrorException('Error occurred while creating group');
    }

    this.eventBus.publish(new GroupCreatedEvent(group.id));

    return { id: group.id };
  }
}
