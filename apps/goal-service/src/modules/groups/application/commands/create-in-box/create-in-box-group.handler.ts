import { GROUPS_REPOSITORY, GroupsRepository } from '@/modules/groups/application';
import { GroupEntity } from '@/modules/groups/domain';
import { Name } from '@big-d/api-utils';
import { Inject, InternalServerErrorException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IN_BOX_NAME } from './constants';
import { CreateInBoxGroupCommand } from './create-in-box-group.command';

@CommandHandler(CreateInBoxGroupCommand)
export class CreateInBoxGroupHandler implements ICommandHandler<CreateInBoxGroupCommand> {
  constructor(@Inject(GROUPS_REPOSITORY) private readonly groupsRepo: GroupsRepository) {}

  async execute({ input }: CreateInBoxGroupCommand): Promise<{ id: number }> {
    const { userId } = input;

    const draftGroup = GroupEntity.create({
      userId,
      position: 0,
      name: Name.create(IN_BOX_NAME),
    });

    const group = await this.groupsRepo.create(draftGroup);
    if (group == null) {
      throw new InternalServerErrorException('Error occurred while creating IN BOX group');
    }

    return { id: group.id };
  }
}
