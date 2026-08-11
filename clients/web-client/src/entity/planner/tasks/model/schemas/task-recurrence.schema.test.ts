import { describe, expect, it } from 'vitest';
import { RecurrenceFrequency, TaskRecurrenceWeekday } from '@/shared/transport/graphql';
import { taskRecurrenceSchema } from './task-recurrence.schema';

describe('taskRecurrenceSchema', () => {
  it('parses a valid recurrence', () => {
    const recurrence = {
      frequency: RecurrenceFrequency.Weekly,
      interval: 2,
      monthdays: null,
      startDate: '2026-08-10T07:30',
      untilDate: '2026-10-19T23:59',
      weekdays: [TaskRecurrenceWeekday.Mo],
    };

    expect(taskRecurrenceSchema.parse(recurrence)).toEqual(recurrence);
  });

  it('rejects a recurrence without required fields', () => {
    expect(
      taskRecurrenceSchema.safeParse({
        weekdays: [TaskRecurrenceWeekday.Mo],
      }).success,
    ).toBe(false);
  });

  it('rejects invalid recurrence values', () => {
    expect(
      taskRecurrenceSchema.safeParse({
        frequency: RecurrenceFrequency.Weekly,
        startDate: '2026-08-10T07:30',
        interval: 1.5,
        weekdays: ['MONDAY'],
      }).success,
    ).toBe(false);
  });
});
