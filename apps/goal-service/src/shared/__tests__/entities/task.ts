import { TaskView } from '@/modules/tasks/application/dto';
import { Task } from '@/modules/tasks/domain';
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
    recurrence?: string;
  }> = {},
): Task => {
  return Task.restore({
    id: data.id ?? 1,
    userId: data.userId ?? 1,
    name: Name.restore(data.name ?? 'Task name'),
    description: data.description,
    priority: Priority.restore(data.priority ?? 2),
    weight: Weight.restore(data.weight ?? 1),
    startDate: data.startDate ? DateVo.restore(data.startDate) : undefined,
    endDate: undefined,
    deadline: data.deadline ? DateVo.restore(data.deadline) : undefined,
    status: data.status ?? TaskStatus.NOT_STARTED,
    recurrence: data.recurrence,
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
    recurrence?: string;
  }> = {},
): TaskView => {
  return TaskView.restore({
    id: data.id ?? 1,
    userId: data.userId ?? 1,
    name: data.name ?? 'Task name',
    description: data.description,
    priority: data.priority ?? 2,
    weight: data.weight ?? 1,
    cancelReason: data.cancelReason,
    startDate: data.startDate,
    endDate: data.endDate,
    deadline: data.deadline,
    status: data.status ?? TaskStatus.NOT_STARTED,
    recurrence: data.recurrence,
  });
};

export { getTask, getTaskView };
