import { TaskView } from '@/modules/tasks/application/dto/task.view';
import { ExceptionInboxNotExist } from '@/modules/tasks/application/exceptions';
import { GroupInboxReadRepository, TaskDatabase } from '@/modules/tasks/application/ports';
import { CreateTaskInInboxCommand } from '@/modules/tasks/application/use-cases';
import { GroupsToken, TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { TasksWriteRepository } from '../../ports';
import { TaskQueryService, TaskService } from '../../services';

@Injectable()
class CreateTaskInInboxUseCase {
  constructor(
    private readonly taskServices: TaskService,
    private readonly taskQueryService: TaskQueryService,
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,

    @Inject(GroupsToken.INBOX_READ_REPOSITORY)
    private readonly inboxReadRepo: GroupInboxReadRepository,

    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
  ) {}

  async execute({ input }: CreateTaskInInboxCommand): Promise<TaskView> {
    return this.db.runTransaction(async (trx) => {
      const { id } = await this.taskServices.createTask(input, trx);

      const inboxGroup = await this.inboxReadRepo.getInboxWithTasksByUserId({ userId: input.userId }, trx);
      if (inboxGroup == null) {
        throw new ExceptionInboxNotExist({});
      }

      await this.tasksWriteRepo.addTaskToGroup({ taskId: id, groupId: inboxGroup.id }, trx);

      return await this.taskQueryService.getById({ taskId: id, userId: input.userId }, trx);
    });
  }
}

export { CreateTaskInInboxUseCase };
