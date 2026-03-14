import { ExceptionTaskUnprocessable } from '@/modules/tasks/application/exceptions';
import { TaskDatabase, TasksWriteRepository } from '@/modules/tasks/application/ports';
import { TaskFactory } from '@/modules/tasks/domain';
import { TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { GroupCheckerService, TaskCheckerService, TaskTypeService } from '../../services';
import { AssignTaskToGroupCommand } from './assign-task-to-group.command';

@Injectable()
class AssignTaskToGroupUseCase {
  constructor(
    private readonly taskCheckerService: TaskCheckerService,
    private readonly groupCheckerService: GroupCheckerService,
    private readonly taskTypeService: TaskTypeService,

    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
  ) {}

  async execute({ input }: AssignTaskToGroupCommand): Promise<{ success: boolean }> {
    return this.db.runTransaction(async (trx) => {
      const { taskId, groupId, userId } = input;

      const { isOrigin, data } = this.taskTypeService.getType({ taskId });

      if (isOrigin) {
        const sureTask = await this.taskCheckerService.ensureTaskExists({ taskId: data.id, userId }, { trx });
        await this.groupCheckerService.ensureGroupExists({ groupId, userId }, { trx, includeInbox: true });
        await this.groupCheckerService.ensureTaskNotInGroup({ groupId, userId, taskId: data.id }, { trx });

        const assignedTask = TaskFactory.assignToGroup(sureTask, groupId);
        await this.tasksWriteRepo.replaceTask(assignedTask, trx);

        return { success: true };
      }

      throw new ExceptionTaskUnprocessable({ taskId, message: 'Не валидный id' });
    });
  }
}

export { AssignTaskToGroupUseCase };
