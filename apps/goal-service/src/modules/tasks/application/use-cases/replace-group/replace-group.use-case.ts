import { Task } from '@/modules/tasks/domain';
import { GroupFactory } from '@/modules/tasks/domain/aggregates/group';
import { GroupsToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { GroupsViewMapper, GroupView } from '../../dto';
import { ExceptionTaskUnprocessable } from '../../exceptions';
import { GroupsReadRepository, GroupsWriteRepository, TaskDatabase } from '../../ports';
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

  async execute({ input }: ReplaceGroupCommand): Promise<GroupView> {
    return this.db.runTransaction(async (trx) => {
      const { id: groupId, userId, description, name, tasks = [] } = input;
      const ensureGroup = await this.groupCheckerService.ensureGroupExists({ groupId, userId }, { trx });

      const readyToReplaceTasks: Task[] = [];
      for (const taskInput of tasks) {
        const { isOrigin, data } = this.taskTypeService.getType({ taskId: taskInput.id });

        if (isOrigin) {
          const restoredTask = await this.taskCheckerService.ensureTaskExists({ userId, taskId: data.id }, { trx });

          await this.groupCheckerService.ensureTaskInGroup({ taskId: data.id, groupId, userId }, { trx });

          readyToReplaceTasks.push(restoredTask);
          continue;
        }

        throw new ExceptionTaskUnprocessable({
          taskId: taskInput.id,
          message: 'Не валидный id, не оригинальные дела не могут находится в группе',
        });
      }

      const groupFactory = new GroupFactory();
      const updatedGroup = groupFactory.replace(ensureGroup, { description, name });

      for (const task of readyToReplaceTasks) {
        if (task.groupId !== ensureGroup.id) {
          throw new ExceptionTaskUnprocessable({
            taskId: task.id,
            message: `Дело не принадлежит группе: ${ensureGroup.id}`,
          });
        }
      }

      await this.groupsWriteRepo.updateGroupAndTaskOrder(
        { group: updatedGroup, taskIds: readyToReplaceTasks.map((t) => t.id) },
        trx,
      );

      return GroupsViewMapper.fromAggregateToView(updatedGroup);
    });
  }
}

export { ReplaceGroupUseCase };
