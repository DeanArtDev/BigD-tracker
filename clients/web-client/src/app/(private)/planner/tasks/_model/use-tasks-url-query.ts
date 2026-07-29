import { isEmpty } from 'lodash-es';
import { z } from 'zod';
import { useUrlQuery } from '@/shared/lib/url';
import { TaskPriority, TaskStatus } from '@/shared/transport/graphql';

const tasksSortValues = ['startDateAsc', 'startDateDesc', 'deadlineAsc', 'deadlineDesc'] as const;
const tasksRecurrenceValues = ['onlyRecurring', 'onlyNonRecurring'] as const;

const tasksUrlQuerySchema = z.object({
  tab: z.coerce
    .number()
    .pipe(z.union([z.literal(1), z.literal(2), z.literal(3)]))
    .default(1)
    .optional(),
  priority: z.enum(TaskPriority).array().optional(),
  status: z.enum(TaskStatus).array().optional(),
  search: z
    .string()
    .transform((value) => (isEmpty(value) ? undefined : value))
    .optional(),
  sort: z.enum(tasksSortValues).optional(),
  recurring: z.enum(tasksRecurrenceValues).optional(),
  groupIds: z.coerce.number().array().optional(),
});

type UseTasksUrlQuery = z.infer<typeof tasksUrlQuerySchema>;
type TasksSort = NonNullable<UseTasksUrlQuery['sort']>;
type TasksRecurrence = NonNullable<UseTasksUrlQuery['recurring']>;

function useTasksUrlQuery() {
  return useUrlQuery(tasksUrlQuerySchema, { tab: 1 });
}

export { useTasksUrlQuery, tasksUrlQuerySchema, type TasksRecurrence, type TasksSort, type UseTasksUrlQuery };
