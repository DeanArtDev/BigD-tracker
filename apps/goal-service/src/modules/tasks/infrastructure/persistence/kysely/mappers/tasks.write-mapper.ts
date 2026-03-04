import { Priority, Task, TaskOverride, Weight } from '@/modules/tasks/domain';
import { TaskOverrideType, TaskStatus } from '@big-d/api-contracts';
import { DateVo, Name } from '@big-d/api-utils';
import { rawRecurrenceToVo } from './helpers';

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
  readonly recurrence: string | null;
}

interface RawTaskOverride extends Omit<RawTask, 'recurrence'> {
  readonly override_type: TaskOverrideType;
  readonly occurrence_start: Date;
  readonly task_id: number;
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
      recurrence: rawRecurrenceToVo(raw.recurrence),
    });
  };

  static fromRawToOverrideAgr = ({ override_type, task_id, occurrence_start, ...taskRaw }: RawTaskOverride) => {
    return TaskOverride.restore({
      task: TasksWriteKyselyMapper.fromRawToAgr({ ...taskRaw, recurrence: null }),
      type: override_type,
      masterTaskId: task_id,
      occurrenceStart: DateVo.restore(occurrence_start.toISOString()).value,
    });
  };
}

export { TasksWriteKyselyMapper, RawTask };
