import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TasksViewMapper, TaskView } from '../../dto';
import { ExceptionTaskUnprocessable } from '../../exceptions';
import { TaskCheckerService, TaskOverrideService, TaskQueryService, TaskTypeService } from '../../services';
import { GetTaskByIdQuery } from './get-task-by-id.query';

@QueryHandler(GetTaskByIdQuery)
export class GetTaskByIdHandler implements IQueryHandler<GetTaskByIdQuery> {
  constructor(
    private readonly taskQueryService: TaskQueryService,
    private readonly taskTypeService: TaskTypeService,
    private readonly taskCheckerService: TaskCheckerService,
    private readonly taskOverrideService: TaskOverrideService,
  ) {}

  async execute({ input }: GetTaskByIdQuery): Promise<TaskView> {
    const { userId, taskId } = input;
    const { isOrigin, isVirtual, isOverride, data } = this.taskTypeService.getType({ taskId });

    if (isOrigin) {
      return await this.taskQueryService.getById({ taskId: data.id, userId });
    }

    if (isVirtual) {
      const recurrence = await this.taskCheckerService.ensureRecurrenceExists({ userId, id: data.recurrenceId });
      return await this.taskQueryService.getById({ taskId: recurrence.taskId, userId });
    }

    if (isOverride) {
      const override = await this.taskOverrideService.getOverride({ userId, id: data.overrideId });

      if (override.recurrenceId !== data.recurrenceId) {
        throw new ExceptionTaskUnprocessable({ taskId, message: 'Не валидный id' });
      }

      return TasksViewMapper.fromOverrideToView(override);
    }

    throw new ExceptionTaskUnprocessable({ taskId, message: 'Не валидный id' });
  }
}
