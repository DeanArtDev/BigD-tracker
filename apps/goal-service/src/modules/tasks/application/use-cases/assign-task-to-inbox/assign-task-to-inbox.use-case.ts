import { DB } from '@/infrastructure/types';
import { TasksWriteRepository } from '@/modules/tasks/application/ports';
import { TaskFactory } from '@/modules/tasks/domain';
import { Database } from '@/modules/tasks/application/ports';
import { TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { GroupCheckerService, TaskCheckerService } from '../../services';
import { AssignTaskToInboxCommand } from './assign-task-to-inbox.command';

@Injectable()
class AssignTaskToInboxUseCase {
  constructor(
    private readonly taskCheckerService: TaskCheckerService,
    private readonly groupCheckerService: GroupCheckerService,
    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
    @Inject(databaseToken.CONNECTION) private readonly db: Database<DB>,
  ) {}

  async execute({ input }: AssignTaskToInboxCommand): Promise<{ success: boolean }> {
    return this.db.runTransaction(async (trx) => {
      const { taskId, userId } = input;

      const sureTask = await this.taskCheckerService.ensureTaskExists({ taskId, userId }, { trx });
      const { inboxId } = await this.groupCheckerService.ensureTaskNotInInboxGroup(
        { userId, taskId },
        { trx },
      );
      const assignedTask = TaskFactory.assignToGroup(sureTask, 'IN_BOX');

      await this.tasksWriteRepo.addTaskToGroup({ taskId: assignedTask.id, groupId: inboxId }, trx);
      return { success: true };
    });
  }
}

export { AssignTaskToInboxUseCase };
