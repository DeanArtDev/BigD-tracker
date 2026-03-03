import { ExceptionTaskCreationFailed } from '@/modules/tasks/application/exceptions';
import { Task, TaskFactory, TaskRecurrence } from '@/modules/tasks/domain';
import { TasksToken } from '@/modules/tasks/tokens';
import { Inject, Injectable } from '@nestjs/common';
import { TasksWriteRepository, TaskTransaction } from '../ports';
import { GroupCheckerService } from './group-checker.service';
import { TaskCheckerService } from './task-checker.service';

interface DeleteTaskInput {
  readonly taskId: number;
  readonly userId: number;
}

interface CreateTaskInput {
  readonly userId: number;
  readonly name: string;
  readonly groupId?: number;
  readonly description?: string;
  readonly priority?: number;
  readonly weight?: number;
  readonly recurrence?: TaskRecurrence;
}

interface ReplaceTaskInput {
  readonly id: number;
  readonly name: string;
  readonly userId: number;
  readonly description?: string;
  readonly priority: number;
  readonly weight: number;
  readonly recurrence?: TaskRecurrence;
}

interface AddTaskToGroupInput {
  readonly userId: number;
  readonly groupId: number;
  readonly taskId: number;
}

@Injectable()
class TaskService {
  constructor(
    private readonly taskCheckerService: TaskCheckerService,
    private readonly groupCheckerService: GroupCheckerService,
    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
  ) {}

  async createTask(input: CreateTaskInput, trx?: TaskTransaction): Promise<Task> {
    const draftTask = TaskFactory.create(input);
    const createdTask = await this.tasksWriteRepo.createTask(draftTask, trx);
    const newTask = await this.tasksWriteRepo.getTaskById({ taskId: createdTask.id, userId: createdTask.userId }, trx);

    if (newTask == null) {
      throw new ExceptionTaskCreationFailed({
        taskId: createdTask.id,
      });
    }

    return newTask;
  }

  async cloneTask(input: { taskId: number; userId: number }, trx?: TaskTransaction): Promise<Task> {
    const { taskId, userId } = input;

    const task = await this.taskCheckerService.ensureTaskExists({ taskId, userId }, { trx });
    const clonedTask = TaskFactory.clone(task);

    const createdTask = await this.tasksWriteRepo.createTask(clonedTask, trx);
    const newTask = await this.tasksWriteRepo.getTaskById({ taskId: createdTask.id, userId: createdTask.userId }, trx);

    if (newTask == null) {
      throw new ExceptionTaskCreationFailed({
        taskId: createdTask.id,
      });
    }

    return newTask;
  }

  async softDeleteTask(input: DeleteTaskInput, trx?: TaskTransaction): Promise<{ id: number }> {
    const task = await this.taskCheckerService.ensureTaskExists(
      { taskId: input.taskId, userId: input.userId },
      { trx },
    );
    const draftTask = TaskFactory.deleteSoft(task);
    await this.tasksWriteRepo.changeTaskStatus(draftTask, trx);
    await this.tasksWriteRepo.removeTaskFromGroup({ taskId: draftTask.id }, trx);
    return { id: draftTask.id };
  }

  async replaceTask(input: ReplaceTaskInput, trx?: TaskTransaction): Promise<Task> {
    const task = await this.taskCheckerService.ensureTaskExists({ taskId: input.id, userId: input.userId }, { trx });

    const replacedTask = TaskFactory.replace(task, input);

    return await this.tasksWriteRepo.replaceTask(replacedTask, trx);
  }

  async addTaskToGroup(input: AddTaskToGroupInput, trx?: TaskTransaction): Promise<void> {
    const { taskId, userId, groupId } = input;
    await this.groupCheckerService.ensureGroupExists({ groupId, userId }, { trx, includeInbox: true });
    await this.tasksWriteRepo.addTaskToGroup({ taskId, groupId }, trx);
  }
}

export { TaskService, CreateTaskInput, ReplaceTaskInput, DeleteTaskInput, AddTaskToGroupInput };
