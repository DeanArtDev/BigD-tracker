import { TaskView } from '@/modules/tasks/application/dto';
import {
  TaskBySearch,
  TaskByStatus,
  TaskByUserId,
  TaskInGroup,
  tasksCombinators,
} from '@/modules/tasks/application/specifications';
import { TasksToken } from '@/modules/tasks/tokens';
import { TaskStatus } from '@big-d/api-contracts';
import { databaseToken } from '@big-d/database';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TaskDatabase, TasksReadRepository } from '../../ports';
import { GetAssignableTasksQuery } from './get-assignable-tasks.query';

const { and, not } = tasksCombinators;

@QueryHandler(GetAssignableTasksQuery)
export class GetAssignableTasksHandler implements IQueryHandler<GetAssignableTasksQuery> {
  constructor(
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
    @Inject(TasksToken.READ_REPOSITORY) private readonly tasksReadRepository: TasksReadRepository,
  ) {}

  async execute({ input }: GetAssignableTasksQuery): Promise<TaskView[]> {
    return this.db.runTransaction(async (trx) => {
      const { userId, search } = input;

      const specifications = and(
        TaskByUserId(userId),
        TaskByStatus([TaskStatus.NOT_STARTED, TaskStatus.IN_PROGRESS]),
        not(TaskInGroup()),
        TaskBySearch(search),
      );

      return this.tasksReadRepository.getMany(specifications, trx);
    });
  }
}
