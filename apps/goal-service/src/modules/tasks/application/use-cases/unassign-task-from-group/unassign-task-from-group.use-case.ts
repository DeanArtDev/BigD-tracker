import { Database, TasksWriteRepository } from '@/modules/tasks/application/ports';
import { TaskFactory } from '@/modules/tasks/domain';
import { TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { GroupCheckerService, TaskCheckerService } from '../../services';
import { UnassignTaskFromGroupCommand } from './unassign-task-from-group.command';

@Injectable()
class UnassignTaskFromGroupUseCase {
  constructor(
    private readonly taskCheckerService: TaskCheckerService,
    private readonly groupCheckerService: GroupCheckerService,
    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
    @Inject(databaseToken.CONNECTION) private readonly db: Database,
  ) {}

  async execute({ input }: UnassignTaskFromGroupCommand): Promise<{ success: boolean }> {
    return this.db.runTransaction(async (trx) => {
      const { taskId, groupId, userId } = input;

      const sureTask = await this.taskCheckerService.ensureTaskExists({ taskId, userId }, { trx });
      await this.groupCheckerService.ensureTaskInGroup({ groupId, userId, taskId }, { trx });
      TaskFactory.unassignFromGroup(sureTask);

      await this.tasksWriteRepo.removeTaskFromGroup({ taskId }, trx);
      return { success: true };
    });
  }
}

export { UnassignTaskFromGroupUseCase };
