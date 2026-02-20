import { TaskStatus } from '@/entity/planner/tasks';
import { SortDirection } from '@/shared/lib/constants';
import { useUrlQuery } from '@/shared/lib/react/use-url-query';
import z from 'zod';

const tasksPageQuery = z.object({
  search: z.string().optional(),
  filter: z
    .object({
      status: z.array(z.enum(TaskStatus)).or(z.undefined()).optional().catch(undefined),
      priority: z.coerce.number().min(1).max(4).or(z.undefined()).catch(undefined).optional(),
    })
    .optional(),

  sort: z
    .object({
      deadline: z.enum(SortDirection).or(z.undefined()).catch(undefined).optional(),
      startDate: z.enum(SortDirection).or(z.undefined()).catch(undefined).optional(),
      priority: z.enum(SortDirection).or(z.undefined()).catch(undefined).optional(),
    })
    .optional(),
});

function useTaskPageUrlQuery() {
  const [pageQuery, setPageQuery] = useUrlQuery(tasksPageQuery);

  return {
    pageQuery,
    setPageQuery,
  };
}

export { useTaskPageUrlQuery };
