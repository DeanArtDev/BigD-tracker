import { GroupInboxView } from '@/modules/tasks/application/dto';
import { ExceptionInboxAlreadyExist } from '@/modules/tasks/application/exceptions';
import { GroupsToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { TaskDatabase, GroupInboxReadRepository, GroupInboxWriteRepository } from '../../ports';

@Injectable()
class CreateInboxGroupUseCase {
  constructor(
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,

    @Inject(GroupsToken.INBOX_WRITE_REPOSITORY)
    private readonly inboxWriteRepo: GroupInboxWriteRepository,

    @Inject(GroupsToken.INBOX_READ_REPOSITORY)
    private readonly inboxReadRepo: GroupInboxReadRepository,
  ) {}

  async execute(input: { userId: number }): Promise<GroupInboxView> {
    return this.db.runTransaction(async (trx) => {
      const inboxGroup = await this.inboxReadRepo.getInboxWithTasksByUserId({ userId: input.userId }, trx);

      if (inboxGroup != null) {
        throw new ExceptionInboxAlreadyExist({});
      }

      return await this.inboxWriteRepo.createInbox({ userId: input.userId }, trx);
    });
  }
}

export { CreateInboxGroupUseCase };
