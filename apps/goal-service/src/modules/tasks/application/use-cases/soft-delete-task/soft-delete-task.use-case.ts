import { ExceptionTaskUnprocessable } from '@/modules/tasks/application/exceptions';
import { TaskDatabase } from '@/modules/tasks/application/ports';
import { SoftDeleteTaskCommand } from '@/modules/tasks/application/use-cases';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { TaskService, TaskTypeService } from '../../services';

@Injectable()
class SoftDeleteTaskUseCase {
  constructor(
    private readonly taskServices: TaskService,
    private readonly taskTypeService: TaskTypeService,
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
  ) {}

  async execute({ input }: SoftDeleteTaskCommand): Promise<{ id: number }> {
    return this.db.runTransaction(async (trx) => {
      const { taskId, userId } = input;

      const { isOrigin, data } = this.taskTypeService.getType({ taskId });
      if (isOrigin) {
        return await this.taskServices.softDeleteTask({ taskId: data.id, userId }, trx);
      }

      throw new ExceptionTaskUnprocessable({ taskId, message: 'Не валидный id' });
    });
  }
}

export { SoftDeleteTaskUseCase };
