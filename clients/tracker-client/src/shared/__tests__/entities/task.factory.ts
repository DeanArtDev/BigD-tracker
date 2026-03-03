import { type TaskEntity, type TaskInboxEntity, TaskPriority, TaskStatus } from '@/entity/planner/tasks';

class TaskFactory {
  static #counter = 1;

  static createInboxTask(overrides: Partial<TaskInboxEntity> = {}): TaskInboxEntity {
    const id = `o:${TaskFactory.#counter++}`;

    return {
      id,
      name: 'Inbox task',
      groupId: undefined,
      startDate: undefined,
      deadline: undefined,
      description: undefined,
      priority: 2,
      recurrence: undefined,
      ...overrides,
    };
  }

  static createTask(overrides: Partial<TaskEntity> = {}): TaskEntity {
    const id = `o:${TaskFactory.#counter++}`;

    return {
      id,
      name: 'Task',
      description: undefined,
      groupId: undefined,
      endDate: undefined,
      startDate: undefined,
      deadline: undefined,
      weight: 1,
      cancelReason: undefined,
      recurrence: undefined,
      priority: TaskPriority.PLAN,
      status: TaskStatus.NOT_STARTED,
      ...overrides,
    };
  }
}

const TaskFabric = TaskFactory;

export { TaskFactory, TaskFabric };
