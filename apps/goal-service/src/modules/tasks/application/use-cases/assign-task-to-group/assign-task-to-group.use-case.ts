import { Database, TasksWriteRepository } from '@/modules/tasks/application/ports';
import { TaskFactory } from '@/modules/tasks/domain';
import { TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { GroupCheckerService, TaskCheckerService, TaskService } from '../../services';
import { AssignTaskToGroupCommand } from './assign-task-to-group.command';

@Injectable()
class AssignTaskToGroupUseCase {
  constructor(
    private readonly taskServices: TaskService,
    private readonly taskCheckerService: TaskCheckerService,
    private readonly groupCheckerService: GroupCheckerService,
    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
    @Inject(databaseToken.CONNECTION) private readonly db: Database,
  ) {}

  async execute({ input }: AssignTaskToGroupCommand): Promise<{ success: boolean }> {
    return this.db.runTransaction(async (trx) => {
      const { taskId, groupId, userId } = input;

      const sureTask = await this.taskCheckerService.ensureTaskExists({ taskId, userId }, { trx });
      await this.groupCheckerService.ensureTaskNotInGroup({ groupId, userId, taskId }, { trx });

      const assignedTask = TaskFactory.assignToGroup(sureTask);

      await this.tasksWriteRepo.removeTaskFromGroup({ taskId }, trx);
      await this.taskServices.addTaskToGroup({ taskId: assignedTask.id, groupId, userId }, trx);
      return { success: true };
    });
  }
}

export { AssignTaskToGroupUseCase };
