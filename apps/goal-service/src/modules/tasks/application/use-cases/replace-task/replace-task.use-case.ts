import { DB } from '@/infrastructure/types';
import { TaskView } from '@/modules/tasks/application/dto/task.view';
import { TasksViewMapper } from '@/modules/tasks/application/dto/task.view-mapper';
import { Database } from '@/modules/tasks/infrastructure/database.interface';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { ReplaceTaskInput, TaskCheckerService, TaskService } from '../../services';

@Injectable()
class ReplaceTaskUseCase {
  constructor(
    private readonly taskServices: TaskService,
    private readonly taskCheckerService: TaskCheckerService,
    @Inject(databaseToken.CONNECTION) private readonly db: Database<DB>,
  ) {}

  async execute(input: ReplaceTaskInput): Promise<TaskView> {
    return this.db.runTransaction(async (trx) => {
      await this.taskCheckerService.ensureTaskExists(
        { taskId: input.id, userId: input.userId },
        { trx },
      );
      const task = await this.taskServices.replaceTask(input, trx);
      return TasksViewMapper.fromAggregateToView(task);
    });
  }
}

export { ReplaceTaskUseCase };
