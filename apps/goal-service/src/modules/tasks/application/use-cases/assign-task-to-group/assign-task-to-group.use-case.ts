import { DB } from '@/infrastructure/types';
import { TaskFactory } from '@/modules/tasks/domain';
import { Database, TasksWriteRepository } from '@/modules/tasks/application/ports';
import { TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import {
  GroupCheckerService,
  TaskCheckerService,
  TaskGroupCheckerService,
  TaskService,
} from '../../services';
import { AssignTaskToGroupCommand } from './assign-task-to-group.command';

@Injectable()
class AssignTaskToGroupUseCase {
  constructor(
    private readonly taskServices: TaskService,
    private readonly taskCheckerService: TaskCheckerService,
    private readonly groupCheckerService: GroupCheckerService,
    private readonly taskGroupCheckerService: TaskGroupCheckerService,
    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
    @Inject(databaseToken.CONNECTION) private readonly db: Database<DB>,
  ) {}

  async execute({ input }: AssignTaskToGroupCommand): Promise<{ success: boolean }> {
    return this.db.runTransaction(async (trx) => {
      const { taskId, groupId, userId } = input;

      const sureTask = await this.taskCheckerService.ensureTaskExists({ taskId, userId }, { trx });
      await this.groupCheckerService.ensureTaskNotInGroup({ groupId, userId, taskId }, { trx });

      const taskToGroupData = await this.taskGroupCheckerService.ensureTaskInAnyGroup(
        { taskId, userId },
        { trx },
      );
      if (taskToGroupData != null) {
        await this.tasksWriteRepo.removeTaskFromGroup(
          { taskId: taskToGroupData.task.id, groupId: taskToGroupData.group.id },
          trx,
        );
      }

      const assignedTask = TaskFactory.assignToGroup(sureTask);
      await this.taskServices.addTaskToGroup({ taskId: assignedTask.id, groupId, userId }, trx);
      return { success: true };
    });
  }
}

export { AssignTaskToGroupUseCase };
