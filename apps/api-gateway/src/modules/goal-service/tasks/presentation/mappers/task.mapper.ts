import { TaskSchema } from '@/modules/goal-service/tasks';
import { TaskPriority } from '@big-d/api-contracts';
import { TaskDto } from '@big-d/api-contracts';

class TaskMapper {
  static fromClientPriorityToServer = (priority: TaskPriority): number => {
    return {
      [TaskPriority.Do]: 1,
      [TaskPriority.Plan]: 2,
      [TaskPriority.Delegate]: 3,
      [TaskPriority.Delete]: 4,
    }[priority];
  };

  static fromServerPriorityToClient = (priority: number): TaskPriority => {
    if (priority <= 0 || priority > 4) {
      return TaskPriority.Delete;
    }

    return {
      1: TaskPriority.Do,
      2: TaskPriority.Plan,
      3: TaskPriority.Delegate,
      4: TaskPriority.Delete,
    }[priority] as TaskPriority;
  };

  static fromServerTaskDtoToClientDto = (task: TaskDto): TaskSchema => {
    return {
      id: task.id,
      userId: task.userId,
      name: task.name,
      status: task.status,
      groupId: task.groupId,
      description: task.description,
      cancelReason: task.cancelReason,
      startDate: task.startDate,
      deadline: task.deadline,
      endDate: task.endDate,
      priority: TaskMapper.fromServerPriorityToClient(task.priority),
    };
  };
}

export { TaskMapper };
