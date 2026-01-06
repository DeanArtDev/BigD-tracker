import { DB } from '@/infrastructure/types';
import { TaskView } from '@/modules/tasks/application/dto/task.view';
import { ExceptionGroupIsNotExists } from '@/modules/tasks/application/exceptions';
import { Database } from '@/modules/tasks/infrastructure/database.interface';
import { GroupsToken, TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { GroupsReadRepository, TasksReadRepository, TasksWriteRepository } from '../../ports';
import { CreateTaskInput, TaskServices } from '../../services';

@Injectable()
class CreateTaskUseCase {
  constructor(
    private readonly taskServices: TaskServices,
    @Inject(databaseToken.CONNECTION) private readonly db: Database<DB>,
    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
    @Inject(TasksToken.READ_REPOSITORY) private readonly tasksReadRepo: TasksReadRepository,
    @Inject(GroupsToken.READ_REPOSITORY) private readonly groupReadRepo: GroupsReadRepository,
  ) {}

  async execute(input: CreateTaskInput): Promise<TaskView> {
    return this.db.runTransaction(async (trx) => {
      const { id } = await this.taskServices.createTask(input, trx);

      if (input.groupId != null) {
        const isExists = await this.groupReadRepo.isGroupExists({ groupId: input.groupId });
        if (!isExists) {
          throw new ExceptionGroupIsNotExists({ groupId: input.groupId });
        }
        await this.tasksWriteRepo.addTaskToGroup({ taskId: id, groupId: input.groupId }, trx);
      }

      return await this.tasksReadRepo.getById({ id, userId: input.userId }, trx);
    });
  }
}

export { CreateTaskUseCase };
