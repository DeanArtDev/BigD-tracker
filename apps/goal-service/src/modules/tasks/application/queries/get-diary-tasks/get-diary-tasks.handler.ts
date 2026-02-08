import { TaskView } from '@/modules/tasks/application/dto';
import {
  TaskByDeadlineGreaterOrEqual,
  TaskByStartDateLessOrEqual,
  TaskByStatus,
  TaskByUserId,
  tasksCombinators,
} from '@/modules/tasks/application/specifications';
import { tasksQuerySpec } from '@/modules/tasks/domain';
import { TasksToken } from '@/modules/tasks/tokens';
import { TaskStatus } from '@big-d/api-contracts';
import { databaseToken } from '@big-d/database';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TaskDatabase, TasksReadRepository } from '../../ports';
import { GetDiaryTasksQuery } from './get-diary-tasks.query';

@QueryHandler(GetDiaryTasksQuery)
export class GetDiaryTasksHandler implements IQueryHandler<GetDiaryTasksQuery> {
  constructor(
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
    @Inject(TasksToken.READ_REPOSITORY) private readonly tasksReadRepository: TasksReadRepository,
  ) {}

  async execute({ input }: GetDiaryTasksQuery): Promise<TaskView[]> {
    return this.db.runTransaction(async (trx) => {
      const { userId, from, to } = input;

      const specifications = tasksCombinators.and(
        TaskByUserId(userId),
        TaskByStatus(
          [TaskStatus.IN_PROGRESS].filter((status) =>
            tasksQuerySpec.readableStatuses.includes(status),
          ),
        ),
        TaskByStartDateLessOrEqual(new Date(to)),
        TaskByDeadlineGreaterOrEqual(new Date(from)),
      );

      return await this.tasksReadRepository.getByRange(specifications, trx);
    });
  }
}
