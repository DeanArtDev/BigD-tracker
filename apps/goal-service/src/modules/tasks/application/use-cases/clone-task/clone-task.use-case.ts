import { TaskView } from '@/modules/tasks/application/dto/task.view';
import { ExceptionTaskUnprocessable } from '@/modules/tasks/application/exceptions';
import { TaskDatabase } from '@/modules/tasks/application/ports';
import { TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { TasksReadRepository } from '../../ports';
import { TaskQueryService, TaskService, TaskTypeService } from '../../services';
import { CloneTaskCommand } from './clone-task.command';

@Injectable()
class CloneTaskUseCase {
  constructor(
    private readonly taskServices: TaskService,
    private readonly taskTypeService: TaskTypeService,
    private readonly taskQueryService: TaskQueryService,
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
    @Inject(TasksToken.READ_REPOSITORY) private readonly tasksReadRepo: TasksReadRepository,
  ) {}

  async execute({ input }: CloneTaskCommand): Promise<TaskView> {
    return this.db.runTransaction(async (trx) => {
      const { taskId, userId, groupId } = input;
      const { isOrigin, data } = this.taskTypeService.getType({ taskId });

      if (isOrigin) {
        const clonedTask = await this.taskServices.cloneTask({ taskId: data.id, userId }, trx);
        if (groupId != null) {
          await this.taskServices.addTaskToGroup({ taskId: clonedTask.id, userId, groupId }, trx);
        }
        return await this.taskQueryService.getById(
          { taskId: clonedTask.id, userId: clonedTask.userId },
          trx,
        );
      }

      throw new ExceptionTaskUnprocessable({ taskId, message: 'Не валидный id' });
    });
  }
}

export { CloneTaskUseCase };
