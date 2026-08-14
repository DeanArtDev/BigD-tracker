import { describe, expect, it } from 'vitest';

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
  it('does not validate or transform recurrence fields when recurrence is disabled', () => {
    const untilDate = new Date(2026, 9, 19, 23, 59);

    const result = taskFormSchema<GroupBrand>().parse({
      ...baseFormData,
      isRecurrence: false,
      isEndless: false,
      untilDate,
      frequency: RecurrenceFrequency.Weekly,
      weekdays: [],
      monthdays: null,
    });

    expect(result).toMatchObject({
      isRecurrence: false,
      isEndless: false,
      untilDate,
      frequency: RecurrenceFrequency.Weekly,
      weekdays: [],
    });
  });

  it.each([false, true])('always validates base fields when isRecurrence is %s', (isRecurrence) => {
    const recurrenceValues = isRecurrence
      ? {
          isRecurrence: true,
          isEndless: true,
          untilDate: null,
          frequency: RecurrenceFrequency.Daily,
          weekdays: null,
          monthdays: null,
        }
      : {
          isRecurrence: false,
          isEndless: true,
          untilDate: null,
          frequency: null,
          weekdays: null,
          monthdays: null,
        };

    const result = taskFormSchema<GroupBrand>().safeParse({ ...baseFormData, ...recurrenceValues, name: 'a' });

    expect(result.success).toBe(false);
  });

  it.each([false, true])('always validates base date order when isRecurrence is %s', (isRecurrence) => {
    const recurrenceValues = isRecurrence
      ? {
          isRecurrence: true,
          isEndless: true,
          untilDate: null,
          frequency: RecurrenceFrequency.Daily,
          weekdays: null,
          monthdays: null,
        }
      : {
          isRecurrence: false,
          isEndless: true,
          untilDate: null,
          frequency: null,
          weekdays: null,
          monthdays: null,
        };

    const result = taskFormSchema<GroupBrand>().safeParse({
      ...baseFormData,
      ...recurrenceValues,
      startDate: new Date(2026, 7, 10, 12, 0),
      deadline: new Date(2026, 7, 10, 7, 30),
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({
          path: ['deadline'],
          code: 'custom',
          message: 'Дедлайн не может быть позже или равен началу',
        }),
      );
    }
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

  it('requires weekdays for a weekly recurrence', () => {
    const result = taskFormSchema<GroupBrand>().safeParse({
      ...baseFormData,
      isRecurrence: true,
      isEndless: true,
      untilDate: null,
      frequency: RecurrenceFrequency.Weekly,
      weekdays: [],
      monthdays: null,
    });

    expect(result.success).toBe(false);
  });

  it('does not require untilDate for an endless recurrence', () => {
    const result = taskFormSchema<GroupBrand>().safeParse({
      ...baseFormData,
      isRecurrence: true,
      isEndless: true,
      untilDate: null,
      frequency: RecurrenceFrequency.Daily,
      weekdays: null,
      monthdays: null,
    });

    expect(result.success).toBe(true);
  });

  it('requires untilDate for a finite recurrence', () => {
    const result = taskFormSchema<GroupBrand>().safeParse({
      ...baseFormData,
      isRecurrence: true,
      isEndless: false,
      untilDate: null,
      frequency: RecurrenceFrequency.Daily,
      weekdays: null,
      monthdays: null,
    });

    expect(result.success).toBe(false);
  });
});
