import { Task, TaskIdBuilder } from '@/modules/tasks/domain';
import { TaskStatus } from '@big-d/api-contracts';
import { TaskView } from './task.view';

interface TackPlain {
  readonly id: string;
  readonly userId: number;
  readonly groupId?: number;
  readonly name: string;
  readonly description?: string;
  readonly priority: number;
  readonly weight: number;
  readonly cancelReason?: string;
  readonly startDate?: string;
  readonly deadline?: string;
  readonly endDate?: string;
  readonly status: TaskStatus;
}

class TasksViewMapper {
  static fromAggregateToView = (agr: Task): TaskView => {
    return TaskView.restore({
      id: TaskIdBuilder.wrapOriginId(agr.id),
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

  static fromPlainToView = (plain: TackPlain): TaskView => {
    return TaskView.restore({
      id: plain.id,
      userId: plain.userId,
      groupId: plain.groupId,
      name: plain.name,
      description: plain.description,
      priority: plain.priority,
      weight: plain.weight,
      cancelReason: plain.cancelReason,
      startDate: plain.startDate,
      deadline: plain.deadline,
      endDate: plain.endDate,
      status: plain.status,
    });
  };
}

export { TasksViewMapper };
