import { Priority, Task, Weight } from '@/modules/tasks/domain';
import { TaskStatus } from '@big-d/api-contracts';
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

class TasksWriteKyselyMapper {
  static fromRawToAgr(raw: RawTask): Task {
    const recurrence = rawRecurrenceToVo({
      recurrence: raw.recurrence,
      startDate: raw.start_date,
      deadline: raw.deadline,
    });

    return Task.restore({
      id: raw.id,
      userId: raw.user_id,
      groupId: raw.group_id ?? undefined,
      name: Name.restore(raw.name),
      description: raw.description ?? undefined,
      priority: Priority.restore(raw.priority),
      weight: Weight.restore(raw.weight),
      cancelReason: raw.cancel_reason ?? undefined,
      endDate: raw.end_date != null ? DateVo.restore(raw.end_date.toISOString()) : undefined,
      status: raw.status as TaskStatus,
      recurrence,
    });
  }
}

export { TasksWriteKyselyMapper, RawTask };
