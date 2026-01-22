import { Database } from '@/modules/tasks/application/ports';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { DeleteTaskInput, TaskService } from '../../services';

@Injectable()
class SoftDeleteTaskUseCase {
  constructor(
    private readonly taskServices: TaskService,
    @Inject(databaseToken.CONNECTION) private readonly db: Database,
  ) {}

  async execute(input: DeleteTaskInput): Promise<{ id: number }> {
    return this.db.runTransaction(async (trx) => {
      return await this.taskServices.softDeleteTask(input, trx);
    });
  }
}

export { SoftDeleteTaskUseCase };
