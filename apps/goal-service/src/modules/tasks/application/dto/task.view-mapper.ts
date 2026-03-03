import { Task } from '@/modules/tasks/domain';
import { TaskVirtualView } from './task-virtual.view';
import { TaskView } from './task.view';

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
      startDate: agr.startDate,
      deadline: agr.deadline,
      endDate: agr.endDate,
      status: agr.status,
      recurrence: agr.recurrence,
    });
  };

  static fromViewToVirtualView = (view: TaskView): TaskVirtualView => {
    return TaskVirtualView.restore({
      id: `t:${view.id}`,
      userId: view.userId,
      groupId: view.groupId,
      name: view.name,
      description: view.description,
      priority: view.priority,
      weight: view.weight,
      cancelReason: view.cancelReason,
      startDate: view.startDate,
      deadline: view.deadline,
      endDate: view.endDate,
      status: view.status,
      recurrence: view.recurrence,
    });
  };
}

export { TasksViewMapper };
