import { TaskIdBuilder } from '@/modules/tasks/domain';
import { TasksToken } from '@/modules/tasks/tokens';
import { SortDirection, TaskRecurrenceStatus } from '@big-d/api-contracts';
import { databaseToken } from '@big-d/database';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { compact } from 'lodash';
import { TaskView } from '../../dto';
import { TaskDatabase, TasksReadRepository } from '../../ports';
import {
  TaskByGroupId,
  TaskByIds,
  TaskByPriority,
  TaskBySearch,
  TaskByStatus,
  TaskByUserId,
  TaskRecurrenceByEmpty,
  TaskRecurrenceByStatus,
  tasksCombinators,
} from '../../specifications';
import { GetTasksPerPageQuery } from './get-tasks-per-page.query';

const { and, or } = tasksCombinators;

@QueryHandler(GetTasksPerPageQuery)
export class GetTasksPerPageHandler implements IQueryHandler<GetTasksPerPageQuery> {
  constructor(
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
    @Inject(TasksToken.READ_REPOSITORY) private readonly tasksReadRepository: TasksReadRepository,
  ) {}

  async execute({ input }: GetTasksPerPageQuery): Promise<TaskView[]> {
    return this.db.runTransaction(async (trx) => {
      const { userId, filter, order, search, page, perPage, sort } = input;
      const { ids = [], groupIds = [], status = [], priority = [], recurring } = filter ?? {};

      const taskIds = ids.map((id) => TaskIdBuilder.unwrapId(id)?.origin?.id).filter((id) => id != null);
      const recurrenceSpecification =
        recurring === true
          ? TaskRecurrenceByStatus([TaskRecurrenceStatus.ACTIVE])
          : recurring === false
            ? or(TaskRecurrenceByStatus([TaskRecurrenceStatus.CANCELED]), TaskRecurrenceByEmpty())
            : undefined;

      const specifications = and(
        ...compact([
          TaskByUserId(userId),
          priority.length > 0 && TaskByPriority(priority),
          status.length > 0 && TaskByStatus(status),
          taskIds.length > 0 && TaskByIds(taskIds),
          groupIds.length > 0 && TaskByGroupId(groupIds),
          recurrenceSpecification,
          search != null && search.trim().length > 0 && TaskBySearch(search),
        ]),
      );

      return this.tasksReadRepository.getMany(
        specifications,
        { page, perPage, order, idSort: SortDirection.DESC, sort },
        trx,
      );
    });
  }
}
