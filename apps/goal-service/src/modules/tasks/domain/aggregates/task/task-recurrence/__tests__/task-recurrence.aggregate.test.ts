import { RecurrenceFrequency, TaskRecurrenceStatus, TaskRecurrenceWeekday } from '@big-d/api-contracts';
import { DateVo, TimezoneVo } from '@big-d/api-utils';
import { TaskRecurrence } from '../task-recurrence.aggregate';

describe('TaskRecurrence aggregate', () => {
  it('creates weekly recurrence with weekdays', () => {
    const recurrence = TaskRecurrence.create({
      userId: 1,
      taskId: 11,
      status: TaskRecurrenceStatus.ACTIVE,
      timezone: TimezoneVo.create('UTC'),
      startDate: DateVo.create('2026-03-01T10:00'),
      pattern: 'RRULE:FREQ=WEEKLY;BYDAY=MO',
      frequency: RecurrenceFrequency.WEEKLY,
      weekstart: TaskRecurrenceWeekday.MO,
      weekdays: [TaskRecurrenceWeekday.MO],
    });

    expect(recurrence.weekdays).toEqual([TaskRecurrenceWeekday.MO]);
    expect(recurrence.frequency.value).toBe(RecurrenceFrequency.WEEKLY);
  });

  it('rejects weekly recurrence without weekdays on create', () => {
    expect(() =>
      TaskRecurrence.create({
        userId: 1,
        taskId: 11,
        status: TaskRecurrenceStatus.ACTIVE,
        timezone: TimezoneVo.create('UTC'),
        startDate: DateVo.create('2026-03-01T10:00'),
        pattern: 'RRULE:FREQ=WEEKLY',
        frequency: RecurrenceFrequency.WEEKLY,
        weekstart: TaskRecurrenceWeekday.MO,
      }),
    ).toThrow('INVARIANT_FAILED');
  });

  it('rejects weekly recurrence without weekdays on replace', () => {
    const recurrence = TaskRecurrence.create({
      userId: 1,
      taskId: 11,
      status: TaskRecurrenceStatus.ACTIVE,
      timezone: TimezoneVo.create('UTC'),
      startDate: DateVo.create('2026-03-01T10:00'),
      pattern: 'RRULE:FREQ=DAILY',
      frequency: RecurrenceFrequency.DAILY,
      weekstart: TaskRecurrenceWeekday.MO,
    });

    expect(() =>
      recurrence.replace({
        startDate: DateVo.create('2026-03-01T10:00'),
        pattern: 'RRULE:FREQ=WEEKLY',
        frequency: RecurrenceFrequency.WEEKLY,
        weekstart: TaskRecurrenceWeekday.MO,
      }),
    ).toThrow('INVARIANT_FAILED');
  });

  it('restores weekly recurrence without weekdays', () => {
    const recurrence = TaskRecurrence.restore({
      id: 1,
      userId: 1,
      taskId: 11,
      status: TaskRecurrenceStatus.ACTIVE,
      timezone: TimezoneVo.create('UTC'),
      startDate: DateVo.create('2026-03-01T10:00'),
      pattern: 'RRULE:FREQ=WEEKLY',
      frequency: RecurrenceFrequency.WEEKLY,
      weekstart: TaskRecurrenceWeekday.MO,
    });

    expect(recurrence.frequency.value).toBe(RecurrenceFrequency.WEEKLY);
    expect(recurrence.weekdays).toBeUndefined();
  });
});
