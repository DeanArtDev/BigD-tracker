const INBOX_GROUP_NAME = 'INBOX';

const DEFAULT_GROUP_SETTINGS = {
  eventColor: '#F3F4F6',
  eventSelectedColor: '#E5E7EB',
  lineColor: '#D1D5DB',
  textColor: '#4B5563',
  eventColorDark: '#1F3A32',
  eventSelectedColorDark: '#2A4D42',
  lineColorDark: '#477568',
  textColorDark: '#D7E5E0',
  isDefault: false,
  isVisible: true,
  isReadonly: false,
} as const;

const DEFAULT_TASK_SETTINGS = {
  isAllDay: false,
} as const;

export { DEFAULT_GROUP_SETTINGS, DEFAULT_TASK_SETTINGS, INBOX_GROUP_NAME };
