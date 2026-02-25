import { TaskDatabase, TasksWriteRepository } from '@/modules/tasks/application/ports';
import { TaskFactory } from '@/modules/tasks/domain';
import { TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { GroupCheckerService, TaskCheckerService } from '../../services';
import { TaskRecoveryCommand } from './task-recovery.command';

@Injectable()
class TaskRecoveryUseCase {
  constructor(
    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,

    private readonly taskCheckerService: TaskCheckerService,
    private readonly groupCheckerService: GroupCheckerService,
  ) {}
  async execute({ input }: TaskRecoveryCommand): Promise<{ id: number }> {
    return this.db.runTransaction(async (trx) => {
      const { taskId, userId, groupId } = input;

      const task = await this.taskCheckerService.ensureTaskExists(input, { trx });
      const recoveredTask = TaskFactory.recovery(task);
      const replacedTask = await this.tasksWriteRepo.replaceTask(recoveredTask, trx);

      if (groupId != null) {
        await this.groupCheckerService.ensureGroupExists(
          { groupId, userId },
          { trx, includeInbox: true },
        );
        TaskFactory.assignToGroup(replacedTask);
        await this.tasksWriteRepo.addTaskToGroup({ taskId, groupId }, trx);
      }

      return { id: taskId };
    });
  }
}

export { TaskRecoveryUseCase };
