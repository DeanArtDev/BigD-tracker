import { useGroupListUrlQuery } from '@/app/(private)/planner/groups/_model/use-group-list-url-query';
import { useGetGroupList } from '@/entity/planner/groups';
import { inboxInitialRequestVariables } from '@/entity/planner/inbox';

function useGetGroupListByUrlQuery() {
  const [searchQuery] = useGroupListUrlQuery();

  const search = searchQuery?.search;

  const result = useGetGroupList({ limit: 10, search });

  return {
    ...result,
    fetchMore: () =>
      result.fetchMore({
        variables: {
          input: {
            limit: inboxInitialRequestVariables.limit,
            cursor: result.meta?.endCursor,
            search,
          },
        },
      }),
  };
}

export { useGetGroupListByUrlQuery };
