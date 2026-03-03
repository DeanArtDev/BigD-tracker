import { TaskRecurrence } from '@/modules/tasks/domain';
import { TaskStatus } from '@big-d/api-contracts';

type TaskVirtualId = string;

interface TaskVirtualViewState {
  readonly id: TaskVirtualId;
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
  readonly recurrence?: TaskRecurrence;
}

class TaskVirtualView {
  constructor(
    public readonly id: TaskVirtualId,
    public readonly userId: number,
    public readonly name: string,
    public readonly priority: number,
    public readonly weight: number,
    public readonly status: TaskStatus,
    public readonly groupId?: number,
    public readonly description?: string,
    public readonly cancelReason?: string,
    public readonly startDate?: string,
    public readonly deadline?: string,
    public readonly endDate?: string,
    public readonly recurrence?: TaskRecurrence,
  ) {}

  static restore(input: TaskVirtualViewState): TaskVirtualView {
    return new TaskVirtualView(
      input.id,
      input.userId,
      input.name,
      input.priority,
      input.weight,
      input.status,
      input.groupId,
      input.description,
      input.cancelReason,
      input.startDate,
      input.deadline,
      input.endDate,
      input.recurrence,
    );
  }
}

export { TaskVirtualView, TaskVirtualViewState };
