import { TaskView } from '@/modules/tasks/application/dto';
import { TaskIdBuilder } from '@/modules/tasks/domain';
import { rawRecurrenceToVo } from './helpers';
import { TaskStatus } from '@big-d/api-contracts';

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
  readonly recurrence: string | null;
}

class TasksReadKyselyMapper {
  static fromRawToView = (raw: RawTask): TaskView => {
    const recurrence = rawRecurrenceToVo(raw.recurrence);

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
      recurrence:
        recurrence != null
          ? {
              frequency: recurrence?.value.frequency,
              weekdays: recurrence?.value.weekdays,
              end: recurrence?.value.end?.value,
              start: recurrence?.value.start?.value,
            }
          : undefined,
    });
  };
}

export { TasksReadKyselyMapper, RawTask };
