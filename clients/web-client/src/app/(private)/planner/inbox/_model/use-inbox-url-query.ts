import { isEmpty } from 'lodash-es';
import { z } from 'zod';
import { taskPriorityEnumSchema } from '@/entity/planner/tasks';
import { TaskStatus } from '@/entity/schema-types';
import { useUrlQuery } from '@/shared/lib/url';

const inboxUrlQuerySchema = z.object({
  status: z.enum(TaskStatus).array().optional(),
  priority: z.enum(taskPriorityEnumSchema).array().optional(),

  search: z
    .string()
    .transform((value) => (isEmpty(value) ? undefined : value))
    .optional(),
});

type UseInboxUrlQuery = z.infer<typeof inboxUrlQuerySchema>;

function useInboxUrlQuery() {
  return useUrlQuery(inboxUrlQuerySchema);
}

export { useInboxUrlQuery, inboxUrlQuerySchema, type UseInboxUrlQuery };
