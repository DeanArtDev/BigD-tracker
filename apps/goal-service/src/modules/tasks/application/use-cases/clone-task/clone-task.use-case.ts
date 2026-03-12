import { TaskView } from '@/modules/tasks/application/dto/task.view';
import {
  ExceptionRecurrenceNotExist,
  ExceptionTaskCreationFailed,
  ExceptionTaskUnprocessable,
} from '@/modules/tasks/application/exceptions';
import { TaskDatabase, TasksWriteRepository } from '@/modules/tasks/application/ports';
import { TaskOverrideDomainService, TaskVirtualService } from '@/modules/tasks/domain/services';
import { TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import {
  TaskCheckerService,
  TaskOverrideService,
  TaskQueryService,
  TaskRecurrenceService,
  TaskService,
  TaskTypeService,
} from '../../services';
import { CloneTaskCommand } from './clone-task.command';

@Injectable()
class CloneTaskUseCase {
  private taskVirtualService = new TaskVirtualService();
  private taskOverrideDomainService = new TaskOverrideDomainService();

  constructor(
    private readonly taskServices: TaskService,
    private readonly taskCheckerService: TaskCheckerService,
    private readonly taskTypeService: TaskTypeService,
    private readonly taskRecurrenceService: TaskRecurrenceService,
    private readonly taskOverrideService: TaskOverrideService,
    private readonly taskQueryService: TaskQueryService,

    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
  ) {}

  async execute({ input }: CloneTaskCommand): Promise<TaskView> {
    return this.db.runTransaction(async (trx) => {
      const { taskId, userId, groupId } = input;
      const { isOrigin, isVirtual, isOverride, data } = this.taskTypeService.getType({ taskId });

      if (isOrigin) {
        const clonedTask = await this.taskServices.cloneTask({ taskId: data.id, userId }, trx);
        if (groupId != null) {
          await this.taskServices.addTaskToGroup({ taskId: clonedTask.id, userId, groupId }, trx);
        }
        return await this.taskQueryService.getById({ taskId: clonedTask.id, userId: clonedTask.userId }, trx);
      }

      if (isVirtual) {
        const recurrence = await this.taskRecurrenceService.getRecurrence({ userId, id: data.recurrenceId }, trx);

        if (recurrence == null) {
          throw new ExceptionRecurrenceNotExist({ recurrenceId: data.recurrenceId, taskId });
        }

        const sourceTask = await this.taskCheckerService.ensureTaskExists(
          { taskId: recurrence.taskId, userId },
          { trx },
        );
        const { task } = this.taskVirtualService.clone({
          taskId,
          sourceTask,
          currentRecurrence: recurrence,
        });
        const createdTask = await this.tasksWriteRepo.createTask(task, trx);
        const clonedTask = await this.tasksWriteRepo.getTaskById(
          { taskId: createdTask.id, userId: createdTask.userId },
          trx,
        );

        if (clonedTask == null) {
          throw new ExceptionTaskCreationFailed({
            taskId: createdTask.id,
          });
        }

        if (groupId != null) {
          await this.taskServices.addTaskToGroup({ taskId: clonedTask.id, userId, groupId }, trx);
        }

        return await this.taskQueryService.getById({ taskId: clonedTask.id, userId: clonedTask.userId }, trx);
      }

      if (isOverride) {
        const recurrence = await this.taskRecurrenceService.getRecurrence({ userId, id: data.recurrenceId }, trx);

        if (recurrence == null) {
          throw new ExceptionRecurrenceNotExist({ recurrenceId: data.recurrenceId, taskId });
        }

        const sourceTask = await this.taskCheckerService.ensureTaskExists(
          { taskId: recurrence.taskId, userId },
          { trx },
        );
        const override = await this.taskOverrideService.getOverride({ userId, id: data.overrideId }, trx);
        const { task } = this.taskOverrideDomainService.clone({
          taskId,
          sourceTask,
          currentRecurrence: recurrence,
          override,
        });
        const createdTask = await this.tasksWriteRepo.createTask(task, trx);
        const clonedTask = await this.tasksWriteRepo.getTaskById(
          { taskId: createdTask.id, userId: createdTask.userId },
          trx,
        );

        if (clonedTask == null) {
          throw new ExceptionTaskCreationFailed({
            taskId: createdTask.id,
          });
        }

        if (groupId != null) {
          await this.taskServices.addTaskToGroup({ taskId: clonedTask.id, userId, groupId }, trx);
        }

        return await this.taskQueryService.getById({ taskId: clonedTask.id, userId: clonedTask.userId }, trx);
      }

      throw new ExceptionTaskUnprocessable({ taskId, message: 'Не валидный id' });
    });
  }
}

export { CloneTaskUseCase };
