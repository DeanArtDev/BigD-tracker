import { TaskView } from '@/modules/tasks/application/dto';
import { RecurrenceVo, Task, TaskRecurrence } from '@/modules/tasks/domain';
import { Priority, Weight } from '@/modules/tasks/domain';
import { TaskStatus } from '@big-d/api-contracts';
import { DateVo, Name } from '@big-d/api-utils';

const getTask = (
  data: Partial<{
    id: number;
    userId: number;
    name: string;
    description?: string;
    priority: number;
    weight: number;
    startDate?: string;
    deadline?: string;
    status: TaskStatus;
    recurrence?: TaskRecurrence;
  }> = {},
): Task => {
  const { start, end, frequency } = data.recurrence ?? {};
  const hasRecurrence = start != null;

  return Task.restore({
    id: data.id ?? 1,
    userId: data.userId ?? 1,
    name: Name.restore(data.name ?? 'Task name'),
    description: data.description,
    priority: Priority.restore(data.priority ?? 2),
    weight: Weight.restore(data.weight ?? 1),
    endDate: undefined,
    status: data.status ?? TaskStatus.NOT_STARTED,
    recurrence: hasRecurrence
      ? RecurrenceVo.create({
          frequency: frequency,
          start: DateVo.restore(start),
          end: end ? DateVo.restore(end) : undefined,
        })
      : undefined,
  });
};

const getTaskView = (
  data: Partial<{
    id: number;
    userId: number;
    name: string;
    description?: string;
    priority: number;
    weight: number;
    cancelReason?: string;
    startDate?: string;
    endDate?: string;
    deadline?: string;
    status: TaskStatus;
    recurrence?: TaskRecurrence;
  }> = {},
): TaskView => {
  const { start, end, frequency } = data.recurrence ?? {};
  const hasRecurrence = start != null;

  return TaskView.restore({
    id: data.id ?? 1,
    userId: data.userId ?? 1,
    name: data.name ?? 'Task name',
    description: data.description,
    priority: data.priority ?? 2,
    weight: data.weight ?? 1,
    cancelReason: data.cancelReason,
    endDate: data.endDate,
    status: data.status ?? TaskStatus.NOT_STARTED,
    recurrence: hasRecurrence
      ? {
          start,
          frequency,
          end,
        }
      : undefined,
  });
};

export { getTask, getTaskView };
