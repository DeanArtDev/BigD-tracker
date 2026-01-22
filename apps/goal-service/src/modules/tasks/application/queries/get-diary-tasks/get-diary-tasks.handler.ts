import { TaskView } from '@/modules/tasks/application/dto';
import { TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Database, TasksReadRepository } from '../../ports';
import { GetDiaryTasksQuery } from './get-diary-tasks.query';

@QueryHandler(GetDiaryTasksQuery)
export class GetDiaryTasksHandler implements IQueryHandler<GetDiaryTasksQuery> {
  constructor(
    @Inject(databaseToken.CONNECTION) private readonly db: Database,
    @Inject(TasksToken.READ_REPOSITORY) private readonly tasksReadRepository: TasksReadRepository,
  ) {}

  async execute({ input }: GetDiaryTasksQuery): Promise<TaskView[]> {
    return this.db.runTransaction(async (trx) => {
      const { userId, from, to } = input;
      return await this.tasksReadRepository.getByRange({ from, to, userId }, trx);
    });
  }
}
