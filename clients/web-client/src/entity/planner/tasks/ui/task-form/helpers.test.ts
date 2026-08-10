import { describe, expect, it } from 'vitest';
import {
  RecurrenceFrequency,
  TaskPriority,
  TaskRecurrenceWeekday,
  TaskStatus,
} from '@/shared/transport/graphql/schema-types';
import type { Task } from '../../model';
import type { GroupBrand, TaskSubmitFormData } from './context/task-form-provider/task-form-schema';
import { getRecurrenceFromTaskFormData, getTaskFormValues } from './helpers';

type FormData = TaskSubmitFormData<GroupBrand>;

function getTask(overrides: Record<string, unknown> = {}): Task<GroupBrand> {
  return {
    id: 'o::1',
    name: 'Task',
    priority: TaskPriority.Do,
    status: TaskStatus.NotStarted,
    ...overrides,
  } as Task<GroupBrand>;
}

function getRecurringFormData(overrides: Record<string, unknown> = {}): FormData {
  return {
    name: 'Task',
    priority: TaskPriority.Do,
    isDescriptionDirty: false,
    startDate: '2026-08-10T09:00',
    deadline: '2026-08-10T10:00',
    isRecurrence: true,
    isEndless: true,
    untilDate: undefined,
    frequency: RecurrenceFrequency.Daily,
    weekdays: null,
    monthdays: null,
    ...overrides,
  } as FormData;
}

describe('getRecurrenceFromTaskFormData', () => {
  it('returns null for a non-recurring task', () => {
    const formData = {
      name: 'Task',
      priority: TaskPriority.Do,
      isDescriptionDirty: false,
      isRecurrence: false,
    } as FormData;

    expect(getRecurrenceFromTaskFormData(formData)).toBeNull();
  });

  it('returns only common recurrence fields for a daily recurrence', () => {
    expect(getRecurrenceFromTaskFormData(getRecurringFormData())).toEqual({
      frequency: RecurrenceFrequency.Daily,
      startDate: '2026-08-10T09:00',
      untilDate: undefined,
    });
  });

  it('returns weekdays for a finite weekly recurrence', () => {
    expect(
      getRecurrenceFromTaskFormData(
        getRecurringFormData({
          frequency: RecurrenceFrequency.Weekly,
          isEndless: false,
          untilDate: '2026-09-10T00:00',
          weekdays: ['MO', 'FR'],
        }),
      ),
    ).toEqual({
      frequency: RecurrenceFrequency.Weekly,
      startDate: '2026-08-10T09:00',
      untilDate: '2026-09-10T00:00',
      weekdays: ['MO', 'FR'],
    });
  });

  it('returns month days for a monthly recurrence', () => {
    expect(
      getRecurrenceFromTaskFormData(
        getRecurringFormData({
          frequency: RecurrenceFrequency.Monthly,
          monthdays: [1, 15],
        }),
      ),
    ).toEqual({
      frequency: RecurrenceFrequency.Monthly,
      startDate: '2026-08-10T09:00',
      untilDate: undefined,
      monthdays: [1, 15],
    });
  });

  it('rejects a finite recurrence without an end date', () => {
    const formData = getRecurringFormData({ isEndless: false, untilDate: undefined });

    expect(() => getRecurrenceFromTaskFormData(formData)).toThrow('Finite recurrence must have untilDate');
  });
});

describe('getTaskFormValues', () => {
  it('returns the non-recurring form branch', () => {
    expect(getTaskFormValues(getTask())).toMatchObject({
      name: 'Task',
      isRecurrence: false,
      isEndless: true,
      untilDate: null,
      frequency: null,
      weekdays: null,
      monthdays: null,
    });
  });

  it('returns the finite weekly recurrence branch with Date values', () => {
    const values = getTaskFormValues(
      getTask({
        startDate: '2026-08-10T09:00',
        deadline: '2026-08-10T10:00',
        recurrence: {
          frequency: RecurrenceFrequency.Weekly,
          startDate: '2026-08-10T09:00',
          untilDate: '2026-09-10T00:00',
          weekdays: [TaskRecurrenceWeekday.Mo, TaskRecurrenceWeekday.Fr],
        },
      }),
    );

    expect(values).toMatchObject({
      isRecurrence: true,
      isEndless: false,
      frequency: RecurrenceFrequency.Weekly,
      startDate: new Date(2026, 7, 10, 9, 0),
      deadline: new Date(2026, 7, 10, 10, 0),
      untilDate: new Date(2026, 8, 10, 0, 0),
      weekdays: [TaskRecurrenceWeekday.Mo, TaskRecurrenceWeekday.Fr],
      monthdays: null,
    });
  });

  it('returns the endless recurrence branch without an end date', () => {
    const values = getTaskFormValues(
      getTask({
        startDate: '2026-08-10T09:00',
        deadline: '2026-08-10T10:00',
        recurrence: {
          frequency: RecurrenceFrequency.Daily,
          startDate: '2026-08-10T09:00',
        },
      }),
    );

    expect(values).toMatchObject({
      isRecurrence: true,
      isEndless: true,
      untilDate: null,
      frequency: RecurrenceFrequency.Daily,
    });
  });

  it('rejects a recurring task without required dates', () => {
    const task = getTask({
      recurrence: {
        frequency: RecurrenceFrequency.Daily,
        startDate: '2026-08-10T09:00',
      },
    });

    expect(() => getTaskFormValues(task)).toThrow('Recurring task must have startDate and deadline');
  });
});
