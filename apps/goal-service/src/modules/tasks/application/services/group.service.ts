import { DB } from '@/infrastructure/types';
import { GroupView } from '@/modules/tasks/application/dto';
import { ExceptionGroupNotFound } from '@/modules/tasks/application/exceptions';
import { GroupsReadRepository, GroupsWriteRepository } from '@/modules/tasks/application/ports';
import { GroupFactory } from '@/modules/tasks/domain/aggregates/group';
import { SanitizeHtmlAdapter } from '@/modules/tasks/infrastructure/sanitizers';
import { GroupsToken } from '@/modules/tasks/tokens';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';

interface CreateGroupInput {
  readonly name: string;
  readonly userId: number;
  readonly description?: string;
}

@Injectable()
class GroupsService {
  constructor(
    @Inject(GroupsToken.WRITE_REPOSITORY) private readonly groupsWriteRepo: GroupsWriteRepository,
    @Inject(GroupsToken.READ_REPOSITORY) private readonly groupReadRepo: GroupsReadRepository,
  ) {}

  async createGroup(input: CreateGroupInput, trx?: Transaction<DB>): Promise<GroupView> {
    const groupDraft = new GroupFactory({ sanitizer: new SanitizeHtmlAdapter() }).create(input);
    const group = await this.groupsWriteRepo.createGroup(groupDraft, trx);
    const groupView = await this.groupReadRepo.getGroupById(
      { groupId: group.id, userId: input.userId },
      { trx },
    );

    if (groupView == null) {
      throw new ExceptionGroupNotFound({ groupId: group.id });
    }

    return groupView;
  }
}

export { GroupsService };
