import { TaskRecurrenceOverrideSettingsView } from '../task-recurrence-override-settings.view';
import { TaskSettingsView } from '../task-settings.view';

describe('TaskRecurrenceOverrideSettingsView', () => {
  test('create copies settings from master task', () => {
    const taskSettings = TaskSettingsView.restore({ taskId: 42, isAllDay: true, icon: 'folder' });

    expect(TaskRecurrenceOverrideSettingsView.create({ taskRecurrenceOverrideId: 15, taskSettings })).toEqual(
      new TaskRecurrenceOverrideSettingsView(15, true, 'folder'),
    );
  });

  test('restore maps null icon to undefined', () => {
    expect(
      TaskRecurrenceOverrideSettingsView.restore({
        taskRecurrenceOverrideId: 15,
        isAllDay: false,
        icon: null,
      }),
    ).toEqual(new TaskRecurrenceOverrideSettingsView(15, false));
  });

  test('isEqual compares all settings fields', () => {
    const settings = new TaskRecurrenceOverrideSettingsView(15, false, 'folder');
    const sameSettings = TaskRecurrenceOverrideSettingsView.restore({ ...settings });
    const changedSettings = TaskRecurrenceOverrideSettingsView.restore({ ...settings, isAllDay: true });

    expect(settings.isEqual(sameSettings)).toBe(true);
    expect(settings.isEqual(changedSettings)).toBe(false);
  });
});
