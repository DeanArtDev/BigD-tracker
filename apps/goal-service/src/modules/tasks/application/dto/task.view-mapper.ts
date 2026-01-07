import { TaskView } from './task.view';
import { Task } from '@/modules/tasks/domain';

class TasksViewMapper {
  static fromAggregateToView = (agr: Task): TaskView => {
    return TaskView.restore({
      id: agr.id,
      userId: agr.userId,
      name: agr.name,
      description: agr.description,
      priority: agr.priority,
      weight: agr.weight,
      cancelReason: agr.cancelReason,
      startDate: agr.startDate,
      endDate: agr.endDate,
      deadline: agr.deadline,
      status: agr.status,
      recurrence: agr.recurrence,
    });
  };
}

export { TasksViewMapper };
