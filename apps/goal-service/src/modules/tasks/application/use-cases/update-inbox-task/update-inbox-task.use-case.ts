import { TasksViewMapper, TaskView } from '@/modules/tasks/application/dto';
import { ExceptionTaskCreationFailed, ExceptionTaskUnprocessable } from '@/modules/tasks/application/exceptions';
import { TaskFactory } from '@/modules/tasks/domain';
import { TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { TaskDatabase, TasksWriteRepository } from '../../ports';
import { InboxGroupCheckerService, TaskCheckerService, TaskTypeService } from '../../services';
import { UpdateInboxTaskCommand } from './update-inbox-task.command';

@Injectable()
class UpdateInboxTaskUseCase {
  constructor(
    private readonly taskCheckerService: TaskCheckerService,
    private readonly inboxGroupCheckerService: InboxGroupCheckerService,
    private readonly taskTypeService: TaskTypeService,

    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
  ) {}

  async execute({ input }: UpdateInboxTaskCommand): Promise<TaskView> {
    return this.db.runTransaction(async (trx) => {
      const { id, userId, ...patch } = input;
      const { isOrigin, data } = this.taskTypeService.getType({ taskId: id });

      if (isOrigin) {
        const task = await this.taskCheckerService.ensureTaskExists({ userId, taskId: data.id }, { trx });
        await this.inboxGroupCheckerService.ensureTaskInInboxGroup({ userId, taskId: data.id }, { trx });

        const updatedTaskDraft = TaskFactory.updateInbox(task, patch);
        await this.tasksWriteRepo.replaceTask(updatedTaskDraft, trx);
        const newTask = await this.tasksWriteRepo.getTaskById({ taskId: data.id, userId }, trx);

        if (newTask == null) {
          throw new ExceptionTaskCreationFailed({
            taskId: data.id,
          });
        }

        return TasksViewMapper.fromAggregateToView(newTask);
      }

      throw new ExceptionTaskUnprocessable({ taskId: id, message: 'Не валидный id' });
    });
  }
}

export { UpdateInboxTaskUseCase };
