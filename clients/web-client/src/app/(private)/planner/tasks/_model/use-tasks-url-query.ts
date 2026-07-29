import { isEmpty } from 'lodash-es';
import { Dispatch, SetStateAction, useCallback } from 'react';
import { z } from 'zod';
import { useUrlQuery } from '@/shared/lib/url';
import { TaskPriority, TaskStatus } from '@/shared/transport/graphql';

const tasksSortValues = ['startDateAsc', 'startDateDesc', 'deadlineAsc', 'deadlineDesc'] as const;
const tasksRecurrenceValues = ['onlyRecurring', 'onlyNonRecurring'] as const;

const tasksTabUrlQuerySchema = z.object({
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

const tasksUrlQuerySchema = z.object({
  tab: z.coerce
    .number()
    .pipe(z.union([z.literal(1), z.literal(2), z.literal(3)]))
    .default(1)
    .optional(),
  current: tasksTabUrlQuerySchema.optional(),
  archived: tasksTabUrlQuerySchema.optional(),
  deleted: tasksTabUrlQuerySchema.optional(),
});

type TasksTab = 'current' | 'archived' | 'deleted';
type TasksTabUrlQuery = z.infer<typeof tasksTabUrlQuerySchema>;
type UseTasksUrlQuery = z.infer<typeof tasksUrlQuerySchema>;
type TasksSort = NonNullable<TasksTabUrlQuery['sort']>;
type TasksRecurrence = NonNullable<TasksTabUrlQuery['recurring']>;

function useTasksUrlQuery() {
  return useUrlQuery(tasksUrlQuerySchema);
}

function useTasksTabUrlQuery<TTab extends TasksTab>(
  tab: TTab,
): [UseTasksUrlQuery[TTab] | undefined, Dispatch<SetStateAction<TasksTabUrlQuery>>] {
  const [searchQuery, setSearchQuery] = useTasksUrlQuery();

  const setTabSearchQuery = useCallback<Dispatch<SetStateAction<TasksTabUrlQuery>>>(
    (value) => {
      setSearchQuery((previousQuery) => {
        const previousTabQuery = previousQuery?.[tab] ?? {};
        const nextTabQuery = typeof value === 'function' ? value(previousTabQuery) : value;

        return {
          ...previousQuery,
          [tab]: nextTabQuery,
        };
      });
    },
    [setSearchQuery, tab],
  );

  return [searchQuery?.[tab], setTabSearchQuery];
}

export {
  useTasksTabUrlQuery,
  useTasksUrlQuery,
  tasksUrlQuerySchema,
  type TasksRecurrence,
  type TasksSort,
  type TasksTab,
  type TasksTabUrlQuery,
  type UseTasksUrlQuery,
};
