import { TaskFactory } from '@/modules/tasks/domain';
import { TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { TasksViewMapper, TaskView } from '../../dto';
import { ExceptionTaskUnprocessable } from '../../exceptions';
import { TaskDatabase, TasksWriteRepository } from '../../ports';
import { GroupCheckerService, TaskCheckerService, TaskTypeService } from '../../services';
import { TaskRecoveryCommand } from './task-recovery.command';

@Injectable()
class TaskRecoveryUseCase {
  constructor(
    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,

    private readonly taskCheckerService: TaskCheckerService,
    private readonly groupCheckerService: GroupCheckerService,
    private readonly taskTypeService: TaskTypeService,
  ) {}

  async execute({ input }: TaskRecoveryCommand): Promise<TaskView> {
    return this.db.runTransaction(async (trx) => {
      const { taskId, userId, groupId } = input;
      const { isOrigin, data } = this.taskTypeService.getType({ taskId });

      if (isOrigin) {
        const task = await this.taskCheckerService.ensureTaskExists({ taskId: data.id, userId }, { trx });
        const recoveredTask = TaskFactory.recovery(task);
        await this.groupCheckerService.ensureGroupExists({ groupId, userId }, { trx, includeInbox: true });
        TaskFactory.assignToGroup(recoveredTask, groupId);
        const savedTask = await this.tasksWriteRepo.replaceTask(recoveredTask, trx);
        return TasksViewMapper.fromAggregateToView(savedTask, null);
      }

      throw new ExceptionTaskUnprocessable({ taskId, message: 'Не валидный id' });
    });
  }
}

export { TaskRecoveryUseCase };
