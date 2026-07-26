import { Task, TaskIdBuilder, TaskOverride, TaskRecurrence } from '@/modules/tasks/domain';
import { TaskStatus } from '@big-d/api-contracts';
import { DateVo } from '@big-d/api-utils';
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
      startDate: agr.startDate != null ? DateVo.create(DateVo.format(agr.startDate)) : undefined,
      deadline: agr.deadline != null ? DateVo.create(DateVo.format(agr.deadline)) : undefined,
      endDate: agr.endDate != null ? DateVo.create(DateVo.format(agr.endDate)) : undefined,
      status: agr.status,
      recurrence: hasRecurrence
        ? {
            startDate: DateVo.create(DateVo.format(recurrence.startDate)),
            untilDate: recurrence.untilDate != null ? DateVo.create(DateVo.format(recurrence.untilDate)) : undefined,
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
      startDate: plain.startDate != null ? DateVo.create(DateVo.format(plain.startDate)) : undefined,
      deadline: plain.deadline != null ? DateVo.create(DateVo.format(plain.deadline)) : undefined,
      endDate: plain.endDate != null ? DateVo.create(DateVo.format(plain.endDate)) : undefined,
      status: plain.status,
    });
  };

  static fromOverrideToView = (override: TaskOverride): TaskView => {
    return TaskView.restore({
      id: TaskIdBuilder.wrapOverrideId({
        overrideId: override.id,
        recurrenceId: override.recurrenceId,
        date: override.recurrenceStart,
      }),
      userId: override.userId,
      groupId: override.groupId,
      name: override.name,
      description: override.description,
      priority: override.priority,
      weight: override.weight,
      cancelReason: override.cancelReason,
      startDate: override.startDate != null ? DateVo.create(DateVo.format(override.startDate)) : undefined,
      deadline: override.deadline != null ? DateVo.create(DateVo.format(override.deadline)) : undefined,
      endDate: override.endDate != null ? DateVo.create(DateVo.format(override.endDate)) : undefined,
      status: override.status,
      recurrence: undefined,
    });
  };
}

export { TasksViewMapper };
