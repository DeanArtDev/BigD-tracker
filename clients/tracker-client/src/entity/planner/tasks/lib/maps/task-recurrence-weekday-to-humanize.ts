import { TaskRecurrenceWeekday } from '@/entity/planner/tasks';

const taskRecurrenceWeekdayToHumanize: Record<TaskRecurrenceWeekday, string> = {
  [TaskRecurrenceWeekday.MO]: 'пн',
  [TaskRecurrenceWeekday.TU]: 'вт',
  [TaskRecurrenceWeekday.WE]: 'ср',
  [TaskRecurrenceWeekday.TH]: 'чт',
  [TaskRecurrenceWeekday.FR]: 'пт',
  [TaskRecurrenceWeekday.SA]: 'сб',
  [TaskRecurrenceWeekday.SU]: 'вс',
};

export { taskRecurrenceWeekdayToHumanize };
