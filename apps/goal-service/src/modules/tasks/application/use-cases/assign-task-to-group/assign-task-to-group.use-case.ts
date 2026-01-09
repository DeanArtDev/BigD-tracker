import { DB } from '@/infrastructure/types';
import { TaskFactory } from '@/modules/tasks/domain';
import { Database } from '@/modules/tasks/infrastructure/database.interface';
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
    @Inject(databaseToken.CONNECTION) private readonly db: Database<DB>,
  ) {}

  async execute({ input }: AssignTaskToGroupCommand): Promise<{ success: boolean }> {
    return this.db.runTransaction(async (trx) => {
      const { taskId, groupId, userId } = input;

      const sureTask = await this.taskCheckerService.ensureTaskExists({ taskId, userId }, { trx });
      await this.groupCheckerService.ensureTaskNotInGroup({ groupId, userId, taskId }, { trx });
      const assignedTask = TaskFactory.assignToGroup(sureTask);

      await this.taskServices.addTaskToGroup({ taskId: assignedTask.id, groupId, userId }, trx);
      return { success: true };
    });
  }
}

export { AssignTaskToGroupUseCase };
