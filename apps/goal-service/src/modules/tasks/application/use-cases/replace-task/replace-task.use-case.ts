import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { TasksViewMapper, TaskView } from '../../dto';
import { TaskDatabase } from '../../ports';
import { TaskService } from '../../services';
import { ReplaceTaskCommand } from './replace-task.command';

@Injectable()
class ReplaceTaskUseCase {
  constructor(
    private readonly taskServices: TaskService,
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
  ) {}

  async execute({ input }: ReplaceTaskCommand): Promise<TaskView> {
    return this.db.runTransaction(async (trx) => {
      const task = await this.taskServices.replaceTask(input, trx);

      return TasksViewMapper.fromAggregateToView(task);
    });
  }
}

export { ReplaceTaskUseCase };
