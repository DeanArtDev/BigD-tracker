import { ExceptionTaskUnprocessable } from '@/modules/tasks/application/exceptions';
import { TaskDatabase, TasksWriteRepository } from '@/modules/tasks/application/ports';
import { TaskFactory } from '@/modules/tasks/domain';
import { TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { TasksViewMapper, TaskView } from '../../dto';
import { GroupCheckerService, TaskCheckerService, TaskOverrideService, TaskTypeService } from '../../services';
import { AssignTaskToGroupCommand } from './assign-task-to-group.command';

@Injectable()
class AssignTaskToGroupUseCase {
  constructor(
    private readonly taskCheckerService: TaskCheckerService,
    private readonly taskOverrideService: TaskOverrideService,
    private readonly groupCheckerService: GroupCheckerService,
    private readonly taskTypeService: TaskTypeService,

    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
  ) {}

  async execute({ input }: AssignTaskToGroupCommand): Promise<TaskView> {
    return this.db.runTransaction(async (trx) => {
      const { taskId, groupId, userId } = input;

      const { isOrigin, isVirtual, isOverride, data } = this.taskTypeService.getType({ taskId });
      await this.groupCheckerService.ensureGroupExists({ groupId, userId }, { trx, includeInbox: true });

      if (isOrigin) {
        const sureTask = await this.taskCheckerService.ensureTaskExists({ taskId: data.id, userId }, { trx });
        const assignedTask = TaskFactory.assignToGroup(sureTask, groupId);
        const savedTask = await this.tasksWriteRepo.replaceTask(assignedTask, trx);

        if (sureTask.recurrenceId != null) {
          await this.taskOverrideService.updateGroupIdForManyOverrides(
            { userId, groupId, recurrenceId: sureTask.recurrenceId },
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
        const assignedTask = TaskFactory.assignToGroup(sourceTask, groupId);
        const savedTask = await this.tasksWriteRepo.replaceTask(assignedTask, trx);
        await this.taskOverrideService.updateGroupIdForManyOverrides(
          { userId, groupId, recurrenceId: recurrence.id },
          trx,
        );

        return TasksViewMapper.fromAggregateToView(savedTask, null);
      }

      throw new ExceptionTaskUnprocessable({ taskId, message: 'Не валидный id' });
    });
  }
}

export { AssignTaskToGroupUseCase };
