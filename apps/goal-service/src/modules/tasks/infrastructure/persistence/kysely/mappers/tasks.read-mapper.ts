import { TaskView } from '@/modules/tasks/application/dto';
import { TaskIdBuilder } from '@/modules/tasks/domain';
import { RecurrenceFrequency, TaskRecurrenceStatus, TaskRecurrenceWeekday, TaskStatus } from '@big-d/api-contracts';

interface RawTask {
  readonly id: number;
  readonly user_id: number;
  readonly group_id?: number | null;
  readonly name: string;
  readonly description: string | null;
  readonly priority: number;
  readonly weight: number;
  readonly cancel_reason: string | null;
  readonly start_date: Date | null;
  readonly end_date: Date | null;
  readonly deadline: Date | null;
  readonly status: TaskStatus;
  readonly recurrence?: {
    readonly timezone?: string | null;
    readonly recurrence_status?: TaskRecurrenceStatus | null;
    readonly recurrence_frequency?: keyof typeof RecurrenceFrequency | null;
    readonly start_date?: Date | null;
    readonly interval?: number | null;
    readonly weekdays?: TaskRecurrenceWeekday[] | null;
    readonly monthdays?: number[] | null;
    readonly yearmonths?: number[] | null;
    readonly until_date?: Date | null;
  };
}

class TasksReadKyselyMapper {
  static fromRawToView = (raw: RawTask): TaskView => {
    const {
      interval,
      monthdays,
      yearmonths,
      recurrence_status,
      weekdays,
      until_date,
      start_date,
      recurrence_frequency,
    } = raw.recurrence ?? {};

    const hasRecurrence = recurrence_frequency != null && start_date != null;

    return TaskView.restore({
      id: TaskIdBuilder.wrapOriginId(raw.id),
      userId: raw.user_id,
      groupId: raw.group_id ?? undefined,
      name: raw.name,
      description: raw.description ?? undefined,
      priority: raw.priority,
      weight: raw.weight,
      cancelReason: raw.cancel_reason ?? undefined,
      startDate: raw.start_date != null ? new Date(raw.start_date).toISOString() : undefined,
      deadline: raw.deadline != null ? new Date(raw.deadline).toISOString() : undefined,
      endDate: raw.end_date != null ? new Date(raw.end_date).toISOString() : undefined,
      status: raw.status,
      recurrence: hasRecurrence
        ? {
            startDate: new Date(start_date).toISOString(),
            frequency: RecurrenceFrequency[recurrence_frequency],
            interval: interval ?? undefined,
            weekdays: weekdays ?? undefined,
            monthdays: monthdays ?? undefined,
            status: recurrence_status ?? undefined,
            yearmonths: yearmonths ?? undefined,
            untilDate: until_date != null ? new Date(until_date).toISOString() : undefined,
          }
        : undefined,
    });
  };
}

export { TasksReadKyselyMapper, RawTask };
