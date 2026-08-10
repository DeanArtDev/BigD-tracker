import { describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_HTTP_API_URL = 'http://localhost:3000';
  process.env.NEXT_PUBLIC_WS_API_URL = 'ws://localhost:3000';
});

import { RecurrenceFrequency, TaskPriority, TaskRecurrenceWeekday } from '@/shared/transport/graphql/schema-types';
import { taskFormSchema, type GroupBrand } from './task-form-schema';

const baseFormData = {
  name: 'Recurring task',
  priority: TaskPriority.Do,
  isDescriptionDirty: false,
  startDate: new Date(2026, 7, 10, 7, 30),
  deadline: new Date(2026, 7, 10, 12, 0),
};

describe('taskFormSchema', () => {
  it('does not transform stale recurrence fields when recurrence is disabled', () => {
    const untilDate = new Date(2026, 9, 19, 23, 59);

    const result = taskFormSchema<GroupBrand>().parse({
      ...baseFormData,
      isRecurrence: false,
      isEndless: false,
      untilDate,
      frequency: RecurrenceFrequency.Weekly,
      weekdays: [TaskRecurrenceWeekday.Mo],
      monthdays: null,
    });

    expect(result).toMatchObject({
      isRecurrence: false,
      isEndless: false,
      untilDate,
      frequency: RecurrenceFrequency.Weekly,
    });
  });

  it('transforms untilDate to the end of day for a finite recurrence', () => {
    const result = taskFormSchema<GroupBrand>().parse({
      ...baseFormData,
      isRecurrence: true,
      isEndless: false,
      untilDate: new Date(2026, 9, 19, 10, 15),
      frequency: RecurrenceFrequency.Weekly,
      weekdays: [TaskRecurrenceWeekday.Mo],
      monthdays: null,
    });

    expect(result).toMatchObject({
      isRecurrence: true,
      isEndless: false,
      untilDate: '2026-10-19T23:59',
      frequency: RecurrenceFrequency.Weekly,
      weekdays: [TaskRecurrenceWeekday.Mo],
    });
  });

  it('rejects a recurrence ending before its start date', () => {
    const result = taskFormSchema<GroupBrand>().safeParse({
      ...baseFormData,
      isRecurrence: true,
      isEndless: false,
      untilDate: new Date(2026, 7, 9, 10, 15),
      frequency: RecurrenceFrequency.Weekly,
      weekdays: [TaskRecurrenceWeekday.Mo],
      monthdays: null,
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({
          path: ['untilDate'],
          code: 'custom',
          message: 'Дата завершения повторения не должна быть раньше даты начала',
        }),
      );
    }
  });
});
