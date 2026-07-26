import { TaskFactory } from '@/modules/tasks/domain';
import { TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { TasksViewMapper, TaskView } from '../../dto';
import { ExceptionTaskUnprocessable } from '../../exceptions';
import { TaskDatabase, TasksWriteRepository } from '../../ports';
import { GroupCheckerService, TaskCheckerService, TaskOverrideService, TaskTypeService } from '../../services';
import { UnassignTaskFromGroupCommand } from './unassign-task-from-group.command';

@Injectable()
class UnassignTaskFromGroupUseCase {
  constructor(
    private readonly taskCheckerService: TaskCheckerService,
    private readonly groupCheckerService: GroupCheckerService,
    private readonly taskTypeService: TaskTypeService,
    private readonly taskOverrideService: TaskOverrideService,

    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
  ) {}

  async execute({ input }: UnassignTaskFromGroupCommand): Promise<TaskView> {
    return this.db.runTransaction(async (trx) => {
      const { taskId, groupId, userId } = input;
      const { isOrigin, isVirtual, isOverride, data } = this.taskTypeService.getType({ taskId });

      if (isOrigin) {
        const sureTask = await this.taskCheckerService.ensureTaskExists({ taskId: data.id, userId }, { trx });
        await this.groupCheckerService.ensureTaskInGroup({ groupId, userId, taskId: data.id }, { trx });

        const task = TaskFactory.unassignFromGroup(sureTask);
        const savedTask = await this.tasksWriteRepo.replaceTask(task, trx);

        if (sureTask.recurrenceId != null) {
          await this.taskOverrideService.updateGroupIdForManyOverrides(
            { userId, groupId: undefined, recurrenceId: sureTask.recurrenceId },
            trx,
          );
        }

        return TasksViewMapper.fromAggregateToView(savedTask, null);
      }

      if (isVirtual || isOverride) {
        const recurrence = await this.taskCheckerService.ensureRecurrenceExists(
          { id: data.recurrenceId, userId },
          { trx },
        );
        const sourceTask = await this.taskCheckerService.ensureTaskExists(
          { taskId: recurrence.taskId, userId },
          { trx },
        );
        await this.groupCheckerService.ensureTaskInGroup({ groupId, userId, taskId: sourceTask.id }, { trx });
        const unassignedTask = TaskFactory.unassignFromGroup(sourceTask);
        const savedTask = await this.tasksWriteRepo.replaceTask(unassignedTask, trx);
        await this.taskOverrideService.updateGroupIdForManyOverrides(
          { userId, groupId: undefined, recurrenceId: recurrence.id },
          trx,
        );

        return TasksViewMapper.fromAggregateToView(savedTask, null);
      }

      throw new ExceptionTaskUnprocessable({ taskId, message: 'Не валидный id' });
    });
  }
}

export { UnassignTaskFromGroupUseCase };
