import { GroupId } from '@/entity/planner/groups';
import { useGetGroupList } from '@/shared/transport/graphql';
import { useGroupListUrlQuery } from './use-group-list-url-query';

const requestLimit = 17;

function useGetGroupListByUrlQuery() {
  const [searchQuery] = useGroupListUrlQuery();

  const search = searchQuery?.search;

  const result = useGetGroupList<GroupId>({ limit: requestLimit, search });

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
