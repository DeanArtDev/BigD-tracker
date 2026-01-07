import { DB } from '@/infrastructure/types';
import { ExceptionInboxNotExist } from '@/modules/tasks/application/exceptions';
import { GroupsReadRepository } from '@/modules/tasks/application/ports';
import { Database } from '@/modules/tasks/infrastructure/database.interface';
import { GroupsToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GroupInboxView } from '../../dto/group-inbox.view';
import { GetInboxByUserIdQuery } from './get-inbox-by-user-id.query';

@QueryHandler(GetInboxByUserIdQuery)
export class GetGroupUserInboxHandler implements IQueryHandler<GetInboxByUserIdQuery> {
  constructor(
    @Inject(databaseToken.CONNECTION) private readonly db: Database<DB>,
    @Inject(GroupsToken.READ_REPOSITORY) private readonly groupsReadRepo: GroupsReadRepository,
  ) {}

  async execute({ input }: GetInboxByUserIdQuery): Promise<GroupInboxView> {
    return this.db.runTransaction(async (trx) => {
      const inBox = await this.groupsReadRepo.getInboxWithTasksByUserId(
        { userId: input.userId },
        trx,
      );
      if (inBox == null) {
        throw new ExceptionInboxNotExist({});
      }
      return inBox;
    });
  }
}
