import { DB } from '@/infrastructure/types';
import { TaskView } from '@/modules/tasks/application/dto/task.view';
import { Database } from '@/modules/tasks/infrastructure/database.interface';
import { TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { TasksReadRepository } from '../../ports';
import { TaskQueryService, TaskService } from '../../services';
import { CloneTaskCommand } from './clone-task.command';

@Injectable()
class CloneTaskUseCase {
  constructor(
    private readonly taskServices: TaskService,
    private readonly taskQueryService: TaskQueryService,
    @Inject(databaseToken.CONNECTION) private readonly db: Database<DB>,
    @Inject(TasksToken.READ_REPOSITORY) private readonly tasksReadRepo: TasksReadRepository,
  ) {}

  async execute({ input }: CloneTaskCommand): Promise<TaskView> {
    return this.db.runTransaction(async (trx) => {
      const { taskId, userId, groupId } = input;

      const clonedTask = await this.taskServices.cloneTask({ taskId, userId }, trx);

      if (groupId != null) {
        await this.taskServices.addTaskToGroup({ taskId, userId, groupId }, trx);
      }

      return await this.taskQueryService.getById(
        { taskId: clonedTask.id, userId: clonedTask.userId },
        trx,
      );
    });
  }
}

export { CloneTaskUseCase };
