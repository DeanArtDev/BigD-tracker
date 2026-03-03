import { ExceptionInboxNotExist } from '@/modules/tasks/application/exceptions';
import { GroupsToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GroupInboxView } from '../../dto/group-inbox.view';
import { TaskDatabase, GroupInboxReadRepository } from '../../ports';
import { GetInboxByUserIdQuery } from './get-inbox-by-user-id.query';

@QueryHandler(GetInboxByUserIdQuery)
export class GetGroupUserInboxHandler implements IQueryHandler<GetInboxByUserIdQuery> {
  constructor(
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,

    @Inject(GroupsToken.INBOX_READ_REPOSITORY)
    private readonly inboxReadRepo: GroupInboxReadRepository,
  ) {}

  async execute({ input }: GetInboxByUserIdQuery): Promise<GroupInboxView> {
    return this.db.runTransaction(async (trx) => {
      const inbox = await this.inboxReadRepo.getInboxWithTasksByUserId({ userId: input.userId }, trx);

      if (inbox == null) {
        throw new ExceptionInboxNotExist({});
      }

      return inbox;
    });
  }
}
