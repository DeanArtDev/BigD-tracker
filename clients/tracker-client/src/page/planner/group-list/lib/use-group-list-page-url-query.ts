import { useUrlQuery } from '@/shared/lib/react/use-url-query';
import z from 'zod';

const groupListPageQuery = z.object({
  search: z.string().optional(),
});

function useGroupListPageUrlQuery() {
  const [pageQuery, setPageQuery] = useUrlQuery(groupListPageQuery);

  return {
    pageQuery,
    setPageQuery,
  };
}

export { useGroupListPageUrlQuery };
