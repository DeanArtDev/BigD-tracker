import { TaskWithRecurrenceService } from '@/modules/tasks/domain/services';
import { TimezoneVo } from '@big-d/api-utils';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { GoalServiceRequestContext } from '@shared/request-context';
import { TaskView } from '../../dto';
import { TaskDatabase } from '../../ports';
import { TaskQueryService, TaskRecurrenceQueryService, TaskRecurrenceService, TaskService } from '../../services';
import { CreateTaskCommand } from './create-task.command';

@Injectable()
class CreateTaskUseCase {
  private readonly taskWithRecurrenceService = new TaskWithRecurrenceService();

  constructor(
    private readonly taskServices: TaskService,
    private readonly taskQueryService: TaskQueryService,
    private readonly taskRecurrenceService: TaskRecurrenceService,
    private readonly taskRecurrenceQueryService: TaskRecurrenceQueryService,

    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
  ) {}

  async execute({ input }: CreateTaskCommand): Promise<TaskView> {
    return this.db.runTransaction(async (trx) => {
      const { recurrence } = input;

      const createdTask = await this.taskServices.createTask(input, trx);

      if (input.groupId != null) {
        await this.taskServices.addTaskToGroup(
          { taskId: createdTask.id, groupId: input.groupId, userId: input.userId },
          trx,
        );
      }

      if (recurrence != null) {
        const userTimezone = TimezoneVo.create(
          GoalServiceRequestContext.getStore()?.state?.userTimezone ?? 'UTC',
        ).value;

        const { draftRecurrence } = this.taskWithRecurrenceService.create({
          patternShaper: (data) => this.taskRecurrenceQueryService.createRule(data).toString(),
          task: createdTask,
          recurrenceData: {
            timezone: userTimezone,
            ...recurrence,
          },
        });
        await this.taskRecurrenceService.upsertRecurrence(draftRecurrence, trx);
      }

      return await this.taskQueryService.getById({ taskId: createdTask.id, userId: input.userId }, trx);
    });
  }
}

export { CreateTaskUseCase };
