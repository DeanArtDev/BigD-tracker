import { TasksToken } from '@/modules/tasks/tokens';
import { TaskStatus } from '@big-d/api-contracts';
import { timeAndDate } from '@big-d/api-utils';
import { databaseToken } from '@big-d/database';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { compact } from 'lodash';
import { TaskView } from '../../dto';
import { TaskDatabase, TasksReadRepository } from '../../ports';
import { TaskRecurrenceQueryService } from '../../services';
import {
  TaskByDeadlineGreaterOrEqual,
  TaskByGroupId,
  TaskByIds,
  TaskByStartDateLessOrEqual,
  TaskByStatus,
  TaskByUserId,
  tasksCombinators,
} from '../../specifications';
import { GetDiaryTasksQuery } from './get-diary-tasks.query';

const { and, not } = tasksCombinators;

@QueryHandler(GetDiaryTasksQuery)
export class GetDiaryTasksHandler implements IQueryHandler<GetDiaryTasksQuery> {
  constructor(
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
    @Inject(TasksToken.READ_REPOSITORY) private readonly tasksReadRepository: TasksReadRepository,
    private readonly taskRecurrenceQueryService: TaskRecurrenceQueryService,
  ) {}

  async execute({ input }: GetDiaryTasksQuery): Promise<TaskView[]> {
    return this.db.runTransaction(async (trx) => {
      const { userId, meta } = input;
      const { filter } = meta;

      const { virtualViews, recurrences } = await this.taskRecurrenceQueryService.calculateTasks(
        { userId },
        { from: filter.from, to: filter.to, group: filter.group },
        trx,
      );

      const to = timeAndDate(filter.to).endOf('date').toDate();
      const from = timeAndDate(filter.from).startOf('date').toDate();

      const tasks = await this.tasksReadRepository.getByRange(
        and(
          ...compact([
            TaskByUserId(userId),
            filter.group != null && filter.group.length > 0 && TaskByGroupId(filter.group),
            TaskByStartDateLessOrEqual(to),
            TaskByDeadlineGreaterOrEqual(from),
            not(TaskByStatus([TaskStatus.DELETED, TaskStatus.ARCHIVED])),
            recurrences.length > 0 && not(TaskByIds(recurrences.map((r) => r.taskId))),
          ]),
        ),
        { page: 1, perPage: 1000000 },
        undefined,
        trx,
      );

      return [...virtualViews, ...tasks].sort((a, b) => {
        if (a.startDate == null && b.startDate == null) return 0;
        if (a.startDate == null) return 1;
        if (b.startDate == null) return -1;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      });
    });
  }
}
