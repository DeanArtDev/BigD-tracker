import { TasksViewMapper, TaskView } from '@/modules/tasks/application/dto';
import { ExceptionTaskCreationFailed } from '@/modules/tasks/application/exceptions';
import { TaskFactory } from '@/modules/tasks/domain';
import { TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { TaskDatabase, TasksWriteRepository } from '../../ports';
import { InboxGroupCheckerService, TaskCheckerService } from '../../services';
import { UpdateInboxTaskCommand } from './update-inbox-task.command';

@Injectable()
class UpdateInboxTaskUseCase {
  constructor(
    private readonly taskCheckerService: TaskCheckerService,
    private readonly inboxGroupCheckerService: InboxGroupCheckerService,
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
  ) {}

  async execute({ input }: UpdateInboxTaskCommand): Promise<TaskView> {
    return this.db.runTransaction(async (trx) => {
      const checkerInput = { taskId: input.id, userId: input.userId };

      const task = await this.taskCheckerService.ensureTaskExists(checkerInput, { trx });
      await this.inboxGroupCheckerService.ensureTaskInInboxGroup(checkerInput, { trx });

      const updatedTaskDraft = TaskFactory.updateInbox(task, input);
      const updatedTask = await this.tasksWriteRepo.replaceTask(updatedTaskDraft, trx);
      const newTask = await this.tasksWriteRepo.getTaskById(
        { taskId: updatedTask.id, userId: updatedTask.userId },
        trx,
      );

      if (newTask == null) {
        throw new ExceptionTaskCreationFailed({
          taskId: updatedTask.id,
        });
      }

      return TasksViewMapper.fromAggregateToView(newTask);
    });
  }
}

export { UpdateInboxTaskUseCase };
