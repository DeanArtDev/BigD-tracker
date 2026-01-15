import { DB } from '@/infrastructure/types';
import { Task } from '@/modules/tasks/domain';
import { GroupWithTasks } from '@/modules/tasks/domain/aggregates/group';
import { GroupsToken, TasksToken } from '@/modules/tasks/tokens';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';
import { GroupsWriteRepository, TasksReadRepository, TasksWriteRepository } from '../ports';

@Injectable()
class TaskGroupCheckerService {
  constructor(
    @Inject(GroupsToken.WRITE_REPOSITORY) private readonly groupWriteRepo: GroupsWriteRepository,
    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
    @Inject(TasksToken.READ_REPOSITORY) private readonly tasksReadRepo: TasksReadRepository,
  ) {}

  async ensureTaskInAnyGroup(
    input: { taskId: number; userId: number },
    params?: { trx?: Transaction<DB> },
  ): Promise<{ task: Task; group: GroupWithTasks } | null> {
    const { userId, taskId } = input;
    const { trx } = params ?? {};

    const taskLink = await this.tasksReadRepo.getTaskToGroupLink({ taskId }, trx);
    if (taskLink == null) {
      return null;
    }

    const task = await this.tasksWriteRepo.getTaskById({ taskId, userId }, trx);
    if (task == null) {
      return null;
    }

    const group = await this.groupWriteRepo.getGroupById(
      { groupId: taskLink?.groupId, userId },
      trx,
    );
    if (group == null) {
      return null;
    }

    return { task, group };
  }
}

export { TaskGroupCheckerService };
