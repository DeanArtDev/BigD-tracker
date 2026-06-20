import { TasksToken } from '@/modules/tasks/tokens';
import { Inject, Injectable } from '@nestjs/common';
import { TaskView } from '../dto';
import { ExceptionTaskNotFound } from '../exceptions';
import { TasksReadRepository, TaskTransaction } from '../ports';

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
