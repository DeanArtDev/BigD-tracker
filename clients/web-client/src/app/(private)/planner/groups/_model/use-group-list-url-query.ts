import { isEmpty } from 'lodash-es';
import { z } from 'zod';
import { useUrlQuery } from '@/shared/lib/url';

const groupListUrlQuerySchema = z.object({
  search: z
    .string()
    .transform((value) => (isEmpty(value) ? undefined : value))
    .optional(),
});

type UseGroupListUrlQuery = z.infer<typeof groupListUrlQuerySchema>;

function useGroupListUrlQuery() {
  return useUrlQuery(groupListUrlQuerySchema);
}

export { useGroupListUrlQuery, groupListUrlQuerySchema, type UseGroupListUrlQuery };
