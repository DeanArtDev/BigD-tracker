import { ExceptionGroupWriteConflict } from '@/modules/tasks/application/exceptions';
import { GroupDeleteByUserPolicy } from '@/modules/tasks/application/policies';
import { GroupFactory } from '@/modules/tasks/domain/aggregates/group';
import { GroupsToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { GroupsWriteRepository, TaskDatabase } from '../../ports';
import { GroupCheckerService } from '../../services';
import { DeleteGroupCommand } from './delete-group.command';

@Injectable()
class DeleteGroupUseCase {
  constructor(
    private readonly groupCheckerService: GroupCheckerService,
    @Inject(GroupsToken.WRITE_REPOSITORY) private readonly groupsWriteRepo: GroupsWriteRepository,
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
  ) {}

  async execute({ input }: DeleteGroupCommand): Promise<{ data: true }> {
    return this.db.runTransaction(async (trx) => {
      const { groupId, userId } = input;

      const ensureGroup = await this.groupCheckerService.ensureGroupExists(
        { groupId, userId },
        { trx },
      );

      const groupFactory = new GroupFactory();
      const deletedGroup = groupFactory.delete(ensureGroup);

      const isDeleted = await this.groupsWriteRepo.delete(
        GroupDeleteByUserPolicy({ groupId: deletedGroup.id, userId: deletedGroup.userId }),
        trx,
      );

      if (!isDeleted) {
        throw new ExceptionGroupWriteConflict({
          subjectId: groupId,
          message: 'Group could not be deleted',
        });
      }

      return { data: true };
    });
  }
}

export { DeleteGroupUseCase };
