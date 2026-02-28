import { TaskView } from '@/modules/tasks/application/dto/task.view';
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
    const recurrence = rawRecurrenceToVo({
      recurrence: raw.recurrence,
      startDate: raw.start_date,
      deadline: raw.deadline,
    });

    return TaskView.restore({
      id: raw.id,
      userId: raw.user_id,
      groupId: raw.group_id ?? undefined,
      name: raw.name,
      description: raw.description ?? undefined,
      priority: raw.priority,
      weight: raw.weight,
      cancelReason: raw.cancel_reason ?? undefined,
      endDate: raw.end_date != null ? new Date(raw.end_date).toISOString() : undefined,
      status: raw.status,
      recurrence: {
        frequency: recurrence?.value.frequency,
        deadline: recurrence?.value.deadline?.value,
        startDate: recurrence?.value.startDate?.value,
      },
    });
  };
}

export { TasksReadKyselyMapper, RawTask };
