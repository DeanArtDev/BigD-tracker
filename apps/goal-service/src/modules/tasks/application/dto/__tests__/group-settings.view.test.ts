import { DEFAULT_GROUP_SETTINGS } from '@/modules/tasks/domain/constants';
import { GroupSettingsView } from '../group-settings.view';

describe('GroupSettingsView', () => {
  test('create returns default settings for group', () => {
    const settings = GroupSettingsView.create({ groupId: 42 });

    expect(settings).toBeInstanceOf(GroupSettingsView);
    expect(settings).toMatchObject({ groupId: 42, ...DEFAULT_GROUP_SETTINGS });
  });

  test('restore returns settings from persisted state', () => {
    const state = {
      groupId: 42,
      eventColor: '#111111',
      eventSelectedColor: '#222222',
      lineColor: '#333333',
      textColor: '#444444',
      eventColorDark: '#555555',
      eventSelectedColorDark: '#666666',
      lineColorDark: '#777777',
      textColorDark: '#888888',
      isDefault: true,
      isVisible: false,
      isReadonly: true,
    };

    const settings = GroupSettingsView.restore(state);

    expect(settings).toBeInstanceOf(GroupSettingsView);
    expect(settings).toMatchObject(state);
  });

  test('isEqual compares all settings fields', () => {
    const settings = GroupSettingsView.create({ groupId: 42 });
    const sameSettings = GroupSettingsView.restore({ ...settings });
    const changedSettings = GroupSettingsView.restore({ ...settings, eventColor: '#ABCDEF' });

    expect(settings.isEqual(sameSettings)).toBe(true);
    expect(settings.isEqual(changedSettings)).toBe(false);
  });
});
