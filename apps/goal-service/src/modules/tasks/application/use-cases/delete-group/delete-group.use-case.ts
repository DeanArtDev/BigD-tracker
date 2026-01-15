import { DB } from '@/infrastructure/types';
import { GroupFactory } from '@/modules/tasks/domain/aggregates/group';
import { SanitizeHtmlAdapter } from '@/modules/tasks/infrastructure/sanitizers';
import { GroupsToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { Database, GroupsWriteRepository } from '../../ports';
import { GroupCheckerService } from '../../services';
import { DeleteGroupCommand } from './delete-group.command';

@Injectable()
class DeleteGroupUseCase {
  constructor(
    private readonly groupCheckerService: GroupCheckerService,
    @Inject(GroupsToken.WRITE_REPOSITORY) private readonly groupsWriteRepo: GroupsWriteRepository,
    @Inject(databaseToken.CONNECTION) private readonly db: Database<DB>,
  ) {}

  async execute({ input }: DeleteGroupCommand): Promise<boolean> {
    return this.db.runTransaction(async (trx) => {
      const { groupId, userId } = input;

      const ensureGroup = await this.groupCheckerService.ensureGroupExists(
        { groupId, userId },
        { trx },
      );

      const groupFactory = new GroupFactory({ sanitizer: new SanitizeHtmlAdapter() });
      const deletedGroup = groupFactory.delete(ensureGroup);

      return await this.groupsWriteRepo.deleteById(
        { groupId: deletedGroup.userId, userId: deletedGroup.userId },
        trx,
      );
    });
  }
}

export { DeleteGroupUseCase };
