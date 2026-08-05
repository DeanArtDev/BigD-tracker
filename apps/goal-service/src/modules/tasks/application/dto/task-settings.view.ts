import { DEFAULT_TASK_SETTINGS } from '@/modules/tasks/domain/constants';

interface TaskSettingsViewState {
  readonly taskId: number;
  readonly isAllDay: boolean;
  readonly icon?: string | null;
}

type TaskSettingsViewPatch = Partial<Omit<TaskSettingsViewState, 'taskId'>>;

class TaskSettingsView {
  constructor(
    public readonly taskId: number,
    public readonly isAllDay: boolean,
    public readonly icon?: string,
  ) {}

  static create(input: { taskId: number }): TaskSettingsView {
    return TaskSettingsView.restore({ taskId: input.taskId, ...DEFAULT_TASK_SETTINGS });
  }

  static restore = (input: TaskSettingsViewState): TaskSettingsView => {
    return new TaskSettingsView(input.taskId, input.isAllDay, input.icon ?? undefined);
  };

  isEqual(other: TaskSettingsView): boolean {
    return this.taskId === other.taskId && this.isAllDay === other.isAllDay && this.icon === other.icon;
  }
}

export { TaskSettingsView, TaskSettingsViewPatch, TaskSettingsViewState };
