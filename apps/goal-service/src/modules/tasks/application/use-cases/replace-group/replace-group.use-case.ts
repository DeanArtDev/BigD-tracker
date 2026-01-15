import { DB } from '@/infrastructure/types';
import { GroupWithTasksView } from '@/modules/tasks/application/dto';
import {
  Database,
  GroupsReadRepository,
  GroupsWriteRepository,
} from '@/modules/tasks/application/ports';
import { GroupCheckerService, TaskCheckerService } from '@/modules/tasks/application/services';
import {
  GroupFactory,
  GroupFactoryReplaceWithTasksInput,
} from '@/modules/tasks/domain/aggregates/group';
import { SanitizeHtmlAdapter } from '@/modules/tasks/infrastructure/sanitizers';
import { GroupsToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { ReplaceGroupCommand } from './replace-group.command';

@Injectable()
class ReplaceGroupUseCase {
  constructor(
    private readonly groupCheckerService: GroupCheckerService,
    private readonly taskCheckerService: TaskCheckerService,
    @Inject(GroupsToken.WRITE_REPOSITORY) private readonly groupsWriteRepo: GroupsWriteRepository,
    @Inject(GroupsToken.READ_REPOSITORY) private readonly groupsReadRepo: GroupsReadRepository,
    @Inject(databaseToken.CONNECTION) private readonly db: Database<DB>,
  ) {}

  async execute({ input }: ReplaceGroupCommand): Promise<GroupWithTasksView> {
    return this.db.runTransaction(async (trx) => {
      const { id: groupId, userId, description, name, tasks } = input;
      const ensureGroup = await this.groupCheckerService.ensureGroupExists(
        { groupId, userId },
        { trx },
      );

      const readyToReplaceTasks: GroupFactoryReplaceWithTasksInput['tasks'] = [];
      for (const taskInput of tasks) {
        const restoredTask = await this.taskCheckerService.ensureTaskExists(
          { userId, taskId: taskInput.id },
          { trx },
        );

        await this.groupCheckerService.ensureTaskInGroup(
          { taskId: taskInput.id, groupId, userId },
          { trx },
        );

        readyToReplaceTasks.push({ task: restoredTask, input: taskInput });
      }

      const groupFactory = new GroupFactory({ sanitizer: new SanitizeHtmlAdapter() });
      const groupWithTasks = groupFactory.replaceWithTasksByGroup(ensureGroup, {
        name,
        description,
        tasks: readyToReplaceTasks,
      });

      await this.groupsWriteRepo.replaceGroupWithTasks(groupWithTasks, trx);
      return await this.groupsReadRepo.getGroupWithTasksById(
        { groupId, userId },
        { trx, throwError: true },
      );
    });
  }
}

export { ReplaceGroupUseCase };
