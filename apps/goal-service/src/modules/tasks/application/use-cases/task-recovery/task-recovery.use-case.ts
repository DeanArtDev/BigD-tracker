import { ExceptionTaskUnprocessable } from '@/modules/tasks/application/exceptions';
import { TaskDatabase, TasksWriteRepository } from '@/modules/tasks/application/ports';
import { TaskFactory } from '@/modules/tasks/domain';
import { TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { GroupCheckerService, TaskCheckerService, TaskTypeService } from '../../services';
import { TaskRecoveryCommand } from './task-recovery.command';

@Injectable()
class TaskRecoveryUseCase {
  constructor(
    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,

    private readonly taskCheckerService: TaskCheckerService,
    private readonly groupCheckerService: GroupCheckerService,
    private readonly taskTypeService: TaskTypeService,
  ) {}

  async execute({ input }: TaskRecoveryCommand): Promise<{ id: number }> {
    return this.db.runTransaction(async (trx) => {
      const { taskId, userId, groupId } = input;
      const { isOrigin, data } = this.taskTypeService.getType({ taskId });

      if (isOrigin) {
        const task = await this.taskCheckerService.ensureTaskExists({ taskId: data.id, userId }, { trx });
        const recoveredTask = TaskFactory.recovery(task);
        const replacedTask = await this.tasksWriteRepo.replaceTask(recoveredTask, trx);

        if (groupId != null) {
          await this.groupCheckerService.ensureGroupExists({ groupId, userId }, { trx, includeInbox: true });
          TaskFactory.assignToGroup(replacedTask);
          await this.tasksWriteRepo.addTaskToGroup({ taskId: data.id, groupId }, trx);
        }

        return { id: recoveredTask.id };
      }

      throw new ExceptionTaskUnprocessable({ taskId, message: 'Не валидный id' });
    });
  }
}

export { TaskRecoveryUseCase };
