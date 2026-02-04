import { GroupView } from '@/modules/tasks/application/dto';
import { ExceptionGroupNotFound } from '@/modules/tasks/application/exceptions';
import {
  GroupById,
  GroupByUserId,
  GroupInbox,
  groupsCombinators,
} from '@/modules/tasks/application/specifications';
import { GroupsReadRepository, GroupsWriteRepository, TaskTransaction } from '../ports';
import { GroupFactory } from '@/modules/tasks/domain/aggregates/group';
import { SanitizeHtmlAdapter } from '@/modules/tasks/infrastructure/sanitizers';
import { GroupsToken } from '@/modules/tasks/tokens';
import { Inject, Injectable } from '@nestjs/common';

interface CreateGroupInput {
  readonly name: string;
  readonly userId: number;
  readonly description?: string;
}

const { and, not } = groupsCombinators;

@Injectable()
class GroupsService {
  constructor(
    @Inject(GroupsToken.WRITE_REPOSITORY) private readonly groupsWriteRepo: GroupsWriteRepository,
    @Inject(GroupsToken.READ_REPOSITORY) private readonly groupReadRepo: GroupsReadRepository,
  ) {}

  async createGroup(input: CreateGroupInput, trx?: TaskTransaction): Promise<GroupView> {
    const groupDraft = new GroupFactory({ sanitizer: new SanitizeHtmlAdapter() }).create(input);
    const group = await this.groupsWriteRepo.createGroup(groupDraft, trx);
    const groupView = await this.groupReadRepo.getGroup(
      and(GroupById(group.id), GroupByUserId(input.userId), not(GroupInbox())),
      trx,
    );

    if (groupView == null) {
      throw new ExceptionGroupNotFound({ groupId: group.id });
    }

    return groupView;
  }
}

export { GroupsService };
