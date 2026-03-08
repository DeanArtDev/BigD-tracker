import { RecurrenceFrequency, TaskRecurrenceWeekday } from '@big-d/api-contracts';

interface TaskRecurrenceValues {
  startDate: string;
  frequency: RecurrenceFrequency;
  untilDate?: string;
  interval?: number;
  weekstart?: TaskRecurrenceWeekday;
  weekdays?: TaskRecurrenceWeekday[];
  monthdays?: number[];
  yearmonths?: number[];
}

export { TaskRecurrenceValues };
