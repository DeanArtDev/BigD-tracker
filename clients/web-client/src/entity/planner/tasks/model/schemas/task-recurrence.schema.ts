import { z } from 'zod';
import { RecurrenceFrequency, TaskRecurrenceWeekday } from '@/shared/transport/graphql';
import type { Task } from '../domain/task';

type TaskRecurrence = NonNullable<Task['recurrence']>;

const taskRecurrenceSchema: z.ZodType<TaskRecurrence> = z.object({
  frequency: z.enum(RecurrenceFrequency),
  interval: z.number().int().nullable().optional(),
  monthdays: z.array(z.number().int()).nullable().optional(),
  startDate: z.string(),
  untilDate: z.string().nullable().optional(),
  weekdays: z.array(z.enum(TaskRecurrenceWeekday)).nullable().optional(),
});

export { taskRecurrenceSchema };
