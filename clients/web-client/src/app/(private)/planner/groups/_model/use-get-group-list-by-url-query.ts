import { useGetGroupList } from '@/entity/planner/groups';
import { useGroupListUrlQuery } from './use-group-list-url-query';

const requestLimit = 11;

function useGetGroupListByUrlQuery() {
  const [searchQuery] = useGroupListUrlQuery();

  const search = searchQuery?.search;

  const result = useGetGroupList({ limit: requestLimit, search });

  return {
    ...result,
    initialLoading: result.networkStatus === 1 && result.data == null,
    hasSearch: (search?.trim().length ?? 0) > 0,
    fetchMore: () =>
      result.fetchMore({
        variables: {
          input: {
            limit: requestLimit,
            cursor: result.meta?.endCursor,
            search,
          },
        },
      }),
  };
}

export { useGetGroupListByUrlQuery };
