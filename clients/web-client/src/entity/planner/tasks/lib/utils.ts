import { timeAndDate, type TimeAndDateValue } from '@big-d/time';
import { taskRecurrenceSchema } from '@/entity/planner/tasks';
import type { TaskUpdateInput } from '@/shared/transport/graphql';

class TaskUtils {
  static formatTaskDate(value: TimeAndDateValue) {
    const date = timeAndDate(value);

    if (date.isToday()) {
      return `Сегодня, ${date.format('HH:mm')}`;
    }

    if (date.isYesterday()) {
      return `Вчера, ${date.format('HH:mm')}`;
    }

    return date.format('D MMMM, HH:mm');
  }

  static getSafetyRecurrence = (value: unknown) => {
    return taskRecurrenceSchema.safeParse(value)?.data ?? null;
  };

  static getSafetyRecurrenceInput = (value: unknown): TaskUpdateInput['recurrence'] => {
    const recurrence = this.getSafetyRecurrence(value);
    return recurrence != null
      ? {
          frequency: recurrence.frequency,
          startDate: recurrence.startDate,
          untilDate: recurrence.untilDate,
          interval: recurrence.interval,
          weekdays: recurrence.weekdays != null ? [...recurrence.weekdays] : recurrence.weekdays,
          monthdays: recurrence.monthdays != null ? [...recurrence.monthdays] : recurrence.monthdays,
        }
      : null;
  };
}

export { TaskUtils };
