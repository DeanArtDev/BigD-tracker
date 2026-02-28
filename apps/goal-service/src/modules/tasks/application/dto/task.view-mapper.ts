import { TaskView } from './task.view';
import { Task } from '@/modules/tasks/domain';

class TasksViewMapper {
  static fromAggregateToView = (agr: Task): TaskView => {
    return TaskView.restore({
      id: agr.id,
      userId: agr.userId,
      groupId: agr.groupId,
      name: agr.name,
      description: agr.description,
      priority: agr.priority,
      weight: agr.weight,
      cancelReason: agr.cancelReason,
      endDate: agr.endDate,
      status: agr.status,
      recurrence: {
        frequency: agr.recurrence?.value.frequency,
        deadline: agr.recurrence?.value.deadline?.value,
        startDate: agr.recurrence?.value.startDate?.value,
      },
    });
  };
}

export { TasksViewMapper };
