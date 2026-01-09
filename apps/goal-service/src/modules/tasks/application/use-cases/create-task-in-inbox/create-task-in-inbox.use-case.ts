import { DB } from '@/infrastructure/types';
import { TaskView } from '@/modules/tasks/application/dto/task.view';
import { ExceptionInboxNotExist } from '@/modules/tasks/application/exceptions';
import { Database } from '@/modules/tasks/infrastructure/database.interface';
import { GroupsToken, TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { GroupsReadRepository, INBOX_GROUP_KEY, TasksWriteRepository } from '../../ports';
import { CreateTaskInput, TaskQueryService, TaskService } from '../../services';

@Injectable()
class CreateTaskInInboxUseCase {
  constructor(
    private readonly taskServices: TaskService,
    private readonly taskQueryService: TaskQueryService,
    @Inject(databaseToken.CONNECTION) private readonly db: Database<DB>,
    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
    @Inject(GroupsToken.READ_REPOSITORY) private readonly groupsReadRepo: GroupsReadRepository,
  ) {}

  async execute(input: CreateTaskInput): Promise<TaskView> {
    return this.db.runTransaction(async (trx) => {
      const { id } = await this.taskServices.createTask(input, trx);

      const inboxGroup = await this.groupsReadRepo.getByName(
        { name: INBOX_GROUP_KEY, userId: input.userId },
        trx,
      );

      if (inboxGroup == null) {
        throw new ExceptionInboxNotExist({ taskId: id });
      }

      await this.tasksWriteRepo.addTaskToGroup({ taskId: id, groupId: inboxGroup.id }, trx);

      return await this.taskQueryService.getById({ taskId: id, userId: input.userId }, trx);
    });
  }
}

export { CreateTaskInInboxUseCase };
