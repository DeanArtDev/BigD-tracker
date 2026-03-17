import { TaskPriority, TaskRecurrenceFrequency, TaskRecurrenceWeekday } from '../model';

const taskPriorityEnumSchema = Object.values(TaskPriority)
  .filter((v) => typeof v === 'number')
  .map(String);

const taskRecurrenceFrequencyEnumSchema = Object.values(TaskRecurrenceFrequency)
  .filter((v) => typeof v === 'number')
  .map(String);

const taskTaskRecurrenceWeekdayEnumSchema = Object.values(TaskRecurrenceWeekday)
  .filter((v) => typeof v === 'number')
  .map(String);

export { taskPriorityEnumSchema, taskRecurrenceFrequencyEnumSchema, taskTaskRecurrenceWeekdayEnumSchema };
