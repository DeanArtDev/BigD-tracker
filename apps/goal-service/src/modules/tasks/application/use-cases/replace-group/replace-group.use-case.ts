import { ExceptionTaskUnprocessable } from '@/modules/tasks/application/exceptions';
import { GroupsReadRepository, GroupsWriteRepository, TaskDatabase } from '@/modules/tasks/application/ports';
import { GroupFactory, GroupFactoryReplaceWithTasksInput } from '@/modules/tasks/domain/aggregates/group';
import { GroupsToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { GroupWithTasksView } from '../../dto';
import { GroupCheckerService, TaskCheckerService, TaskTypeService } from '../../services';
import { ReplaceGroupCommand } from './replace-group.command';

@Injectable()
class ReplaceGroupUseCase {
  constructor(
    private readonly groupCheckerService: GroupCheckerService,
    private readonly taskCheckerService: TaskCheckerService,
    private readonly taskTypeService: TaskTypeService,

    @Inject(GroupsToken.WRITE_REPOSITORY) private readonly groupsWriteRepo: GroupsWriteRepository,
    @Inject(GroupsToken.READ_REPOSITORY) private readonly groupsReadRepo: GroupsReadRepository,
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
  ) {}

  async execute({ input }: ReplaceGroupCommand): Promise<GroupWithTasksView> {
    return this.db.runTransaction(async (trx) => {
      const { id: groupId, userId, description, name, tasks } = input;
      const ensureGroup = await this.groupCheckerService.ensureGroupExists({ groupId, userId }, { trx });

      const readyToReplaceTasks: GroupFactoryReplaceWithTasksInput['tasks'] = [];
      for (const taskInput of tasks) {
        const { isOrigin, data } = this.taskTypeService.getType({ taskId: taskInput.id });

        if (isOrigin) {
          const restoredTask = await this.taskCheckerService.ensureTaskExists({ userId, taskId: data.id }, { trx });

          await this.groupCheckerService.ensureTaskInGroup({ taskId: data.id, groupId, userId }, { trx });

          readyToReplaceTasks.push({ task: restoredTask, input: taskInput });
          continue;
        }

        throw new ExceptionTaskUnprocessable({ taskId: taskInput.id, message: 'Не валидный id' });
      }

      const groupFactory = new GroupFactory();
      const groupWithTasks = groupFactory.replaceWithTasksByGroup(ensureGroup, {
        name,
        description,
        tasks: readyToReplaceTasks,
      });

      await this.groupsWriteRepo.replaceGroupAndTaskOrder(groupWithTasks, trx);
      return await this.groupsReadRepo.getGroupWithTasksById({ groupId, userId }, { trx, throwError: true });
    });
  }
}

export { ReplaceGroupUseCase };
