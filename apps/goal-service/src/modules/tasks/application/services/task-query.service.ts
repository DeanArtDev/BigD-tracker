import { TaskView } from '@/modules/tasks/application/dto/task.view';
import { ExceptionTaskNotFound } from '@/modules/tasks/application/exceptions';
import { TasksReadRepository, TaskTransaction } from '@/modules/tasks/application/ports';
import { TasksToken } from '@/modules/tasks/tokens';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
class TaskQueryService {
  constructor(@Inject(TasksToken.READ_REPOSITORY) private readonly tasksReadRepo: TasksReadRepository) {}

  async getById(input: { taskId: number; userId: number }, trx?: TaskTransaction): Promise<TaskView> {
    const taskView = await this.tasksReadRepo.getById({ id: input.taskId, userId: input.userId }, trx);

    if (taskView == null) {
      throw new ExceptionTaskNotFound({ taskId: input.taskId });
    }

    return taskView;
  }
}

export { TaskQueryService };
