import { GroupsToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { TasksViewMapper, TaskView } from '../../dto';
import { ExceptionInboxNotExist } from '../../exceptions';
import { GroupInboxReadRepository, TaskDatabase } from '../../ports';
import { TaskService } from '../../services';
import { CreateTaskInInboxCommand } from './create-task-in-inbox.command';

@Injectable()
class CreateTaskInInboxUseCase {
  constructor(
    private readonly taskServices: TaskService,
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,

    @Inject(GroupsToken.INBOX_READ_REPOSITORY)
    private readonly inboxReadRepo: GroupInboxReadRepository,
  ) {}

  async execute({ input }: CreateTaskInInboxCommand): Promise<TaskView> {
    return this.db.runTransaction(async (trx) => {
      const inboxGroup = await this.inboxReadRepo.getInboxWithTasksByUserId({ userId: input.userId }, trx);
      if (inboxGroup == null) {
        throw new ExceptionInboxNotExist({});
      }

      const createdTask = await this.taskServices.createTask({ ...input, groupId: inboxGroup.id }, trx);
      return TasksViewMapper.fromAggregateToView(createdTask, null);
    });
  }
}

export { CreateTaskInInboxUseCase };
