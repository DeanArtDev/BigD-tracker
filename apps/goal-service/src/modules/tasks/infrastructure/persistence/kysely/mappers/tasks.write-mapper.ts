import { Priority, Task, TaskOverride, TaskRecurrence, Weight } from '@/modules/tasks/domain';
import { RecurrenceFrequency, TaskOverrideType, TaskRecurrenceWeekday, TaskStatus } from '@big-d/api-contracts';
import { DateVo, Name } from '@big-d/api-utils';

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
  readonly status: string;
  readonly recurrence_id?: number | null;
}

interface RawTaskRecurrence {
  readonly id: number;
  readonly task_id: number;
  readonly user_id: number;
  readonly timezone: string;
  readonly recurrence_frequency: keyof typeof RecurrenceFrequency;
  readonly start_date: Date;
  readonly pattern: string;
  readonly weekstart: TaskRecurrenceWeekday;
  readonly interval?: number | null;
  readonly weekdays?: TaskRecurrenceWeekday[] | null;
  readonly monthdays?: number[] | null;
  readonly yearmonths?: number[] | null;
  readonly until_date?: Date | null;
}

interface RawTaskOverride extends Omit<RawTask, 'recurrence_id'> {
  readonly override_type: TaskOverrideType;
  readonly recurrence_id: number;
  readonly recurrence_start: Date;
}

class TasksWriteKyselyMapper {
  static fromRawToAgr = (raw: RawTask): Task => {
    return Task.restore({
      id: raw.id,
      userId: raw.user_id,
      groupId: raw.group_id ?? undefined,
      name: Name.restore(raw.name),
      description: raw.description ?? undefined,
      priority: Priority.restore(raw.priority),
      weight: Weight.restore(raw.weight),
      cancelReason: raw.cancel_reason ?? undefined,
      startDate: raw.start_date != null ? DateVo.restore(raw.start_date.toISOString()) : undefined,
      deadline: raw.deadline != null ? DateVo.restore(raw.deadline.toISOString()) : undefined,
      endDate: raw.end_date != null ? DateVo.restore(raw.end_date.toISOString()) : undefined,
      status: raw.status as TaskStatus,
      recurrenceId: raw.recurrence_id ?? undefined,
    });
  };

  static fromRawToRecurrence = (raw: RawTaskRecurrence): TaskRecurrence => {
    return TaskRecurrence.restore({
      id: raw.id,
      userId: raw.user_id,
      taskId: raw.task_id,
      timezone: raw.timezone,
      frequency: RecurrenceFrequency[raw.recurrence_frequency],
      startDate: DateVo.restore(raw.start_date.toISOString()),
      pattern: raw.pattern,
      weekstart: raw.weekstart,
      interval: raw.interval ?? undefined,
      weekdays: raw.weekdays ?? undefined,
      monthdays: raw.monthdays ?? undefined,
      yearmonths: raw.yearmonths ?? undefined,
      untilDate: raw.until_date != null ? DateVo.restore(raw.until_date.toISOString()) : undefined,
    });
  };

  static fromRawToOverrideAgr = ({ override_type, recurrence_id, recurrence_start, ...taskRaw }: RawTaskOverride) => {
    return TaskOverride.restore({
      task: TasksWriteKyselyMapper.fromRawToAgr({ ...taskRaw, recurrence_id }),
      type: override_type,
      recurrenceId: recurrence_id,
      recurrenceStart: DateVo.restore(recurrence_start.toISOString()),
    });
  };
}

export { TasksWriteKyselyMapper, RawTask, RawTaskRecurrence };
