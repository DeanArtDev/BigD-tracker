import { RecurrenceFrequency, TaskRecurrenceStatus, TaskRecurrenceWeekday, TaskStatus } from '@big-d/api-contracts';
import { TaskView } from '../task.view';

describe('TaskView', () => {
  it('hides recurrence when recurrence status is CANCELED', () => {
    const view = TaskView.restore({
      id: '1',
      userId: 77,
      name: 'Task',
      priority: 1,
      weight: 1,
      status: TaskStatus.IN_PROGRESS,
      recurrence: {
        startDate: '2026-03-02T10:00:00.000Z',
        frequency: RecurrenceFrequency.DAILY,
        weekstart: TaskRecurrenceWeekday.MO,
        status: TaskRecurrenceStatus.CANCELED,
      },
    });

    expect(view.recurrence).toBeUndefined();
  });

  it('keeps recurrence when recurrence status is ACTIVE', () => {
    const view = TaskView.restore({
      id: '1',
      userId: 77,
      name: 'Task',
      priority: 1,
      weight: 1,
      status: TaskStatus.IN_PROGRESS,
      recurrence: {
        startDate: '2026-03-02T10:00:00.000Z',
        untilDate: '2026-03-10T10:00:00.000Z',
        frequency: RecurrenceFrequency.WEEKLY,
        interval: 2,
        weekstart: TaskRecurrenceWeekday.MO,
        weekdays: [TaskRecurrenceWeekday.MO, TaskRecurrenceWeekday.FR],
        status: TaskRecurrenceStatus.ACTIVE,
      },
    });

    expect(view.recurrence).toEqual({
      startDate: '2026-03-02T10:00:00.000Z',
      untilDate: '2026-03-10T10:00:00.000Z',
      frequency: RecurrenceFrequency.WEEKLY,
      interval: 2,
      weekstart: TaskRecurrenceWeekday.MO,
      weekdays: [TaskRecurrenceWeekday.MO, TaskRecurrenceWeekday.FR],
      monthdays: undefined,
      yearmonths: undefined,
    });
  });
});
