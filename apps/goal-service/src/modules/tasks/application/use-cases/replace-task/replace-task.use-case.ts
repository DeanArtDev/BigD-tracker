import { ExceptionTaskUnprocessable } from '@/modules/tasks/application/exceptions';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { TasksViewMapper, TaskView } from '../../dto';
import { TaskDatabase } from '../../ports';
import { TaskService, TaskTypeService } from '../../services';
import { ReplaceTaskCommand } from './replace-task.command';

@Injectable()
class ReplaceTaskUseCase {
  constructor(
    private readonly taskServices: TaskService,
    private readonly taskTypeService: TaskTypeService,

    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
  ) {}

  async execute({ input }: ReplaceTaskCommand): Promise<TaskView> {
    return this.db.runTransaction(async (trx) => {
      const { id, ...patch } = input;
      const { isOrigin, data } = this.taskTypeService.getType({ taskId: id });

      if (isOrigin) {
        const task = await this.taskServices.replaceTask({ ...patch, id: data.id }, trx);
        return TasksViewMapper.fromAggregateToView(task);
      }

      throw new ExceptionTaskUnprocessable({ taskId: id, message: 'Не валидный id' });
    });
  }
}

export { ReplaceTaskUseCase };
