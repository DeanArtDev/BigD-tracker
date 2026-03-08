import { Task, TaskIdBuilder, TaskOverride, TaskRecurrence } from '@/modules/tasks/domain';
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
  static fromAggregateToView = (agr: Task, recurrence: TaskRecurrence | null): TaskView => {
    const hasRecurrence = recurrence != null;
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
      recurrence: hasRecurrence
        ? {
            startDate: recurrence.startDate,
            untilDate: recurrence.untilDate,
            frequency: recurrence.frequency.value,
            interval: recurrence.interval,
            monthdays: recurrence.monthdays,
            yearmonths: recurrence.yearmonths,
            weekstart: recurrence.weekstart,
            weekdays: recurrence.weekdays,
          }
        : undefined,
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

  static fromOverrideToView = (override: TaskOverride): TaskView => {
    return TaskView.restore({
      id: TaskIdBuilder.wrapOriginId(override.id),
      userId: override.userId,
      groupId: override.groupId,
      name: override.name,
      description: override.description,
      priority: override.priority,
      weight: override.weight,
      cancelReason: override.cancelReason,
      startDate: override.startDate,
      deadline: override.deadline,
      endDate: override.endDate,
      status: override.status,
      recurrence: undefined,
    });
  };
}

export { TasksViewMapper };
