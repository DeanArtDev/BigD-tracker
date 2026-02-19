import { TaskView } from '@/modules/tasks/application/dto';
import {
  TaskByDeadlineGreaterOrEqual,
  TaskByGroupId,
  TaskByPriority,
  TaskBySearch,
  TaskByStartDateLessOrEqual,
  TaskByStatus,
  TaskByUserId,
  tasksCombinators,
} from '@/modules/tasks/application/specifications';
import { TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { compact } from 'lodash';
import { TaskDatabase, TasksReadRepository } from '../../ports';
import { GetTasksQuery } from './get-tasks.query';

@QueryHandler(GetTasksQuery)
export class GetTasksHandler implements IQueryHandler<GetTasksQuery> {
  constructor(
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
    @Inject(TasksToken.READ_REPOSITORY) private readonly tasksReadRepository: TasksReadRepository,
  ) {}

  async execute({ input }: GetTasksQuery): Promise<TaskView[]> {
    return this.db.runTransaction(async (trx) => {
      const { userId, search, filter, sort } = input;

      const hasRange = filter?.from != null && filter?.to != null;
      const filterSpecs = compact([
        search != null && TaskBySearch(search),
        filter?.group != null && TaskByGroupId(filter.group),
        filter?.priority != null && TaskByPriority([filter.priority]),
        filter?.status != null && TaskByStatus(filter.status),
        hasRange && TaskByStartDateLessOrEqual(new Date(filter.to)),
        hasRange && TaskByDeadlineGreaterOrEqual(new Date(filter.from)),
      ]);

      const specifications = tasksCombinators.and(TaskByUserId(userId), ...filterSpecs);

      return await this.tasksReadRepository.getByRange(specifications, sort, trx);
    });
  }
}
