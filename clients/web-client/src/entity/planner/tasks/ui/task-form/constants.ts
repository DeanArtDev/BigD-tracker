import { TaskRecurrenceWeekday } from '@/shared/transport/graphql';

const taskRecurrenceWeekdayToHumanize: Record<TaskRecurrenceWeekday, string> = {
  [TaskRecurrenceWeekday.Mo]: 'пн',
  [TaskRecurrenceWeekday.Tu]: 'вт',
  [TaskRecurrenceWeekday.We]: 'ср',
  [TaskRecurrenceWeekday.Th]: 'чт',
  [TaskRecurrenceWeekday.Fr]: 'пт',
  [TaskRecurrenceWeekday.Sa]: 'сб',
  [TaskRecurrenceWeekday.Su]: 'вс',
};

export { taskRecurrenceWeekdayToHumanize };
