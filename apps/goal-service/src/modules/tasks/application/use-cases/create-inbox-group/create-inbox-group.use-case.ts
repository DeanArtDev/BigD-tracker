import { DB } from '@/infrastructure/types';
import { GroupInboxView } from '@/modules/tasks/application/dto/group-inbox.view';
import { ExceptionInboxAlreadyExist } from '@/modules/tasks/application/exceptions';
import { Database } from '@/modules/tasks/infrastructure/database.interface';
import { GroupsToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { GroupsReadRepository, GroupsWriteRepository, INBOX_GROUP_KEY } from '../../ports';

@Injectable()
class CreateInboxGroupUseCase {
  constructor(
    @Inject(databaseToken.CONNECTION) private readonly db: Database<DB>,
    @Inject(GroupsToken.WRITE_REPOSITORY) private readonly groupsWriteRepo: GroupsWriteRepository,
    @Inject(GroupsToken.READ_REPOSITORY) private readonly groupReadRepo: GroupsReadRepository,
  ) {}

  async execute(input: { userId: number }): Promise<GroupInboxView> {
    return this.db.runTransaction(async (trx) => {
      const inboxGroup = await this.groupReadRepo.getByName(
        { name: INBOX_GROUP_KEY, userId: input.userId },
        trx,
      );

      if (inboxGroup != null) {
        throw new ExceptionInboxAlreadyExist({});
      }

      return await this.groupsWriteRepo.createInbox({ userId: input.userId });
    });
  }
}

export { CreateInboxGroupUseCase };
