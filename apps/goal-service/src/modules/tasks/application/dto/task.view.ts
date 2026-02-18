import { TaskStatus } from '@big-d/api-contracts';

interface TaskViewState {
  readonly id: number;
  readonly userId: number;
  readonly groupId?: number;
  readonly name: string;
  readonly description?: string;
  readonly priority: number;
  readonly weight: number;
  readonly cancelReason?: string;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly deadline?: string;
  readonly status: TaskStatus;
  readonly recurrence?: string;
}

class TaskView {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly name: string,
    public readonly priority: number,
    public readonly weight: number,
    public readonly status: TaskStatus,
    public readonly groupId?: number,
    public readonly description?: string,
    public readonly cancelReason?: string,
    public readonly startDate?: string,
    public readonly endDate?: string,
    public readonly deadline?: string,
    public readonly recurrence?: string,
  ) {}

  static restore(input: TaskViewState): TaskView {
    return new TaskView(
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
      input.endDate,
      input.deadline,
      input.recurrence,
    );
  }
}

export { TaskView, TaskViewState };
