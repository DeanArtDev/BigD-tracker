import { TaskView } from '@/modules/tasks/application/dto/task.view';
import { TaskDatabase } from '@/modules/tasks/application/ports';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { CreateTaskInput, TaskQueryService, TaskService } from '../../services';

@Injectable()
class CreateTaskUseCase {
  constructor(
    private readonly taskServices: TaskService,
    private readonly taskQueryService: TaskQueryService,
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
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

      return await this.taskQueryService.getById(
        { taskId: createdTask.id, userId: input.userId },
        trx,
      );
    });
  }
}

export { CreateTaskUseCase };
