import { TaskView } from '@/modules/tasks/application/dto';
import { TaskByGroupId, TaskByIds, TaskByUserId, tasksCombinators } from '@/modules/tasks/application/specifications';
import { TaskIdBuilder } from '@/modules/tasks/domain';
import { TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { compact } from 'lodash';
import { TaskDatabase, TasksReadRepository } from '../../ports';
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
      const { userId, ids = [], groupIds = [] } = input;
      const taskIds = ids?.map((id) => TaskIdBuilder.unwrapId(id)?.origin?.id).filter((id) => id != null);

      const specifications = and(
        ...compact([
          TaskByUserId(userId),
          taskIds.length > 0 && TaskByIds(taskIds),
          groupIds.length > 0 && TaskByGroupId(groupIds),
        ]),
      );

      return this.tasksReadRepository.getMany(specifications, trx);
    });
  }
}
