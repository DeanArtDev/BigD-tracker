import { DB } from '@/infrastructure/types';
import { TaskView } from '@/modules/tasks/application/dto/task.view';
import { Database } from '@/modules/tasks/infrastructure/database.interface';
import { TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { TasksReadRepository } from '../../ports';
import { CreateTaskInput, TaskService } from '../../services';

@Injectable()
class CreateTaskUseCase {
  constructor(
    private readonly taskServices: TaskService,
    @Inject(databaseToken.CONNECTION) private readonly db: Database<DB>,
    @Inject(TasksToken.READ_REPOSITORY) private readonly tasksReadRepo: TasksReadRepository,
  ) {}

  async execute(input: CreateTaskInput): Promise<TaskView> {
    return this.db.runTransaction(async (trx) => {
      const createdTask = await this.taskServices.createTask(input, trx);

      if (input.groupId != null) {
        await this.taskServices.addTaskToGroup(
          { taskId: createdTask.id, groupId: input.groupId, userId: input.userId },
          trx,
        );
      }

      return await this.tasksReadRepo.getById({ id: createdTask.id, userId: input.userId }, trx);
    });
  }
}

export { CreateTaskUseCase };
