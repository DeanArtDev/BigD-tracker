import { DB } from '@/infrastructure/types';
import { CreateTaskInput } from '@/modules/tasks/application';
import { TaskFactory } from '@/modules/tasks/domain';
import { TasksToken } from '@/modules/tasks/tasks.tokens';
import { databaseToken, KyselyDatabase } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { TasksRepository } from '../ports';

@Injectable()
class CreateTaskUseCase {
  constructor(
    @Inject(databaseToken.CONNECTION) private readonly db: KyselyDatabase<DB>,
    @Inject(TasksToken.REPOSITORY) private readonly tasksRepo: TasksRepository,
  ) {}

  async execute(input: CreateTaskInput): Promise<void> {
    await this.db.runTransaction(async (trx) => {
      const draftTask = new TaskFactory().create(input);
      // если есть groupId вызвать эвент для добавления таски в группу??
      await this.tasksRepo.createTask(draftTask, trx);
    });
  }
}

export { CreateTaskUseCase };
