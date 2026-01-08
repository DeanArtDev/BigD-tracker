import { DB } from '@/infrastructure/types';
import { TaskView } from '@/modules/tasks/application/dto/task.view';
import { TasksViewMapper } from '@/modules/tasks/application/dto/task.view-mapper';
import { TasksWriteRepository } from '@/modules/tasks/application/ports';
import { GroupCheckerService, TaskCheckerService } from '@/modules/tasks/application/services';
import { TaskFactory } from '@/modules/tasks/domain';
import { Database } from '@/modules/tasks/infrastructure/database.interface';
import { TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { UpdateInboxTaskCommand } from './update-inbox-task.command';

@Injectable()
class UpdateInboxTaskUseCase {
  constructor(
    private readonly taskCheckerService: TaskCheckerService,
    private readonly groupCheckerService: GroupCheckerService,
    @Inject(databaseToken.CONNECTION) private readonly db: Database<DB>,
    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
  ) {}

  async execute({ input }: UpdateInboxTaskCommand): Promise<TaskView> {
    return this.db.runTransaction(async (trx) => {
      const checkerInput = { taskId: input.id, userId: input.userId };

      const task = await this.taskCheckerService.ensureTaskExists(checkerInput, { trx });
      await this.groupCheckerService.ensureTaskInInboxGroup(checkerInput, { trx });

      const updatedTaskDraft = TaskFactory.updateInbox(task, input);
      const updatedTask = await this.tasksWriteRepo.replaceTask(updatedTaskDraft, trx);

      return TasksViewMapper.fromAggregateToView(updatedTask);
    });
  }
}

export { UpdateInboxTaskUseCase };
