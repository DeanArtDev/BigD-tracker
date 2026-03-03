import { TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TasksViewMapper, TaskVirtualView } from '../../dto';
import { TaskDatabase, TasksReadRepository } from '../../ports';
import { TaskOverrideService } from '../../services';
import {
  TaskByDeadlineGreaterOrEqual,
  TaskByStartDateLessOrEqual,
  TaskByUserId,
  TaskHasRecurrence,
  tasksCombinators,
} from '../../specifications';
import { GetDiaryTasksQuery } from './get-diary-tasks.query';

const { and, not } = tasksCombinators;

@QueryHandler(GetDiaryTasksQuery)
export class GetDiaryTasksHandler implements IQueryHandler<GetDiaryTasksQuery> {
  constructor(
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
    @Inject(TasksToken.READ_REPOSITORY) private readonly tasksReadRepository: TasksReadRepository,
    private readonly taskOverrideService: TaskOverrideService,
  ) {}

  /**
   * TODO:
   * [x] учесть оверрайды
   * -------------- на update, create -------------------
   * [] инвариант проверка что окно 90 дней иначе исключение!
   * [] инвариант для еженедельных должны быть weekdays не пустые
   * [] инвариант startDate === recurrence.start
   * [] инвариант startDate обязательна если дело recurrence
   * [] продумать работу recurrence в методах агрегата assign, create
   * [] инвариант если дело recurrence то startDate \ deadline в рамках одного дня ?? может на пару дней ??
   *
   * ----------------------------------------------------
   *
   * [x] получить все мастер события если есть признак повторяемости (в окне)
   *    userId, start_date <= to, recurrence in NOT NULL
   * [x] получить оверрайды по мастер событиям (в окне)
   *    userId, from\to, master_id === tasks.id
   * [x] получить tasks (в окне)
   *   userId, from\to
   *
   * [x] вычислить на какие даты нужно создать виртуальные дела
   * [x] создать виртуальные дела TaskVirtualView
   * [x] смешать с tasks и отсортировать по start_date
   * []
   * []
   * */
  async execute({ input }: GetDiaryTasksQuery): Promise<TaskVirtualView[]> {
    return this.db.runTransaction(async (trx) => {
      const { userId, meta } = input;
      const { filter } = meta;
      const toDate = new Date(filter.to);
      const fromDate = new Date(filter.from);

      const virtualViews = await this.taskOverrideService.getVirtualViews(
        { userId, from: fromDate, to: toDate },
        trx,
      );

      const tasks = await this.tasksReadRepository.getByRange(
        and(
          TaskByUserId(userId),
          TaskByStartDateLessOrEqual(new Date(filter.to)),
          TaskByDeadlineGreaterOrEqual(new Date(filter.from)),
          not(TaskHasRecurrence()),
        ),
        { page: 1, perPage: 1000000 },
        undefined,
        trx,
      );

      const tasksVV = tasks.map(TasksViewMapper.fromViewToVirtualView);

      return [...virtualViews, ...tasksVV].sort((a, b) => {
        if (!a.startDate && !b.startDate) return 0;
        if (!a.startDate) return 1;
        if (!b.startDate) return -1;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      });
    });
  }
}
