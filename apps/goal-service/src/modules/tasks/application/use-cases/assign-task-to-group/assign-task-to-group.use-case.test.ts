import { TaskStatus } from '@big-d/api-contracts';
import { DateVo, Name } from '@big-d/api-utils';
import { AssignTaskToGroupCommand } from './assign-task-to-group.command';
import { AssignTaskToGroupUseCase } from './assign-task-to-group.use-case';
import { Task } from '@/modules/tasks/domain/aggregates/task/tasks.aggregate';
import { Priority, Weight } from '@/modules/tasks/domain/value-objects';

const futureDate = (offsetDays: number) =>
  new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000).toISOString();

describe('AssignTaskToGroupUseCase', () => {
  const trx = { id: 'trx' };

  const buildTask = (): Task =>
    Task.restore({
      id: 10,
      userId: 5,
      name: Name.create('Assigned task'),
      description: 'Assignment',
      priority: Priority.create(2),
      weight: Weight.create(100),
      startDate: DateVo.create(futureDate(1)),
      deadline: DateVo.create(futureDate(2)),
      status: TaskStatus.NOT_STARTED,
      recurrence: undefined,
    });

  it('assigns the task to a group and updates repositories', async () => {
    const task = buildTask();

    const taskService = {
      addTaskToGroup: jest.fn().mockResolvedValue(undefined),
    };
    const taskCheckerService = {
      ensureTaskExists: jest.fn().mockResolvedValue(task),
    };
    const groupCheckerService = {
      ensureTaskNotInGroup: jest.fn().mockResolvedValue(true),
    };
    const tasksWriteRepo = {
      removeTaskFromGroup: jest.fn().mockResolvedValue(undefined),
    };
    const db = {
      runTransaction: jest.fn(async (callback: (transaction: typeof trx) => Promise<any>) =>
        callback(trx),
      ),
    };

    const useCase = new AssignTaskToGroupUseCase(
      taskService as never,
      taskCheckerService as never,
      groupCheckerService as never,
      tasksWriteRepo as never,
      db as never,
    );

    const result = await useCase.execute(
      new AssignTaskToGroupCommand({ taskId: 10, groupId: 33, userId: 5 }),
    );

    expect(result).toEqual({ success: true });
    expect(db.runTransaction).toHaveBeenCalledTimes(1);
    expect(taskCheckerService.ensureTaskExists).toHaveBeenCalledWith(
      { taskId: 10, userId: 5 },
      { trx },
    );
    expect(groupCheckerService.ensureTaskNotInGroup).toHaveBeenCalledWith(
      { taskId: 10, userId: 5, groupId: 33 },
      { trx },
    );
    expect(tasksWriteRepo.removeTaskFromGroup).toHaveBeenCalledWith({ taskId: 10 }, trx);
    expect(taskService.addTaskToGroup).toHaveBeenCalledWith(
      { taskId: task.id, groupId: 33, userId: 5 },
      trx,
    );
  });

  it('propagates errors from task lookup and skips group changes', async () => {
    const taskService = {
      addTaskToGroup: jest.fn(),
    };
    const taskCheckerService = {
      ensureTaskExists: jest.fn().mockRejectedValue(new Error('Missing task')),
    };
    const groupCheckerService = {
      ensureTaskNotInGroup: jest.fn(),
    };
    const tasksWriteRepo = {
      removeTaskFromGroup: jest.fn(),
    };
    const db = {
      runTransaction: jest.fn(async (callback: (transaction: typeof trx) => Promise<any>) =>
        callback(trx),
      ),
    };

    const useCase = new AssignTaskToGroupUseCase(
      taskService as never,
      taskCheckerService as never,
      groupCheckerService as never,
      tasksWriteRepo as never,
      db as never,
    );

    await expect(
      useCase.execute(new AssignTaskToGroupCommand({ taskId: 11, groupId: 44, userId: 6 })),
    ).rejects.toThrow('Missing task');

    expect(groupCheckerService.ensureTaskNotInGroup).not.toHaveBeenCalled();
    expect(tasksWriteRepo.removeTaskFromGroup).not.toHaveBeenCalled();
    expect(taskService.addTaskToGroup).not.toHaveBeenCalled();
  });
});
