import { TaskSettingsView } from './task-settings.view';

interface TaskRecurrenceOverrideSettingsViewState {
  readonly taskRecurrenceOverrideId: number;
  readonly isAllDay: boolean;
  readonly icon?: string | null;
}

type TaskRecurrenceOverrideSettingsViewPatch = Partial<
  Omit<TaskRecurrenceOverrideSettingsViewState, 'taskRecurrenceOverrideId'>
>;

class TaskRecurrenceOverrideSettingsView {
  constructor(
    public readonly taskRecurrenceOverrideId: number,
    public readonly isAllDay: boolean,
    public readonly icon?: string,
  ) {}

  static create(input: {
    taskRecurrenceOverrideId: number;
    taskSettings: TaskSettingsView;
  }): TaskRecurrenceOverrideSettingsView {
    return TaskRecurrenceOverrideSettingsView.restore({
      taskRecurrenceOverrideId: input.taskRecurrenceOverrideId,
      isAllDay: input.taskSettings.isAllDay,
      icon: input.taskSettings.icon,
    });
  }

  static restore(input: TaskRecurrenceOverrideSettingsViewState): TaskRecurrenceOverrideSettingsView {
    return new TaskRecurrenceOverrideSettingsView(
      input.taskRecurrenceOverrideId,
      input.isAllDay,
      input.icon ?? undefined,
    );
  }

  isEqual(other: TaskRecurrenceOverrideSettingsView): boolean {
    return (
      this.taskRecurrenceOverrideId === other.taskRecurrenceOverrideId &&
      this.isAllDay === other.isAllDay &&
      this.icon === other.icon
    );
  }
}

export {
  TaskRecurrenceOverrideSettingsView,
  TaskRecurrenceOverrideSettingsViewPatch,
  TaskRecurrenceOverrideSettingsViewState,
};
