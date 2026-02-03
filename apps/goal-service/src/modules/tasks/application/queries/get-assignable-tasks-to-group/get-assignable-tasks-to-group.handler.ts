import { TaskView } from '@/modules/tasks/application/dto';
import { GroupCheckerService } from '@/modules/tasks/application/services';
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
import { GetAssignableTasksToGroupQuery } from './get-assignable-tasks-to-group.query';

const { and, not } = tasksCombinators;

@QueryHandler(GetAssignableTasksToGroupQuery)
export class GetAssignableTasksToGroupHandler implements IQueryHandler<GetAssignableTasksToGroupQuery> {
  constructor(
    private readonly groupCheckerService: GroupCheckerService,
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
    @Inject(TasksToken.READ_REPOSITORY) private readonly tasksReadRepository: TasksReadRepository,
  ) {}

  async execute({ input }: GetAssignableTasksToGroupQuery): Promise<TaskView[]> {
    return this.db.runTransaction(async (trx) => {
      const { userId, groupId, search } = input;

      await this.groupCheckerService.ensureGroupExists({ userId, groupId }, { trx });

      const specifications = and(
        TaskByUserId(userId),
        TaskByStatus([TaskStatus.NOT_STARTED, TaskStatus.IN_PROGRESS]),
        not(TaskInGroup()),
        TaskBySearch(search),
      );

      return this.tasksReadRepository.getMany(['with_group_links_left_join'], specifications, trx);
    });
  }
}
