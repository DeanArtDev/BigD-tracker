import { DEFAULT_TASK_SETTINGS } from '@/modules/tasks/domain/constants';
import { TaskSettingsView } from '../task-settings.view';

describe('TaskSettingsView', () => {
  test('create returns default settings for task', () => {
    expect(TaskSettingsView.create({ taskId: 42 })).toMatchObject({ taskId: 42, ...DEFAULT_TASK_SETTINGS });
  });

  test('restore returns persisted settings and maps null icon to undefined', () => {
    expect(TaskSettingsView.restore({ taskId: 42, isAllDay: true, icon: 'folder' })).toEqual(
      new TaskSettingsView(42, true, 'folder'),
    );
    expect(TaskSettingsView.restore({ taskId: 42, isAllDay: false, icon: null })).toEqual(
      new TaskSettingsView(42, false),
    );
  });

  test('isEqual compares all settings fields', () => {
    const settings = TaskSettingsView.create({ taskId: 42 });
    const sameSettings = TaskSettingsView.restore({ ...settings });
    const changedSettings = TaskSettingsView.restore({ ...settings, isAllDay: true });

    expect(settings.isEqual(sameSettings)).toBe(true);
    expect(settings.isEqual(changedSettings)).toBe(false);
  });
});
