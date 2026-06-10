import { TaskIdBuilder } from '@/modules/tasks/domain';
import { TasksToken } from '@/modules/tasks/tokens';
import { SortDirection } from '@big-d/api-contracts';
import { databaseToken } from '@big-d/database';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { compact } from 'lodash';
import { TaskView } from '../../dto';
import { TaskDatabase, TasksReadRepository } from '../../ports';
import {
  TaskBeforeId,
  TaskByGroupId,
  TaskByIds,
  TaskByPriority,
  TaskBySearch,
  TaskByStatus,
  TaskByUserId,
  tasksCombinators,
} from '../../specifications';
import { GetTasksQuery } from './get-tasks.query';

const { and } = tasksCombinators;

@QueryHandler(GetTasksQuery)
export class GetTasksHandler implements IQueryHandler<GetTasksQuery> {
  constructor(
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
    @Inject(TasksToken.READ_REPOSITORY) private readonly tasksReadRepository: TasksReadRepository,
  ) {}

  async execute({ input }: GetTasksQuery): Promise<TaskView[]> {
    return this.db.runTransaction(async (trx) => {
      const { userId, filter, search, limit } = input;
      const { ids = [], groupIds = [], status = [], priority = [], lastId } = filter ?? {};
      const lId = TaskIdBuilder.unwrapId(lastId?.toString() ?? '')?.origin?.id ?? undefined;

      const taskIds = ids?.map((id) => TaskIdBuilder.unwrapId(id)?.origin?.id).filter((id) => id != null);

      const specifications = and(
        ...compact([
          TaskByUserId(userId),
          lId != null && TaskBeforeId(lId),
          priority.length > 0 && TaskByPriority(priority),
          status.length > 0 && TaskByStatus(status),
          taskIds.length > 0 && TaskByIds(taskIds),
          groupIds.length > 0 && TaskByGroupId(groupIds),
          search != null && search.trim().length > 0 && search.trim() && TaskBySearch(search),
        ]),
      );

      return this.tasksReadRepository.getMany(specifications, { limit, sort: SortDirection.DESC }, trx);
    });
  }
}
