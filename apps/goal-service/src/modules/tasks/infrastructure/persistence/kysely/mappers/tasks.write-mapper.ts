import { Task, Weight, Priority } from '@/modules/tasks/domain';
import { TaskStatus } from '@big-d/api-contracts';
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
  readonly recurrence: string | null;
}

class TasksWriteKyselyMapper {
  static fromRawToAgr(raw: RawTask): Task {
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
      endDate: raw.end_date != null ? DateVo.restore(raw.end_date.toISOString()) : undefined,
      deadline: raw.deadline != null ? DateVo.restore(raw.deadline.toISOString()) : undefined,
      status: raw.status as TaskStatus,
      recurrence: raw.recurrence ?? undefined,
    });
  }
}

export { TasksWriteKyselyMapper, RawTask };
